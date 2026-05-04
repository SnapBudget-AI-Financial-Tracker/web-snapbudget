"""
SnapBudget — inference_modal.py
Deploy AI inference server ke Modal.com dengan GPU T4

Cara deploy:
    pip install modal
    modal token new
    modal deploy inference_modal.py

Cara test:
    modal run inference_modal.py

URL setelah deploy:
    https://[username]--snapbudget-ai-fastapi-app.modal.run

CC26-PSU098 | Coding Camp 2026 DBS Foundation
"""

import modal

# ── Definisi image Docker untuk Modal ────────────────────────────────
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        # Web framework
        "fastapi==0.135.3",
        "uvicorn[standard]==0.44.0",
        "python-multipart==0.0.20",
        # AI — PyTorch + Donut
        "torch==2.10.0",
        "torchvision==0.25.0",
        "transformers==5.0.0",
        "sentencepiece==0.2.1",
        # AI — TensorFlow
        "tensorflow==2.19.0",
        # Data processing
        "numpy==2.0.2",
        "Pillow==11.3.0",
        "scikit-learn==1.6.1",
        # HuggingFace
        "huggingface_hub>=0.23.4",
        # Utils
        "python-dotenv==1.0.1",
    )
    .add_local_file("./inference.py", "/root/inference.py")
)

# ── Definisi app Modal ────────────────────────────────────────────────
app = modal.App(
    name  = "snapbudget-ai",
    image = image,
)



# ── Volume untuk cache model (agar tidak download ulang) ─────────────
model_volume = modal.Volume.from_name(
    "snapbudget-models-cache",
    create_if_missing=True,
)
MODEL_CACHE_DIR = "/cache/weights"


