"""
SnapBudget — inference.py
Pipeline AI end-to-end: Donut + BiLSTM + GRU + FinancialRecommender

Cara pakai di FastAPI:
    from inference import load_all_models, run_head1, run_head2, run_head3
    models = load_all_models()
    result = run_head1(image, models)

CC26-PSU098 | Coding Camp 2026 DBS Foundation
"""

import os, re, json, time, pickle, warnings
import numpy as np
from pathlib import Path
from datetime import datetime
from collections import Counter, defaultdict

import torch
from transformers import DonutProcessor, VisionEncoderDecoderModel
from PIL import Image as PILImage

import tensorflow as tf
from keras import layers, Model
#from tensorflow.keras import layers, Model

warnings.filterwarnings("ignore")

# ── Konstanta global ──────────────────────────────────────────────────
CATEGORIES = [
    "makanan", "minuman", "transportasi", "belanja",
    "tagihan", "hiburan", "kesehatan", "lain_lain",
]
N_CATS       = len(CATEGORIES)
LABELS_H3    = ["hemat", "aman", "waspada", "boros", "darurat"]
LABELS_H3_UP = ["HEMAT", "AMAN", "WASPADA", "BOROS", "DARURAT"]
LUMP_SUM_CATS = ["tagihan"]

BUDGET_PROPORSI = {
    "makanan"      : 0.35,
    "minuman"      : 0.10,
    "transportasi" : 0.15,
    "belanja"      : 0.10,
    "tagihan"      : 0.12,
    "hiburan"      : 0.08,
    "kesehatan"    : 0.05,
    "lain_lain"    : 0.05,
}

TIPS_H3 = {
    "HEMAT"   : "Pengeluaran sangat terkontrol! Pertahankan kebiasaan ini dan alokasikan sisa ke tabungan.",
    "AMAN"    : "Pengeluaran dalam batas normal. Tetap pantau tiap minggu agar tidak melewati budget.",
    "WASPADA" : "Pengeluaran mulai melebihi rata-rata. Identifikasi kategori terbesar dan kurangi.",
    "BOROS"   : "Pengeluaran sudah melewati batas aman! Fokus hanya pada kebutuhan pokok.",
    "DARURAT" : "PERHATIAN: Budget hampir habis! Hentikan semua pengeluaran non-esensial sekarang.",
}

LABEL_RANK = {"HEMAT": 0, "AMAN": 1, "WASPADA": 2, "BOROS": 3, "DARURAT": 4}

MAX_LEN_1C   = 30
WINDOW_SIZE  = 30
PRED_HORIZON = 7
DEVICE       = "cuda" if torch.cuda.is_available() else "cpu"


# ══════════════════════════════════════════════════════════════════════
# ARSITEKTUR MODEL (harus sama persis dengan saat training)
# ══════════════════════════════════════════════════════════════════════

# ── Head 1C — BiLSTM ─────────────────────────────────────────────────
class AttentionLayer(layers.Layer):
    def __init__(self, units=64, **kwargs):
        super().__init__(**kwargs)
        self.W = layers.Dense(units, activation="tanh")
        self.V = layers.Dense(1)
        self.units = units

    def call(self, x):
        w = tf.nn.softmax(self.V(self.W(x)), axis=1)
        return tf.reduce_sum(w * x, axis=1), w

    def get_config(self):
        cfg = super().get_config()
        cfg.update({"units": self.units})
        return cfg


