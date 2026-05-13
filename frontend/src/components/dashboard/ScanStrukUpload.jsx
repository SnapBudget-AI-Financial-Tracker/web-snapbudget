import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  X,
  CheckCircle,
  Loader2,
  Camera,
  ImageUp,
  FlipHorizontal,
  AlertTriangle,
  ChevronDown,
  ScanSearch,
  Brain,
  Tag,
  Coins,
  Database,
} from "lucide-react";
import Button from "../ui/Button";
import transactionService from "../../services/transactionService";
import { useToast } from "../../context/ToastContext";

const MODE = { IDLE: "idle", CAMERA: "camera", PREVIEW: "preview" };

const SCAN_STEPS = [
  { Icon: ScanSearch, text: "Membaca gambar struk..." },
  { Icon: Brain, text: "AI menganalisis item..." },
  { Icon: Tag, text: "Mengkategorikan belanja..." },
  { Icon: Coins, text: "Menghitung total & rekomendasi..." },
  { Icon: Database, text: "Menyimpan ke database..." },
];
const STEP_DURATION = 2200; // ms per step

function ScanLoadingOverlay() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Step ticker
    const stepTimer = setInterval(() => {
      setStep((s) => (s < SCAN_STEPS.length - 1 ? s + 1 : s));
    }, STEP_DURATION);

    // Progress bar (caps at 95% until done)
    const total = SCAN_STEPS.length * STEP_DURATION;
    let elapsed = 0;
    const progTimer = setInterval(() => {
      elapsed += 100;
      setProgress(Math.min(95, Math.round((elapsed / total) * 100)));
    }, 100);

    return () => {
      clearInterval(stepTimer);
      clearInterval(progTimer);
    };
  }, []);

  const current = SCAN_STEPS[step];

  return (
    <div className="scan-loading-overlay">
      {/* Animated receipt */}
      <div className="scan-loading-receipt">
        <div className="scan-loading-paper">
          <div className="scan-beam" />
          {[60, 45, 70, 50, 55, 40, 65].map((w, i) => (
            <div
              key={i}
              className="scan-receipt-line"
              style={{ width: `${w}%`, animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
        <div className="scan-orbit">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="scan-orbit-dot"
              style={{ animationDelay: `${i * 0.25}s` }}
            />
          ))}
        </div>
      </div>

      <div className="scan-loading-step-wrap">
        <span className="scan-loading-icon">
          <current.Icon size={22} strokeWidth={1.8} />
        </span>
        <p className="scan-loading-text">{current.text}</p>
      </div>

      <div className="scan-loading-bar-track">
        <div
          className="scan-loading-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="scan-loading-pct">{progress}%</p>

      <div className="scan-loading-steps">
        {SCAN_STEPS.map((_, i) => (
          <div
            key={i}
            className={`scan-step-dot ${i <= step ? "active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

function ReceiptOverlay() {
  const x = 35,
    y = 29,
    w = 130,
    h = 209;
  const arm = 18;
  const corner = {
    fill: "none",
    stroke: "#34d399",
    strokeWidth: 3,
    strokeLinecap: "round",
  };

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 267"
      preserveAspectRatio="none"
    >
      <defs>
        <mask id="receipt-mask">
          <rect width="200" height="267" fill="white" />
          <rect x={x} y={y} width={w} height={h} rx="6" fill="black" />
        </mask>
      </defs>

      <rect
        width="200"
        height="267"
        fill="rgba(0,0,0,0.38)"
        mask="url(#receipt-mask)"
      />

      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="6"
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
        strokeDasharray="5 3"
      />

      {/* Corner — top-left */}
      <polyline
        points={`${x},${y + arm} ${x},${y} ${x + arm},${y}`}
        {...corner}
      />
      <polyline
        points={`${x + w - arm},${y} ${x + w},${y} ${x + w},${y + arm}`}
        {...corner}
      />
      <polyline
        points={`${x},${y + h - arm} ${x},${y + h} ${x + arm},${y + h}`}
        {...corner}
      />
      <polyline
        points={`${x + w - arm},${y + h} ${x + w},${y + h} ${x + w},${y + h - arm}`}
        {...corner}
      />

      <text
        x="100"
        y="18"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(255,255,255,0.82)"
        fontSize="9"
        fontFamily="Inter, sans-serif"
      >
        Posisikan struk di dalam bingkai
      </text>
    </svg>
  );
}

export default function ScanStrukUpload({ onSuccess, onClose }) {
  const [mode, setMode] = useState(MODE.CAMERA);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [camError, setCamError] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [videoReady, setVideoReady] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(
    async (facing = facingMode) => {
      stopCamera();
      setCamError(null);
      setVideoReady(false);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.oncanplay = () => setVideoReady(true);
          videoRef.current.play();
        }
      } catch (err) {
        console.error("Camera error:", err);
        if (err.name === "NotAllowedError") {
          setCamError(
            "Izin kamera ditolak. Aktifkan akses kamera di pengaturan browser.",
          );
        } else if (err.name === "NotFoundError") {
          setCamError("Tidak ada kamera yang terdeteksi di perangkat ini.");
        } else {
          setCamError(
            "Gagal membuka kamera. Coba lagi atau gunakan upload gambar.",
          );
        }
      }
    },
    [facingMode, stopCamera],
  );

  const handleFlipCamera = async () => {
    const newFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacing);
    await startCamera(newFacing);
  };

  const handleClose = useCallback(() => {
    stopCamera();
    if (onClose) onClose();
  }, [stopCamera, onClose]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    const sx = Math.round(vw * 0.175);
    const sy = Math.round(vh * 0.11);
    const sw = Math.round(vw * 0.65);
    const sh = Math.round(vh * 0.78);

    canvas.width = sw;
    canvas.height = sh;
    canvas.getContext("2d").drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);

    canvas.toBlob(
      (blob) => {
        const captured = new File([blob], `struk-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setFile(captured);
        setPreview(URL.createObjectURL(blob));
        setScanResult(null);
        stopCamera();
        setMode(MODE.PREVIEW);
      },
      "image/jpeg",
      0.92,
    );
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      showToast({
        message: "Hanya file gambar yang diperbolehkan",
        variant: "error",
      });
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      showToast({ message: "Ukuran file maksimal 5MB", variant: "error" });
      return;
    }

    setFile(selectedFile);
    setScanResult(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selectedFile);
    setMode(MODE.PREVIEW);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await transactionService.scanStruk(file);
      setScanResult(result);
      showToast({
        message: `Berhasil scan ${result.transaksi_disimpan} item dari struk`,
        variant: "success",
      });
      if (onSuccess) onSuccess(result);
    } catch (error) {
      console.error("Scan error:", error);
      showToast({
        message: error.response?.data?.message || "Gagal memproses struk",
        variant: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = async () => {
    setFile(null);
    setPreview(null);
    setScanResult(null);
    setCamError(null);
    setVideoReady(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setMode(MODE.CAMERA);
    await startCamera();
  };

  useEffect(() => {
    const t = setTimeout(() => startCamera(), 0);
    return () => {
      clearTimeout(t);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (amount) => {
    const formatted = Math.abs(Math.round(amount))
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Rp ${formatted}`;
  };

  return (
    <div className="scan-struk-card">
      <h3 className="scan-struk-title">Scan Struk Belanja</h3>

      {mode === MODE.CAMERA && (
        <div className="scan-camera-wrap">
          {camError ? (
            <div className="scan-cam-error">
              <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-center text-zinc-700">{camError}</p>
              {/* Fallback: buka galeri jika kamera gagal */}
              <button
                className="mt-3 flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageUp className="h-4 w-4" />
                Upload dari Galeri
              </button>
              <button
                className="mt-2 text-xs text-zinc-400 underline"
                onClick={() => {
                  setCamError(null);
                  startCamera();
                }}
              >
                Coba lagi
              </button>
            </div>
          ) : (
            <>
              <div className="scan-viewfinder">
                {!videoReady && (
                  <div className="scan-video-placeholder" aria-hidden="true" />
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="scan-video"
                  style={{ opacity: videoReady ? 1 : 0 }}
                />
                {videoReady && <ReceiptOverlay />}

                <button
                  className="scan-close-btn"
                  onClick={handleClose}
                  title="Tutup kamera"
                  aria-label="Tutup kamera"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>

                <button
                  className="scan-flip-btn"
                  onClick={handleFlipCamera}
                  title="Ganti kamera"
                >
                  <FlipHorizontal className="h-5 w-5" />
                </button>
              </div>

              <div className="scan-bottom-bar">
                <button
                  className="scan-gallery-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload dari galeri"
                >
                  <ImageUp className="h-5 w-5" />
                </button>

                <button
                  className="scan-shutter-btn"
                  onClick={handleCapture}
                  aria-label="Ambil foto"
                >
                  <span className="scan-shutter-inner" />
                </button>

                <div className="w-12" />
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {mode === MODE.PREVIEW && (
        <div className="space-y-4">
          {isUploading ? (
            <ScanLoadingOverlay />
          ) : (
            <div className="relative">
              <img
                src={preview}
                alt="Preview struk"
                className="w-full h-64 object-contain bg-zinc-50 rounded-lg border border-zinc-200"
              />
              <button
                onClick={handleReset}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-zinc-100 transition-colors"
              >
                <X className="h-4 w-4 text-zinc-600" />
              </button>
            </div>
          )}

          {/* Scan result */}
          {scanResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-emerald-900 mb-2">
                    Scan Berhasil!
                  </h4>
                  <div className="space-y-2 text-sm text-emerald-800">
                    <p>
                      <strong>
                        {scanResult.scan_result.items.length} item
                      </strong>{" "}
                      terdeteksi
                    </p>
                    <p>
                      Total:{" "}
                      <strong>
                        {formatCurrency(scanResult.scan_result.total_rp)}
                      </strong>
                    </p>
                    {scanResult.scan_result.store_name &&
                      scanResult.scan_result.store_name !==
                        "Tidak terdeteksi" && (
                        <p>
                          Toko:{" "}
                          <strong>{scanResult.scan_result.store_name}</strong>
                        </p>
                      )}
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {scanResult.scan_result.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-xs bg-white rounded px-2 py-1.5"
                      >
                        <div className="flex-1">
                          <span className="text-zinc-700">
                            {item.item_name}
                          </span>
                          <span className="ml-2 text-zinc-500">
                            ({item.kategori})
                          </span>
                        </div>
                        <span className="font-medium text-zinc-900">
                          {formatCurrency(item.harga)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {scanResult.rekomendasi && (
                    <div className="mt-3 pt-3 border-t border-emerald-200">
                      <p className="text-xs font-semibold text-emerald-900 mb-1.5">
                        Status: {scanResult.rekomendasi.label_upper}
                      </p>
                      <p className="text-xs text-emerald-800">
                        {scanResult.rekomendasi.pesan}
                      </p>
                      {scanResult.rekomendasi.saldo_rp > 0 && (
                        <p className="text-xs text-emerald-700 mt-1">
                          Sisa saldo:{" "}
                          <strong>
                            {formatCurrency(scanResult.rekomendasi.saldo_rp)}
                          </strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!isUploading && (
            <div className="flex gap-3">
              {!scanResult && (
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  variant="gradient"
                  className="flex-1"
                  icon={Upload}
                >
                  Scan Struk
                </Button>
              )}
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1"
              >
                {scanResult ? "Scan Lagi" : "Batal"}
              </Button>
            </div>
          )}
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
