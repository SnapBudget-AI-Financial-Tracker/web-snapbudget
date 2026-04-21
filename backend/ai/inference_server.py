"""
SnapBudget — inference_server.py
AI Inference Server khusus — dijalankan terpisah dari Express

Cara jalankan:
    cd backend/ai
    pip install -r requirements_ai.txt
    uvicorn inference_server:app --host 0.0.0.0 --port 8000 --reload
"""

import os, io
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from contextlib import asynccontextmanager
from collections import defaultdict

from inference import (
    load_all_models, download_models_from_hf,
    run_head1, run_head2, run_head3,
    CATEGORIES,
)
# ── Config ────────────────────────────────────────────────────────────
REPO_ID     = os.getenv("HF_REPO_ID",  "Rizal88/snapbudget-models")
HF_TOKEN    = os.getenv("HF_TOKEN",    "")
WEIGHTS_DIR = os.getenv("WEIGHTS_DIR", "./weights")

print(f"Config loaded:")
print(f"  REPO_ID    : {REPO_ID}")
print(f"  HF_TOKEN   : {HF_TOKEN[:10]}...")
print(f"  WEIGHTS_DIR: {WEIGHTS_DIR}")

MODELS = {}


@asynccontextmanager
async def lifespan(app):
    global MODELS
    # Download model dari HuggingFace kalau belum ada
    if not os.path.exists(f"{WEIGHTS_DIR}/head1c_v2.weights.h5"):
        print("Download model dari HuggingFace...")
        if not HF_TOKEN:
            raise RuntimeError("HF_TOKEN belum di-set di .env")
        download_models_from_hf(REPO_ID, HF_TOKEN, WEIGHTS_DIR)
    MODELS = load_all_models(WEIGHTS_DIR)
    print("AI Inference Server siap!")
    yield
    MODELS.clear()


app = FastAPI(title="SnapBudget AI Inference Server", version="1.0.0", lifespan=lifespan)

# Izinkan Express backend memanggil server ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schema ────────────────────────────────────────────────────────────
class PrediksiRequest(BaseModel):
    actual_hari_ini: dict
    budget_bulanan : int = 2000000
    day_of_month   : Optional[int] = None
    saldo_sisa     : Optional[int] = None


# ── Endpoints ─────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status" : "ok",
        "models" : "loaded" if MODELS else "not loaded",
        "time"   : datetime.now().isoformat(),
    }


@app.post("/scan-struk")
async def scan_struk(
    file          : UploadFile = File(...),
    budget_bulanan: int = Form(default=2000000),
    day_of_month  : int = Form(default=0),
    saldo_sisa    : int = Form(default=0),
):
    if not MODELS:
        raise HTTPException(503, "Model belum siap")

    # Validasi file
    if file.content_type not in ["image/jpeg","image/png","image/jpg"]:
        raise HTTPException(400, "File harus jpg atau png")

    image_bytes = await file.read()
    day         = day_of_month or datetime.now().day

    # ── Head 1 ───────────────────────────────────────────────────────
    result_h1 = run_head1(image_bytes, MODELS)

    if result_h1.get("status") == "failed":
        raise HTTPException(422, "Struk tidak terbaca oleh AI")

    if result_h1.get("status") == "partial":
        return {
            "status"     : "partial",
            "message"    : "Struk terbaca tapi tidak ada item terdeteksi",
            "scan_result": result_h1,
        }

    # ── Siapkan data ─────────────────────────────────────────────────
    actual_hari = defaultdict(int)
    for it in result_h1["items"]:
        actual_hari[it["kategori"]] += it["harga"]
    actual_hari = dict(actual_hari)

    if saldo_sisa == 0:
        total_est  = sum(actual_hari.values()) * day
        saldo_sisa = max(0, budget_bulanan - total_est)

    # ── Head 2 ───────────────────────────────────────────────────────
    pred_7d       = run_head2(actual_hari, MODELS, day)
    pred_7d_clean = {cat: pred_7d.get(cat, 0) for cat in CATEGORIES}

    actual_bulan_rb = {
        cat: (actual_hari.get(cat, 0) * day) / 1000
        for cat in CATEGORIES
    }

    # ── Head 3 ───────────────────────────────────────────────────────
    result_h3 = run_head3(
        actual_dict_rb    = actual_bulan_rb,
        pred_7d_rupiah    = pred_7d_clean,
        budget_bulanan    = budget_bulanan,
        saldo_sisa_rupiah = saldo_sisa,
        day_of_month      = day,
        models            = MODELS,
    )

    return {
        "status"     : "success",
        "scan_result": {
            "store_name"  : result_h1["store_name"],
            "date"        : result_h1["date"],
            "items"       : result_h1["items"],
            "total_rp"    : result_h1["total"],
            "needs_review": result_h1["needs_review"],
        },
        "prediksi_7hari"     : pred_7d_clean,
        "rekomendasi"        : {
            "label"             : result_h3["label"],
            "label_upper"       : result_h3["label_upper"],
            "confidence"        : result_h3["confidence"],
            "pesan"             : result_h3["pesan"],
            "saldo_rp"          : result_h3["saldo_rp"],
            "days_remaining"    : result_h3["days_remaining"],
            "proj_overall_pct"  : result_h3["proj_overall_pct"],
            "est_saldo_7hari_rp": result_h3["est_saldo_7hari_rp"],
            "all_probs"         : result_h3["all_probs"],
        },
        "status_per_kategori": result_h3["categories"],
    }


@app.post("/prediksi")
async def prediksi(req: PrediksiRequest):
    """
    Prediksi + rekomendasi dari data DB (tanpa foto).
    Dipanggil Express untuk hitung ulang dashboard.
    """
    if not MODELS:
        raise HTTPException(503, "Model belum siap")

    day        = req.day_of_month or datetime.now().day
    saldo_sisa = req.saldo_sisa or max(
        0, req.budget_bulanan - sum(req.actual_hari_ini.values()) * day
    )

    pred_7d       = run_head2(req.actual_hari_ini, MODELS, day)
    pred_7d_clean = {cat: pred_7d.get(cat, 0) for cat in CATEGORIES}

    actual_bulan_rb = {
        cat: (req.actual_hari_ini.get(cat, 0) * day) / 1000
        for cat in CATEGORIES
    }

    result_h3 = run_head3(
        actual_dict_rb    = actual_bulan_rb,
        pred_7d_rupiah    = pred_7d_clean,
        budget_bulanan    = req.budget_bulanan,
        saldo_sisa_rupiah = saldo_sisa,
        day_of_month      = day,
        models            = MODELS,
    )

    return {
        "status"             : "success",
        "prediksi_7hari"     : pred_7d_clean,
        "rekomendasi"        : {
            "label"             : result_h3["label"],
            "confidence"        : result_h3["confidence"],
            "pesan"             : result_h3["pesan"],
            "saldo_rp"          : result_h3["saldo_rp"],
            "proj_overall_pct"  : result_h3["proj_overall_pct"],
            "est_saldo_7hari_rp": result_h3["est_saldo_7hari_rp"],
            "all_probs"         : result_h3["all_probs"],
        },
        "status_per_kategori": result_h3["categories"],
    }