class ItemClassifierModel(Model):
    def __init__(self, vocab_size, embed_dim=64, lstm_units=128,
                 n_classes=8, dropout=0.3, **kwargs):
        super().__init__(**kwargs)
        self.vocab_size   = vocab_size
        self.embed_dim    = embed_dim
        self.lstm_units   = lstm_units
        self.n_classes    = n_classes
        self.dropout_rate = dropout
        self.embedding    = layers.Embedding(vocab_size, embed_dim, mask_zero=True)
        self.bilstm1      = layers.Bidirectional(
            layers.LSTM(lstm_units, return_sequences=True, dropout=dropout))
        self.bilstm2      = layers.Bidirectional(
            layers.LSTM(lstm_units // 2, return_sequences=True, dropout=dropout))
        self.attention    = AttentionLayer(units=lstm_units)
        self.proj         = layers.Dense(lstm_units * 2)
        self.dense1       = layers.Dense(256, activation="gelu")
        self.dense2       = layers.Dense(128, activation="gelu")
        self.drop1        = layers.Dropout(dropout)
        self.drop2        = layers.Dropout(dropout * 0.5)
        self.bn1          = layers.BatchNormalization()
        self.bn2          = layers.BatchNormalization()
        self.output_layer = layers.Dense(n_classes, activation="softmax")

    def call(self, x, training=False):
        emb    = self.embedding(x)
        o1     = self.bilstm1(emb, training=training)
        o2     = self.bilstm2(o1, training=training)
        ctx, _ = self.attention(o2)
        res    = self.proj(ctx)
        h      = self.dense1(res)
        h      = self.drop1(h, training=training)
        h      = self.bn1(h, training=training)
        h      = self.dense2(h + res[:, : h.shape[-1]])
        h      = self.drop2(h, training=training)
        h      = self.bn2(h, training=training)
        return self.output_layer(h)

    def get_config(self):
        return {
            "vocab_size" : self.vocab_size,
            "embed_dim"  : self.embed_dim,
            "lstm_units" : self.lstm_units,
            "n_classes"  : self.n_classes,
            "dropout"    : self.dropout_rate,
        }


# ── Head 2 — GRU ─────────────────────────────────────────────────────
class MLPEncoderLayer(layers.Layer):
    def __init__(self, units=64, dropout=0.2, **kwargs):
        super().__init__(**kwargs)
        self.dense1 = layers.Dense(units, activation="relu")
        self.dense2 = layers.Dense(units // 2, activation="relu")
        self.drop   = layers.Dropout(dropout)
        self.bn     = layers.BatchNormalization()
        self.units  = units
        self.dropout = dropout

    def call(self, x, training=False):
        x = self.dense1(x)
        x = self.drop(x, training=training)
        x = self.dense2(x)
        return self.bn(x, training=training)

    def get_config(self):
        cfg = super().get_config()
        cfg.update({"units": self.units, "dropout": self.dropout})
        return cfg


class StackedGRULayer(layers.Layer):
    def __init__(self, units_1=64, units_2=32, dropout=0.3, **kwargs):
        super().__init__(**kwargs)
        self.gru1 = layers.GRU(
            units_1, return_sequences=True, dropout=dropout, recurrent_dropout=0.1)
        self.gru2 = layers.GRU(
            units_2, return_sequences=False, dropout=dropout, recurrent_dropout=0.1)
        self.units_1 = units_1
        self.units_2 = units_2
        self.dropout = dropout

    def call(self, x, training=False):
        return self.gru2(self.gru1(x, training=training), training=training)

    def get_config(self):
        cfg = super().get_config()
        cfg.update({"units_1": self.units_1, "units_2": self.units_2, "dropout": self.dropout})
        return cfg


class MultiStepDecoder(layers.Layer):
    def __init__(self, horizon, n_cats, units=128, **kwargs):
        super().__init__(**kwargs)
        self.horizon      = horizon
        self.n_cats       = n_cats
        self.dense1       = layers.Dense(units, activation="relu")
        self.dense2       = layers.Dense(units // 2, activation="relu")
        self.output_layer = layers.Dense(horizon * n_cats, activation="relu")
        self.reshape      = layers.Reshape((horizon, n_cats))

    def call(self, x, training=False):
        x = self.dense1(x)
        x = self.dense2(x)
        return self.reshape(self.output_layer(x))

    def get_config(self):
        cfg = super().get_config()
        cfg.update({"horizon": self.horizon, "n_cats": self.n_cats})
        return cfg


class CashFlowPredictorFinal(Model):
    def __init__(self, window_size, pred_horizon, n_cats,
                 mlp_units=64, gru_units_1=64, gru_units_2=32,
                 decoder_units=128, **kwargs):
        super().__init__(**kwargs)
        self.window_size  = window_size
        self.pred_horizon = pred_horizon
        self.n_cats       = n_cats
        self.td_mlp = layers.TimeDistributed(
            MLPEncoderLayer(mlp_units, dropout=0.2), name="time_distributed")
        self.stacked_gru = StackedGRULayer(
            gru_units_1, gru_units_2, dropout=0.3, name="stacked_gru_layer")
        self.decoder = MultiStepDecoder(
            pred_horizon, n_cats, decoder_units, name="decoder")

    def call(self, x, training=False):
        x = self.td_mlp(x, training=training)
        x = self.stacked_gru(x, training=training)
        return self.decoder(x, training=training)

    def get_config(self):
        return {
            "window_size" : self.window_size,
            "pred_horizon": self.pred_horizon,
            "n_cats"      : self.n_cats,
        }


# ── Head 3 — FinancialRecommender ────────────────────────────────────
class FeatureNormLayer(layers.Layer):
    def __init__(self, units=128, dropout=0.2, **kwargs):
        super().__init__(**kwargs)
        self.dense1 = layers.Dense(units, activation="gelu")
        self.dense2 = layers.Dense(units, activation="gelu")
        self.drop   = layers.Dropout(dropout)
        self.bn     = layers.BatchNormalization()
        self.units  = units

    def call(self, x, training=False):
        x = self.dense1(x)
        x = self.drop(x, training=training)
        x = self.dense2(x)
        return self.bn(x, training=training)

    def get_config(self):
        cfg = super().get_config()
        cfg.update({"units": self.units})
        return cfg


class MLPBlockLayer(layers.Layer):
    def __init__(self, units=128, dropout=0.3, **kwargs):
        super().__init__(**kwargs)
        self.dense1 = layers.Dense(units, activation="gelu")
        self.dense2 = layers.Dense(units)
        self.proj   = layers.Dense(units)
        self.bn     = layers.BatchNormalization()
        self.drop1  = layers.Dropout(dropout)
        self.drop2  = layers.Dropout(dropout * 0.5)
        self.units  = units
        self.dropout = dropout

    def call(self, x, training=False):
        res = self.proj(x)
        out = self.dense1(x)
        out = self.drop1(out, training=training)
        out = self.dense2(out)
        out = self.drop2(out, training=training)
        return tf.nn.gelu(self.bn(out + res, training=training))

    def get_config(self):
        cfg = super().get_config()
        cfg.update({"units": self.units, "dropout": self.dropout})
        return cfg


class CategoryHeadLayer(layers.Layer):
    def __init__(self, n_cats, n_labels, units=64, **kwargs):
        super().__init__(**kwargs)
        self.n_cats    = n_cats
        self.n_labels  = n_labels
        self.units     = units
        self.cat_dense = [
            layers.Dense(units, activation="gelu", name=f"dense_{i}")
            for i in range(n_cats)
        ]
        self.cat_out = [
            layers.Dense(n_labels, activation="softmax", name=f"dense_{i}")
            for i in range(n_cats)
        ]

    def call(self, x, training=False):
        outputs = [self.cat_out[i](self.cat_dense[i](x)) for i in range(self.n_cats)]
        return tf.stack(outputs, axis=1)

    def get_config(self):
        cfg = super().get_config()
        cfg.update({"n_cats": self.n_cats, "n_labels": self.n_labels, "units": self.units})
        return cfg


class FinancialRecommenderModel(Model):
    def __init__(self, n_features, n_cats=8, n_labels=5, **kwargs):
        super().__init__(**kwargs)
        self.n_features = n_features
        self.n_cats     = n_cats
        self.n_labels   = n_labels
        self.feat_norm  = FeatureNormLayer(128, dropout=0.2, name="feat_norm")
        self.mlp1       = MLPBlockLayer(128, dropout=0.3,  name="mlp_block_layer")
        self.mlp2       = MLPBlockLayer(64,  dropout=0.25, name="mlp_block_layer_1")
        self.mlp3       = MLPBlockLayer(32,  dropout=0.2,  name="mlp_block_layer_2")
        self.cat_head   = CategoryHeadLayer(n_cats, n_labels, units=32, name="cat_head")
        self.overall_dense = layers.Dense(64, activation="gelu", name="dense")
        self.overall_out   = layers.Dense(n_labels, activation="softmax", name="dense_1")

    def call(self, x, training=False):
        h           = self.feat_norm(x, training=training)
        h           = self.mlp1(h, training=training)
        h           = self.mlp2(h, training=training)
        h           = self.mlp3(h, training=training)
        cat_out     = self.cat_head(h, training=training)
        overall_out = self.overall_out(self.overall_dense(h))
        return overall_out, cat_out

    def get_config(self):
        return {
            "n_features": self.n_features,
            "n_cats"    : self.n_cats,
            "n_labels"  : self.n_labels,
        }


# ══════════════════════════════════════════════════════════════════════
# LOAD SEMUA MODEL
# ══════════════════════════════════════════════════════════════════════

def load_all_models(weights_dir: str = "./weights") -> dict:
    """
    Load semua model AI ke memory.
    Dipanggil SEKALI saat FastAPI startup.

    Args:
        weights_dir: path ke folder weights
                     (hasil download dari HuggingFace)
    Returns:
        dict berisi semua model dan config
    """
    models = {}
    tf.config.set_visible_devices([], "GPU")  # TF pakai CPU

    # ── Donut ─────────────────────────────────────────────────────────
    print("[1/4] Loading Donut...")
    donut_dir             = f"{weights_dir}/donut_finetuned_cord_v2"
    models["processor"]   = DonutProcessor.from_pretrained(donut_dir, use_fast=False)
    models["donut"]       = VisionEncoderDecoderModel.from_pretrained(donut_dir)
    models["donut"]       = models["donut"].to(DEVICE)
    models["donut"].eval()
    print(f"      Donut loaded | device={DEVICE}")

    # ── Head 1C ───────────────────────────────────────────────────────
    print("[2/4] Loading Head 1C BiLSTM...")
    with open(f"{weights_dir}/head1c_v2_vocab.pkl", "rb") as f:
        models["vocab_1c"] = pickle.load(f)
    with open(f"{weights_dir}/head1c_v2_config.json") as f:
        cfg_1c = json.load(f)

    model_1c = ItemClassifierModel(
        vocab_size  = cfg_1c.get("vocab_size", len(models["vocab_1c"]) + 2),
        embed_dim   = cfg_1c.get("embed_dim", 64),
        lstm_units  = cfg_1c.get("lstm_units", 128),
        n_classes   = N_CATS,
        dropout     = cfg_1c.get("dropout", 0.3),
    )
    _ = model_1c(tf.zeros((1, MAX_LEN_1C), dtype=tf.int32))
    model_1c.load_weights(f"{weights_dir}/head1c_v2.weights.h5")
    models["model_1c"]    = model_1c
    models["max_len_1c"]  = cfg_1c.get("max_len", MAX_LEN_1C)
    print(f"      Head 1C loaded | vocab={len(models['vocab_1c'])}")

    # ── Head 2 ────────────────────────────────────────────────────────
    print("[3/4] Loading Head 2 GRU...")
    with open(f"{weights_dir}/head2_scalers.pkl", "rb") as f:
        models["scalers_h2"] = pickle.load(f)
    with open(f"{weights_dir}/head2_config.json") as f:
        cfg_h2 = json.load(f)

    window_size  = cfg_h2.get("window_size", WINDOW_SIZE)
    pred_horizon = cfg_h2.get("pred_horizon", PRED_HORIZON)

    model_h2 = CashFlowPredictorFinal(
        window_size=window_size, pred_horizon=pred_horizon, n_cats=N_CATS,
    )
    _ = model_h2(tf.zeros((1, window_size, N_CATS)))
    model_h2.load_weights(f"{weights_dir}/head2.weights.h5")
    models["model_h2"]    = model_h2
    models["window_size"] = window_size
    models["pred_horizon"]= pred_horizon
    print(f"      Head 2 loaded | window={window_size} pred={pred_horizon}")

    # ── Head 3 ────────────────────────────────────────────────────────
    print("[4/4] Loading Head 3 FinancialRecommender...")
    with open(f"{weights_dir}/head3_scaler.pkl", "rb") as f:
        models["scaler_h3"] = pickle.load(f)
    with open(f"{weights_dir}/head3_config.json") as f:
        cfg_h3 = json.load(f)

    n_features_h3        = cfg_h3.get("n_features", 37)
    models["feature_keys"] = cfg_h3.get("feature_keys", [])

    model_h3 = FinancialRecommenderModel(
        n_features=n_features_h3, n_cats=N_CATS, n_labels=len(LABELS_H3),
    )
    _ = model_h3(tf.zeros((1, n_features_h3)))
    model_h3.load_weights(f"{weights_dir}/head3.weights.h5")
    models["model_h3"]      = model_h3
    models["n_features_h3"] = n_features_h3
    print(f"      Head 3 loaded | input={n_features_h3} fitur")

    print("\nSEMUA MODEL LOADED!")
    return models


# ══════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS — PARSER
# ══════════════════════════════════════════════════════════════════════

def parse_price_text(text: str) -> int:
    if not text: return 0
    clean = str(text).upper().replace("RP", "").strip()
    clean = re.sub(r"O{2,}", lambda m: "0" * len(m.group()), clean)
    clean = re.sub(r"(?<=\d)O(?=\d)", "0", clean)
    if re.search(r"\d\.\d{3},\d{2}$", clean):
        clean = clean.replace(".", "").split(",")[0]
    else:
        clean = re.sub(r"\.(?=\d{3}(?:\D|$))", "", clean)
        clean = clean.replace(",", "")
    digits = re.sub(r"[^0-9]", "", clean)
    return int(digits) if digits else 0


def safe_parse_json(text: str) -> dict:
    raw = re.sub(r"^<s_cord-v2>\s*", "", text).strip()
    try: return json.loads(raw)
    except: pass
    for i in range(len(raw), 0, -1):
        if raw[i - 1] == "}":
            try: return json.loads(raw[:i])
            except: continue
    repaired = re.sub(r',\s*"[^"]+"\s*:\s*"[^"]*$', "", raw)
    repaired = re.sub(r',\s*"[^"]+"\s*:\s*$', "", repaired)
    open_b = repaired.count("[") - repaired.count("]")
    open_c = repaired.count("{") - repaired.count("}")
    repaired += "]" * max(0, open_b) + "}" * max(0, open_c)
    try: return json.loads(repaired)
    except: pass
    items   = re.findall(r'"nm"\s*:\s*"([^"]+)"[^}]*?"price"\s*:\s*"([^"]+)"', raw)
    total_m = re.search(r'"total_price"\s*:\s*"([\d.,]+)"', raw)
    result  = {}
    if items:   result["menu"]  = [{"nm": nm, "price": p} for nm, p in items]
    if total_m: result["total"] = {"total_price": total_m.group(1)}
    return result if result else {}


def parse_donut_output(donut_json: dict):
    """Parser v6 final — output: (paired, total_val, store_name)"""
    TOKO_KW = ["CAFE","COFFEE","RESTO","RESTAURANT","OUTLET","BAKERY",
                "CATERING","KITCHEN","WARUNG","RUMAH MAKAN","BRANCH",
                "STORE","SHOP","MART","MARKET"]
    NON_KW  = ["DISC","DISKON","DISCOUNT","PROMO","TAX","PAJAK","AMOUNT",
                "SUBTOTAL","SUB TOTAL","GRAND TOTAL","CASHIER","SERVER",
                "DINE IN","DINE-IN","PAX","INVOICE","RECEIPT","TABLE",
                "KASIR","MEJA","PRINT CNT","CHANGE","CASH","KEMBALIAN","BAYAR"]
    MOD_KW  = ["ICE","LESS ICE","NO ICE","HOT","WARM","COLD","SMALL","MEDIUM",
                "LARGE","REGULAR","SEDANG","BESAR","KECIL","ORIGINAL",
                "EXTRA","ADD ON","TOPPING","NOTE","CATATAN"]

    def _ss(v):
        if v is None: return ""
        if isinstance(v, str): return v.strip()
        if isinstance(v, dict):
            for x in v.values():
                if isinstance(x, str) and x.strip(): return x.strip()
            return ""
        if isinstance(v, list):
            for x in v:
                s = _ss(x)
                if s: return s
            return ""
        return str(v).strip()

    def _vp(t): return parse_price_text(t) >= 100
    def _ls(t): return bool(re.search(r"\b(" + "|".join(TOKO_KW) + r")\b", t.upper()))
    def _la(t): return bool(re.search(
        r"\b(Jl|Jln|No\.|RT|RW|Gg|Blok|Ruko|Komplek|Kec|Kel|Gobah)\b|\d+\s*,\s*[A-Za-z]", t, re.I))
    def _ni(t): return any(kw in t.upper().strip() for kw in NON_KW)
    def _qr(t): return bool(re.match(r"^[\d]*\s*[xX]\s*[\d.,]+", t.strip()))
    def _vin(t):
        if not t or len(t) < 2: return False
        if re.match(r"^[A-Za-z\s]{2,20}:\s*\S", t): return False
        if "#" in t or len(t) > 40: return False
        if re.match(r"^[\d\s.,\-\*\/\|xX%]+$", t): return False
        if len(t.strip()) < 3 or sum(c.isalpha() for c in t) < 2: return False
        return not (_la(t) or _ls(t) or _ni(t))
    def _pqr(nm, price):
        m = re.search(r"[xX]\s*([\d.,]{3,})", nm)
        if m:
            h = parse_price_text(m.group(1))
            if h >= 100: return h
        return parse_price_text(price) if _vp(price) else 0
    def _rsub(s):
        if not isinstance(s, dict): return False
        nm = s.get("nm", "").strip()
        if not nm or len(nm) < 3: return False
        if re.match(r"^[-\-%0-9x]", nm): return False
        if re.match(r"^[\d\s.,\-\*\/\|xX%]+$", nm): return False
        if any(k in nm.upper() for k in MOD_KW): return False
        return parse_price_text(s.get("price", "0")) >= 100
    def _flat(menu_raw):
        if isinstance(menu_raw, dict): menu_raw = [menu_raw]
        if not isinstance(menu_raw, list): return []
        flat = []
        for item in menu_raw:
            if not isinstance(item, dict): continue
            flat.append(item)
            sub = item.get("sub", [])
            if isinstance(sub, dict): sub = [sub]
            for s in (sub if isinstance(sub, list) else []):
                if _rsub(s): flat.append(s)
        return flat

    if "text_sequence" in donut_json:
        p = safe_parse_json(donut_json["text_sequence"])
        if p: donut_json = p

    menu       = _flat(donut_json.get("menu", []))
    store_name = _ss(donut_json.get("store_info", {}))

    if not store_name:
        for item in menu[:5]:
            if not isinstance(item, dict): continue
            nm = _ss(item.get("nm", ""))
            if not nm or len(nm) < 3 or re.search(r"\d{4}[-/]\d{2}", nm): continue
            if _qr(nm) or _ni(nm): continue
            if _ls(nm): store_name = nm; break
    if not store_name:
        for item in menu[:4]:
            if not isinstance(item, dict): continue
            nm    = _ss(item.get("nm", ""))
            price = _ss(item.get("price", "0"))
            if not nm or len(nm) < 3 or re.search(r"\d{4}[-/]\d{2}", nm): continue
            if _qr(nm) or _la(nm) or _ni(nm): continue
            if not _vp(price): store_name = nm; break
    store_name = store_name or "Tidak terdeteksi"

    nm_counter = Counter(_ss(it.get("nm", "")) for it in menu if isinstance(it, dict))
    header_nm  = {nm for nm, c in nm_counter.items() if c >= 2}

    paired = []; i = 0
    while i < len(menu):
        item = menu[i]
        if not isinstance(item, dict): i += 1; continue
        nm = _ss(item.get("nm", ""))
        up = _ss(item.get("unitprice", ""))
        pr = _ss(item.get("price", "0"))
        if _qr(nm): i += 1; continue
        if nm == store_name or _ls(nm) or _la(nm): i += 1; continue
        if _ni(nm) and not _vin(up): i += 1; continue
        if _vin(up):                             fn = up
        elif _vin(nm) and nm not in header_nm:   fn = nm
        else: i += 1; continue
        harga = 0
        if i + 1 < len(menu) and isinstance(menu[i + 1], dict):
            n2 = _ss(menu[i + 1].get("nm", ""))
            p2 = _ss(menu[i + 1].get("price", "0"))
            if _qr(n2): harga = _pqr(n2, p2); i += 1
        if harga == 0: harga = parse_price_text(pr) if _vp(pr) else 0
        if harga == 0: i += 1; continue
        paired.append({"item_name": fn, "harga_str": str(harga), "harga_int": harga})
        i += 1

    total_raw = donut_json.get("total", {})
    total_val = parse_price_text(_ss(total_raw.get("total_price", "0"))) \
        if isinstance(total_raw, dict) else 0
    if total_val == 0 and paired:
        total_val = sum(p["harga_int"] for p in paired)

    return paired, total_val, store_name


# ══════════════════════════════════════════════════════════════════════
# HEAD 1 — Donut + BiLSTM
# ══════════════════════════════════════════════════════════════════════

def _tokenize_1c(text: str, vocab: dict, max_len: int = 30) -> list:
    PAD_ID = vocab.get("<PAD>", 0)
    UNK_ID = vocab.get("<UNK>", 1)
    ids = [vocab.get(c, UNK_ID) for c in text.lower().strip()]
    if len(ids) >= max_len: return ids[:max_len]
    return ids + [PAD_ID] * (max_len - len(ids))


def run_head1(image_input, models: dict, user_store_name: str = None) -> dict:
    """
    Pipeline Head 1: foto struk → JSON item + kategori.

    Args:
        image_input    : path str, PIL Image, atau bytes
        models         : dict dari load_all_models()
        user_store_name: nama toko manual dari user (opsional)

    Returns:
        dict: {status, store_name, date, items, total, needs_review, ...}
    """
    processor = models["processor"]
    donut     = models["donut"]
    model_1c  = models["model_1c"]
    vocab     = models["vocab_1c"]
    max_len   = models["max_len_1c"]

    # Load gambar
    if isinstance(image_input, (str, Path)):
        img = PILImage.open(str(image_input)).convert("RGB")
    elif isinstance(image_input, bytes):
        import io
        img = PILImage.open(io.BytesIO(image_input)).convert("RGB")
    else:
        img = image_input.convert("RGB")

    W, H = img.size
    if max(W, H) > 1920:
        scale = 1920 / max(W, H)
        img   = img.resize((int(W * scale), int(H * scale)))

    # Donut inference
    dec_ids = processor.tokenizer(
        "<s_cord-v2>", add_special_tokens=False, return_tensors="pt"
    ).input_ids.to(DEVICE)
    pv = processor(img, return_tensors="pt").pixel_values.to(DEVICE)

    t0 = time.time()
    with torch.no_grad():
        out = donut.generate(
            pv, decoder_input_ids=dec_ids, max_new_tokens=512,
            pad_token_id=processor.tokenizer.pad_token_id,
            eos_token_id=processor.tokenizer.eos_token_id,
            use_cache=True, num_beams=1,
            bad_words_ids=[[processor.tokenizer.unk_token_id]],
            return_dict_in_generate=True,
        )
    t_donut = time.time() - t0

    seq = processor.batch_decode(out.sequences)[0]
    seq = seq.replace(processor.tokenizer.eos_token, "")
    seq = seq.replace(processor.tokenizer.pad_token, "")
    seq = re.sub(r"<.*?>", "", seq, count=1).strip()

    try:    dj = processor.token2json(seq)
    except: dj = {}
    if "text_sequence" in dj: dj = safe_parse_json(dj["text_sequence"])

    if not dj:
        return {"status": "failed", "error": "donut_empty"}

    # Parser
    paired, total_val, store_name = parse_donut_output(dj)
    if user_store_name: store_name = user_store_name

    if not paired:
        return {
            "status"      : "partial",
            "store_name"  : store_name,
            "date"        : datetime.now().strftime("%Y-%m-%d"),
            "items"       : [],
            "total"       : 0,
            "needs_review": True,
        }

    # Head 1C — klasifikasi kategori
    names        = [p["item_name"] for p in paired]
    tokens_batch = tf.constant(
        [_tokenize_1c(nm, vocab, max_len) for nm in names], dtype=tf.int32)
    probs_batch  = model_1c(tokens_batch, training=False).numpy()

    items_final = []
    for p, probs in zip(paired, probs_batch):
        idx = int(np.argmax(probs))
        items_final.append({
            "item_name" : p["item_name"],
            "harga"     : p["harga_int"],        # Rupiah
            "kategori"  : CATEGORIES[idx],
            "confidence": round(float(probs[idx]) * 100, 1),
        })

    summary = defaultdict(lambda: {"total": 0, "items": []})
    for it in items_final:
        summary[it["kategori"]]["total"] += it["harga"]
        summary[it["kategori"]]["items"].append(it["item_name"])

    return {
        "status"              : "success",
        "store_name"          : store_name,
        "date"                : datetime.now().strftime("%Y-%m-%d"),
        "day_of_month"        : datetime.now().day,
        "items"               : items_final,        # harga dalam Rupiah
        "total"               : total_val,           # Rupiah
        "needs_review"        : store_name == "Tidak terdeteksi",
        "summary_per_kategori": dict(summary),
        "timing_donut_sec"    : round(t_donut, 2),
    }


# ══════════════════════════════════════════════════════════════════════
# HEAD 2 — GRU CashFlow Predictor
# ══════════════════════════════════════════════════════════════════════

def run_head2(
    actual_dict_rupiah: dict,
    models: dict,
    day_of_month: int = None,
) -> dict:
    """
    Prediksi pengeluaran 7 hari ke depan.

    Args:
        actual_dict_rupiah: {kategori: total_rupiah_hari_ini}
                            pengeluaran hari ini dari struk (Rupiah)
        models            : dict dari load_all_models()
        day_of_month      : hari ke berapa bulan ini (default: hari ini)

    Returns:
        dict: {kategori: prediksi_total_7hari_rupiah, kategori_source: model/fallback}
    """
    if day_of_month is None: day_of_month = datetime.now().day
    days_elapsed  = max(1, day_of_month)
    model_h2      = models["model_h2"]
    scalers_h2    = models["scalers_h2"]
    window_size   = models["window_size"]
    pred_horizon  = models["pred_horizon"]

    # Konversi Rupiah → ribuan Rp (satuan training)
    actual_rb = {cat: actual_dict_rupiah.get(cat, 0) / 1000 for cat in CATEGORIES}

    # Buat input sequence 30 hari
    x_input = np.zeros((1, window_size, N_CATS), dtype=np.float32)
    for i, cat in enumerate(CATEGORIES):
        daily_rb = actual_rb.get(cat, 0) / days_elapsed
        rng      = np.random.RandomState(42 + i)
        seq      = np.array([
            max(0, daily_rb * (1 + rng.normal(0, 0.12)))
            for _ in range(window_size)
        ], dtype=np.float32)
        x_input[0, :, i] = scalers_h2[cat].transform(seq.reshape(-1, 1)).flatten()

    # Inference
    pred_scaled = model_h2(x_input, training=False).numpy()[0]

    # Inverse transform → ribuan Rp
    pred_rb = np.zeros((pred_horizon, N_CATS), dtype=np.float32)
    for i, cat in enumerate(CATEGORIES):
        raw = scalers_h2[cat].inverse_transform(
            pred_scaled[:, i].reshape(-1, 1)
        ).flatten()
        pred_rb[:, i] = np.clip(raw, 0, None)

    # Fallback untuk kategori yang model under-predict
    FALLBACK_T = 0.15
    pred_7d    = {}
    for i, cat in enumerate(CATEGORIES):
        daily_rb       = actual_rb.get(cat, 0) / days_elapsed
        pred_total_rb  = float(pred_rb[:, i].sum())
        expected_7d_rb = daily_rb * pred_horizon

        if expected_7d_rb > 0 and pred_total_rb < expected_7d_rb * FALLBACK_T:
            # Fallback: pakai daily average
            pred_7d[cat]              = round(daily_rb * pred_horizon * 0.85 * 1000)
            pred_7d[f"{cat}_source"]  = "fallback"
        else:
            pred_7d[cat]              = round(pred_total_rb * 1000)  # ke Rupiah
            pred_7d[f"{cat}_source"]  = "model"

    return pred_7d  # Rupiah


# ══════════════════════════════════════════════════════════════════════
# HEAD 3 — FinancialRecommender
# ══════════════════════════════════════════════════════════════════════

def _compute_proj(cat: str, act: float, pred_7d: float,
                  days_elapsed: int, days_remaining: int) -> float:
    if cat in LUMP_SUM_CATS:
        return act + pred_7d
    daily = act / max(days_elapsed, 1)
    return act + daily * days_remaining


def _proj_to_label(proj: float, bgt: float) -> str:
    if bgt <= 0: return "AMAN"
    p = proj / bgt
    if p < 0.50:   return "HEMAT"
    elif p < 0.85: return "AMAN"
    elif p < 1.05: return "WASPADA"
    elif p < 1.30: return "BOROS"
    else:          return "DARURAT"


def _compute_features_h3(
    actual_dict: dict, pred_7d_dict: dict,
    budget_dict: dict, saldo_sisa: float,
    day_of_month: int,
) -> tuple:
    """
    Build feature vector untuk Head 3.
    Semua nilai dalam ribuan Rp.
    """
    days_elapsed   = max(1, day_of_month)
    days_remaining = max(1, 30 - day_of_month)
    total_budget   = sum(budget_dict.values())

    features = {}
    for cat in CATEGORIES:
        bgt  = budget_dict.get(cat, 300)
        act  = actual_dict.get(cat, 0)
        pred = pred_7d_dict.get(cat, 0)

        sisa_bgt  = max(0, bgt - act)
        proj      = _compute_proj(cat, act, pred, days_elapsed, days_remaining)
        pct_used  = act / bgt if bgt > 0 else 0
        proj_pct  = min(proj / bgt, 3.0) if bgt > 0 else 0
        pred_vs_s = min(pred / sisa_bgt, 3.0) if sisa_bgt > 0 else (2.0 if pred > 0 else 0)
        daily_norm = 0.0 if cat in LUMP_SUM_CATS else (
            min((act / days_elapsed) / (bgt / 30), 5.0) if bgt > 0 else 0
        )
        features[f"{cat}_pct_used"]     = pct_used
        features[f"{cat}_pred_vs_sisa"] = pred_vs_s
        features[f"{cat}_proj_pct"]     = proj_pct
        features[f"{cat}_daily_avg"]    = daily_norm

    total_actual = sum(actual_dict.get(cat, 0) for cat in CATEGORIES)
    total_pred7d = sum(pred_7d_dict.get(cat, 0) for cat in CATEGORIES)
    total_proj   = sum(
        _compute_proj(cat, actual_dict.get(cat, 0), pred_7d_dict.get(cat, 0),
                      days_elapsed, days_remaining)
        for cat in CATEGORIES
    )
    proj_overall = min(total_proj / total_budget, 3.0) if total_budget > 0 else 0
    saldo_pct    = saldo_sisa / total_budget if total_budget > 0 else 0

    features["days_remaining"]   = days_remaining / 30
    features["saldo_pct"]        = saldo_pct
    features["proj_overall_pct"] = proj_overall
    features["total_pred7d_pct"] = min(total_pred7d / total_budget, 3.0) if total_budget > 0 else 0
    features["profile"]          = (
        0 if proj_overall < 0.7 else (1 if proj_overall < 1.1 else 2)
    ) / 2

    return features, proj_overall, total_actual, total_pred7d


def run_head3(
    actual_dict_rb: dict,
    pred_7d_rupiah: dict,
    budget_bulanan: int,
    saldo_sisa_rupiah: int,
    day_of_month: int,
    models: dict,
) -> dict:
    """
    Generate rekomendasi keuangan.

    Args:
        actual_dict_rb    : {kategori: total_aktual_bulan_ini} dalam ribuan Rp
        pred_7d_rupiah    : output run_head2() dalam Rupiah
        budget_bulanan    : budget bulanan dalam Rupiah
        saldo_sisa_rupiah : saldo sisa dalam Rupiah
        day_of_month      : hari ke berapa bulan ini
        models            : dict dari load_all_models()

    Returns:
        dict hasil rekomendasi lengkap
    """
    model_h3      = models["model_h3"]
    scaler_h3     = models["scaler_h3"]
    feature_keys  = models["feature_keys"]
    n_features    = models["n_features_h3"]

    days_elapsed   = max(1, day_of_month)
    days_remaining = max(1, 30 - day_of_month)

    # Konversi ke ribuan Rp
    budget_rb      = budget_bulanan / 1000
    saldo_rb       = saldo_sisa_rupiah / 1000
    pred_7d_rb     = {cat: pred_7d_rupiah.get(cat, 0) / 1000 for cat in CATEGORIES}
    budget_dict_rb = {cat: budget_rb * BUDGET_PROPORSI[cat] for cat in CATEGORIES}

    # Build features
    features, proj_overall, total_actual, total_pred7d = _compute_features_h3(
        actual_dict_rb, pred_7d_rb, budget_dict_rb, saldo_rb, day_of_month
    )

    # Inference
    if feature_keys:
        x_raw = np.array([[features[k] for k in feature_keys]], dtype=np.float32)
    else:
        x_raw = np.array([[features[k] for k in sorted(features.keys())]], dtype=np.float32)

    if x_raw.shape[1] < n_features:
        pad   = np.zeros((1, n_features - x_raw.shape[1]), dtype=np.float32)
        x_raw = np.concatenate([x_raw, pad], axis=1)

    x_scaled         = scaler_h3.transform(x_raw)
    op, cp           = model_h3(x_scaled, training=False)
    model_idx        = int(tf.argmax(op[0]).numpy())
    model_conf       = float(op[0][model_idx]) * 100
    model_lbl_up     = LABELS_H3_UP[model_idx]

    # Rule-based anchor
    pct_aktual = (sum(actual_dict_rb.values()) / sum(budget_dict_rb.values())) \
                 if sum(budget_dict_rb.values()) > 0 else 0

    # Tentukan rule_lbl dulu (selalu)
    if proj_overall < 0.50:   rule_lbl = "HEMAT"
    elif proj_overall < 0.85: rule_lbl = "AMAN"
    elif proj_overall < 1.05: rule_lbl = "WASPADA"
    elif proj_overall < 1.30: rule_lbl = "BOROS"
    else:                     rule_lbl = "DARURAT"

    # Override untuk awal bulan — percaya model AI
    if days_elapsed <= 7 and pct_aktual < 0.15:
        overall_lbl_up = model_lbl_up
    else:
        diff           = abs(LABEL_RANK[rule_lbl] - LABEL_RANK[model_lbl_up])
        overall_lbl_up = model_lbl_up if (model_conf >= 45 and diff <= 2) else rule_lbl
    
    
    # Label per kategori
    cat_results = {}
    for i, cat in enumerate(CATEGORIES):
        bgt  = budget_dict_rb.get(cat, 300)
        act  = actual_dict_rb.get(cat, 0)
        pred = pred_7d_rb.get(cat, 0)

        proj       = _compute_proj(cat, act, pred, days_elapsed, days_remaining)
        rule_cat   = _proj_to_label(proj, bgt)
        model_ci   = int(tf.argmax(cp[0, i]).numpy())
        model_cc   = float(cp[0, i, model_ci]) * 100
        model_cat  = LABELS_H3_UP[model_ci]
        diff_cat   = abs(LABEL_RANK[rule_cat] - LABEL_RANK[model_cat])
        final_cat  = model_cat if (model_cc >= 60 and diff_cat <= 1) else rule_cat

        cat_results[cat] = {
            "label"     : final_cat.lower(),
            "confidence": round(model_cc, 1),
            "pct_used"  : round(act / bgt * 100, 1) if bgt > 0 else 0,
            "proj_total": round(proj * 1000),       # Rupiah
            "aktual_rp" : round(act * 1000),        # Rupiah
            "budget_rp" : round(bgt * 1000),        # Rupiah
            "pred_7d_rp": round(pred * 1000),       # Rupiah
        }

    return {
        "label"           : overall_lbl_up.lower(),
        "label_upper"     : overall_lbl_up,
        "confidence"      : round(model_conf, 1),
        "pesan"           : TIPS_H3[overall_lbl_up],
        "saldo_rp"        : round(saldo_rb * 1000),
        "days_remaining"  : days_remaining,
        "proj_overall_pct": round(proj_overall * 100, 1),
        "est_saldo_7hari_rp": round((saldo_rb - total_pred7d) * 1000),
        "categories"      : cat_results,
        "all_probs"       : {
            LABELS_H3[i]: round(float(op[0][i]) * 100, 1)
            for i in range(len(LABELS_H3))
        },
    }


# ══════════════════════════════════════════════════════════════════════
# HELPER — budget dict dari budget bulanan
# ══════════════════════════════════════════════════════════════════════

def make_budget_dict(budget_bulanan_rupiah: int) -> dict:
    """
    Buat budget dict per kategori dari budget bulanan total.
    Proporsi realistis untuk mahasiswa.

    Args:
        budget_bulanan_rupiah: budget bulanan dalam Rupiah
    Returns:
        dict {kategori: budget_rupiah}
    """
    return {
        cat: round(budget_bulanan_rupiah * prop)
        for cat, prop in BUDGET_PROPORSI.items()
    }


# ══════════════════════════════════════════════════════════════════════
# DOWNLOAD MODEL DARI HUGGINGFACE (untuk server)
# ══════════════════════════════════════════════════════════════════════

def download_models_from_hf(
    repo_id    : str,
    hf_token   : str,
    local_dir  : str = "./weights",
) -> str:
    """
    Download semua model dari HuggingFace ke lokal.
    Dipanggil sekali saat server pertama kali dijalankan.

    Args:
        repo_id  : "Rizal88/snapbudget-models"
        hf_token : token Read dari HuggingFace
        local_dir: folder tujuan download

    Returns:
        str: path ke folder weights
    """
    from huggingface_hub import snapshot_download

    print(f"Downloading models dari {repo_id}...")
    path = snapshot_download(
        repo_id   = repo_id,
        token     = hf_token,
        local_dir = local_dir,
    )
    print(f"Models downloaded ke: {path}")
    return path


# ══════════════════════════════════════════════════════════════════════
# QUICK TEST (jalankan langsung: python inference.py)
# ══════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import sys

    WEIGHTS_DIR = sys.argv[1] if len(sys.argv) > 1 else "./weights"
    print(f"Loading models dari: {WEIGHTS_DIR}")

    models = load_all_models(WEIGHTS_DIR)

    # Test Head 2
    print("\nTest Head 2:")
    actual_test = {cat: 0 for cat in CATEGORIES}
    actual_test["makanan"] = 20000
    pred = run_head2(actual_test, models, day_of_month=15)
    for cat in CATEGORIES:
        if pred.get(cat, 0) > 0:
            print(f"  {cat}: Rp {pred[cat]:,}".replace(",", "."))

    # Test Head 3
    print("\nTest Head 3:")
    actual_rb = {cat: (actual_test.get(cat, 0) * 15) / 1000 for cat in CATEGORIES}
    pred_clean = {cat: pred.get(cat, 0) for cat in CATEGORIES}
    result = run_head3(
        actual_dict_rb    = actual_rb,
        pred_7d_rupiah    = pred_clean,
        budget_bulanan    = 2000000,
        saldo_sisa_rupiah = 1700000,
        day_of_month      = 15,
        models            = models,
    )
    print(f"  Label : {result['label']}")
    print(f"  Conf  : {result['confidence']}%")
    print(f"  Pesan : {result['pesan']}")

    print("\ninference.py berjalan dengan benar!")