# ══════════════════════════════════════════════════════════════════════
# CLASS INFERENCE — load model sekali, reuse berkali-kali
# ══════════════════════════════════════════════════════════════════════
@app.cls(
    gpu           = "T4",         # GPU T4 gratis
    memory        = 8192,                   # 8GB RAM
    timeout       = 300,                    # 5 menit timeout per request
    scaledown_window = 60,            # sleep setelah 1 menit idle
    volumes       = {MODEL_CACHE_DIR: model_volume},
    secrets       = [modal.Secret.from_name("snapbudget-secrets")],

)
class SnapBudgetAI:
    """
    Class ini di-instantiate sekali per container Modal.
    Model di-load saat container start (method load).
    Inference bisa dipanggil berkali-kali tanpa load ulang.
    """

    @modal.enter()
    def load(self):
        """Load semua model saat container start."""
        import os, sys

        # Tambah path agar bisa import inference.py
        sys.path.append("/app")

        from inference import load_all_models, download_models_from_hf

        HF_TOKEN  = os.environ["HF_TOKEN"]
        REPO_ID   = os.environ.get("HF_REPO_ID", "Rizal88/snapbudget-models")

        # Download model kalau belum ada di cache volume
        weights_path = f"{MODEL_CACHE_DIR}/head1c_v2.weights.h5"
        if not os.path.exists(weights_path):
            print("Download model dari HuggingFace ke cache volume...")
            download_models_from_hf(REPO_ID, HF_TOKEN, MODEL_CACHE_DIR)
            model_volume.commit()  # simpan ke volume
            print("Model tersimpan di cache volume!")
        else:
            print("Model sudah ada di cache volume, skip download.")

        # Load semua model ke memory
        self.models = load_all_models(MODEL_CACHE_DIR)
        print("Semua model loaded! Container siap menerima request.")

    @modal.method()
    def scan_struk(
        self,
        image_bytes   : bytes,
        budget_bulanan: int = 2000000,
        day_of_month  : int = 0,
        saldo_sisa    : int = 0,
    ) -> dict:
        """
        Scan foto struk → ekstrak item → prediksi + rekomendasi.

        Args:
            image_bytes   : bytes gambar struk
            budget_bulanan: budget bulanan (Rupiah)
            day_of_month  : hari ke berapa (0 = hari ini)
            saldo_sisa    : saldo sisa (Rupiah)

        Returns:
            dict hasil lengkap pipeline
        """
        from datetime import datetime
        from collections import defaultdict
        from inference import run_head1, run_head2, run_head3, CATEGORIES

        day = day_of_month or datetime.now().day

        # Head 1 — baca struk
        result_h1 = run_head1(image_bytes, self.models)

        if result_h1.get("status") == "failed":
            return {"status": "failed", "error": "Struk tidak terbaca"}

        if result_h1.get("status") == "partial":
            return {"status": "partial", "scan_result": result_h1}

        # Akumulasi per kategori
        actual_hari = defaultdict(int)
        for it in result_h1["items"]:
            actual_hari[it["kategori"]] += it["harga"]
        actual_hari = dict(actual_hari)

        if saldo_sisa == 0:
            saldo_sisa = max(
                0, budget_bulanan - sum(actual_hari.values()) * day
            )

        # Head 2
        pred_7d       = run_head2(actual_hari, self.models, day)
        pred_7d_clean = {cat: pred_7d.get(cat, 0) for cat in CATEGORIES}

        actual_bulan_rb = {
            cat: (actual_hari.get(cat, 0) * day) / 1000
            for cat in CATEGORIES
        }

        # Head 3
        result_h3 = run_head3(
            actual_dict_rb    = actual_bulan_rb,
            pred_7d_rupiah    = pred_7d_clean,
            budget_bulanan    = budget_bulanan,
            saldo_sisa_rupiah = saldo_sisa,
            day_of_month      = day,
            models            = self.models,
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

    @modal.method()
    def prediksi(
        self,
        actual_hari_ini: dict,
        budget_bulanan : int = 2000000,
        day_of_month   : int = 0,
        saldo_sisa     : int = 0,
    ) -> dict:
        """
        Prediksi + rekomendasi tanpa foto struk.
        Lebih cepat karena skip Donut.
        """
        from datetime import datetime
        from inference import run_head2, run_head3, CATEGORIES

        day        = day_of_month or datetime.now().day
        saldo_sisa = saldo_sisa or max(
            0, budget_bulanan - sum(actual_hari_ini.values()) * day
        )

        actual_hari_rb = {
            cat: actual_hari_ini.get(cat, 0) / 1000
            for cat in CATEGORIES
        }

        pred_7d       = run_head2(actual_hari_rb, self.models, day)
        pred_7d_clean = {cat: pred_7d.get(cat, 0) for cat in CATEGORIES}

        actual_bulan_rb = {
            cat: actual_hari_ini.get(cat, 0) / 1000
            for cat in CATEGORIES
        }

        result_h3 = run_head3(
            actual_dict_rb    = actual_bulan_rb,
            pred_7d_rupiah    = pred_7d_clean,
            budget_bulanan    = budget_bulanan,
            saldo_sisa_rupiah = saldo_sisa,
            day_of_month      = day,
            models            = self.models,
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


# ══════════════════════════════════════════════════════════════════════
# FASTAPI APP — expose sebagai HTTP endpoint
# ══════════════════════════════════════════════════════════════════════
@app.function(
    image   = image,
    gpu     = "T4",
    memory  = 8192,
    timeout = 300,
    scaledown_window = 60,
    volumes = {MODEL_CACHE_DIR: model_volume},
    secrets = [modal.Secret.from_name("snapbudget-secrets")],
    
)
@modal.asgi_app()
def fastapi_app():
    """
    FastAPI app yang di-expose sebagai HTTP endpoint Modal.
    URL: https://[username]--snapbudget-ai-fastapi-app.modal.run
    """
    import os, io, sys
    from datetime import datetime
    from collections import defaultdict
    from contextlib import asynccontextmanager

    from fastapi import FastAPI, File, UploadFile, Form, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    from typing import Optional

    sys.path.append("/app")
    from inference import (
        load_all_models, download_models_from_hf,
        run_head1, run_head2, run_head3,
        CATEGORIES,
    )

    # Load model
    HF_TOKEN = os.environ["HF_TOKEN"]
    REPO_ID  = os.environ.get("HF_REPO_ID", "Rizal88/snapbudget-models")

    if not os.path.exists(f"{MODEL_CACHE_DIR}/head1c_v2.weights.h5"):
        download_models_from_hf(REPO_ID, HF_TOKEN, MODEL_CACHE_DIR)
        model_volume.commit()

    MODELS = load_all_models(MODEL_CACHE_DIR)

    # FastAPI
    web_app = FastAPI(title="SnapBudget AI — Modal.com", version="1.0.0")

    web_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    class PrediksiRequest(BaseModel):
        actual_hari_ini: dict
        budget_bulanan : int = 2000000
        day_of_month   : Optional[int] = None
        saldo_sisa     : Optional[int] = None

    @web_app.get("/health")
    def health():
        return {
            "status"  : "ok",
            "platform": "Modal.com GPU T4",
            "models"  : "loaded",
            "time"    : datetime.now().isoformat(),
        }

    @web_app.post("/scan-struk")
    async def scan_struk(
        file          : UploadFile = File(...),
        budget_bulanan: int = Form(default=2000000),
        day_of_month  : int = Form(default=0),
        saldo_sisa    : int = Form(default=0),
    ):
        if file.content_type not in ["image/jpeg","image/png","image/jpg"]:
            raise HTTPException(400, "File harus jpg atau png")

        image_bytes = await file.read()
        day         = day_of_month or datetime.now().day

        result_h1 = run_head1(image_bytes, MODELS)

        if result_h1.get("status") == "failed":
            raise HTTPException(422, "Struk tidak terbaca")
        if result_h1.get("status") == "partial":
            return {"status": "partial", "scan_result": result_h1}

        actual_hari = defaultdict(int)
        for it in result_h1["items"]:
            actual_hari[it["kategori"]] += it["harga"]
        actual_hari = dict(actual_hari)

        if saldo_sisa == 0:
            saldo_sisa = max(
                0, budget_bulanan - sum(actual_hari.values()) * day
            )

        pred_7d       = run_head2(actual_hari, MODELS, day)
        pred_7d_clean = {cat: pred_7d.get(cat, 0) for cat in CATEGORIES}

        actual_bulan_rb = {
            cat: (actual_hari.get(cat, 0) * day) / 1000
            for cat in CATEGORIES
        }

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

    @web_app.post("/prediksi")
    async def prediksi(req: PrediksiRequest):
        day        = req.day_of_month or datetime.now().day
        saldo_sisa = req.saldo_sisa or max(
            0, req.budget_bulanan - sum(req.actual_hari_ini.values()) * day
        )

        actual_hari_rb = {
            cat: req.actual_hari_ini.get(cat, 0) / 1000
            for cat in CATEGORIES
        }

        pred_7d       = run_head2(actual_hari_rb, MODELS, day)
        pred_7d_clean = {cat: pred_7d.get(cat, 0) for cat in CATEGORIES}

        actual_bulan_rb = {
                cat: req.actual_hari_ini.get(cat, 0) / 1000
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

    return web_app


# ══════════════════════════════════════════════════════════════════════
# LOCAL TEST — modal run inference_modal.py
# ══════════════════════════════════════════════════════════════════════
@app.local_entrypoint()
def test():
    """Test inference dari lokal tanpa deploy."""
    print("Test SnapBudget AI di Modal...")

    ai = SnapBudgetAI()

    # Test prediksi manual
    result = ai.prediksi.remote(
        actual_hari_ini = {
            "makanan"      : 20000,
            "minuman"      : 0,
            "transportasi" : 0,
            "belanja"      : 0,
            "tagihan"      : 0,
            "hiburan"      : 0,
            "kesehatan"    : 0,
            "lain_lain"    : 0,
        },
        budget_bulanan = 2000000,
        day_of_month   = 19,
        saldo_sisa     = 0,
    )

    import json
    print(json.dumps(result, indent=2, ensure_ascii=False))
    print("\nTest selesai!")
