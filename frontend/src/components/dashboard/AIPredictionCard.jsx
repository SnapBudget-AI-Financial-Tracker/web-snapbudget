import {
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  Sparkles,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getCategoryIcon } from "../../utils/categoryIcons.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_BAR_COLORS = {
  makanan: "bg-orange-400",
  minuman: "bg-blue-400",
  transportasi: "bg-purple-400",
  belanja: "bg-pink-400",
  tagihan: "bg-red-400",
  hiburan: "bg-yellow-400",
  kesehatan: "bg-green-400",
  "lain-lain": "bg-zinc-400",
};

/** Maps a financial status label to a 0–100 health score. */
const HEALTH_SCORE_MAP = {
  hemat: 92,
  aman: 76,
  waspada: 52,
  boros: 30,
  darurat: 12,
};

/** Visual config per status label. */
const STATUS_CONFIG = {
  hemat: {
    badge: "bg-emerald-100 text-emerald-700",
    Icon: CheckCircle,
    gaugeColor: "#10b981",
    ringTrack: "#d1fae5",
  },
  aman: {
    badge: "bg-blue-100 text-blue-700",
    Icon: CheckCircle,
    gaugeColor: "#3b82f6",
    ringTrack: "#dbeafe",
  },
  waspada: {
    badge: "bg-amber-100 text-amber-700",
    Icon: AlertTriangle,
    gaugeColor: "#f59e0b",
    ringTrack: "#fef3c7",
  },
  boros: {
    badge: "bg-orange-100 text-orange-700",
    Icon: AlertTriangle,
    gaugeColor: "#f97316",
    ringTrack: "#ffedd5",
  },
  darurat: {
    badge: "bg-rose-100 text-rose-700",
    Icon: AlertTriangle,
    gaugeColor: "#ef4444",
    ringTrack: "#fee2e2",
  },
};

/** Dot colour for per-category status indicators. */
const CAT_DOT_COLORS = {
  hemat: "bg-emerald-500",
  aman: "bg-blue-500",
  waspada: "bg-amber-500",
  boros: "bg-orange-500",
  darurat: "bg-rose-500",
};

// SVG gauge dimensions
const GAUGE_RADIUS = 40;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS; // ≈ 251.33

// ─── Component ────────────────────────────────────────────────────────────────

export default function AIPredictionCard({
  prediksi,
  rekomendasi,
  statusPerKategori,
}) {
  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatCurrency = (amount) => {
    const abs = Math.abs(Math.round(amount));
    return `Rp ${abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const label = rekomendasi?.label?.toLowerCase() || "aman";
  const healthScore = HEALTH_SCORE_MAP[label] ?? 50;
  const scoreOffset = GAUGE_CIRCUMFERENCE * (1 - healthScore / 100);

  const conf = STATUS_CONFIG[label] || STATUS_CONFIG.aman;
  const { Icon: StatusIcon, gaugeColor, ringTrack } = conf;

  // Prediction bar-chart data
  const prediksiEntries = Object.entries(prediksi || {}).filter(
    ([, v]) => v > 0,
  );
  const totalPrediksi = prediksiEntries.reduce((s, [, v]) => s + v, 0);
  const maxPrediksiVal = Math.max(...prediksiEntries.map(([, v]) => v), 1);
  const topPrediksi = [...prediksiEntries]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const hasData = prediksi || rekomendasi;

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!hasData) {
    return (
      <div className="bg-white rounded-[var(--radius-xl)] border border-teal-100/60 shadow-[var(--shadow-md)] p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center mb-3">
          <Activity size={28} className="text-zinc-200" />
        </div>
        <p className="text-sm font-medium text-zinc-500">Belum ada data AI</p>
        <p className="text-xs text-zinc-400 mt-1 max-w-[200px]">
          Tambahkan transaksi untuk mendapatkan insight AI.
        </p>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-[var(--radius-xl)] border border-teal-100/60 shadow-[var(--shadow-md)] p-6 animate-fadeIn flex flex-col gap-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-sm flex-shrink-0">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <h3
              className="text-base font-semibold text-zinc-900 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              AI Insight
            </h3>
            <p className="text-xs text-zinc-400 leading-tight">
              Prediksi &amp; Rekomendasi
            </p>
          </div>
        </div>

        <Link
          to="/analytics"
          className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
        >
          Lihat Detail
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* ── Health-Score Gauge + Status ── */}
      {rekomendasi && (
        <div className="flex items-center gap-4">
          {/* Circular SVG gauge */}
          <div
            className="relative flex-shrink-0"
            style={{ width: 88, height: 88 }}
          >
            <svg
              width="88"
              height="88"
              viewBox="0 0 100 100"
              className="-rotate-90"
              aria-hidden="true"
            >
              {/* Track ring */}
              <circle
                cx="50"
                cy="50"
                r={GAUGE_RADIUS}
                fill="none"
                strokeWidth="9"
                stroke={ringTrack}
              />
              {/* Progress arc */}
              <circle
                cx="50"
                cy="50"
                r={GAUGE_RADIUS}
                fill="none"
                strokeWidth="9"
                stroke={gaugeColor}
                strokeLinecap="round"
                strokeDasharray={GAUGE_CIRCUMFERENCE}
                strokeDashoffset={scoreOffset}
                style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
              />
            </svg>

            {/* Score text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-xl font-bold text-zinc-900 leading-none"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {healthScore}
              </span>
              <span className="text-[9px] text-zinc-400 mt-0.5">/ 100</span>
            </div>
          </div>

          {/* Status info */}
          <div className="flex-1 min-w-0">
            {/* Status badge */}
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold mb-2 ${conf.badge}`}
            >
              <StatusIcon size={10} />
              {rekomendasi.label_upper || label.toUpperCase()}
            </div>

            {/* AI message */}
            <p className="text-sm text-zinc-600 leading-snug line-clamp-3">
              {rekomendasi.pesan}
            </p>

            {/* Meta row */}
            <div className="flex items-center gap-2.5 mt-1.5 text-xs text-zinc-400">
              <span>{rekomendasi.days_remaining} hari tersisa</span>
              <span className="w-1 h-1 rounded-full bg-zinc-200 flex-shrink-0" />
              <span>{Math.round(rekomendasi.confidence)}% akurasi</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Budget Estimate Summary ── */}
      {rekomendasi?.est_saldo_7hari_rp !== undefined && (
        <div className="grid grid-cols-2 gap-3 bg-teal-50/60 rounded-xl px-4 py-3 border border-teal-100/60">
          <div>
            <p className="text-[10px] text-zinc-400 mb-0.5 uppercase tracking-wide">
              Estimasi sisa 7 hari
            </p>
            <p
              className="text-sm font-bold text-teal-800"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {formatCurrency(rekomendasi.est_saldo_7hari_rp)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 mb-0.5 uppercase tracking-wide">
              Total prediksi 7 hari
            </p>
            <p
              className="text-sm font-bold text-zinc-700"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {formatCurrency(totalPrediksi)}
            </p>
          </div>
        </div>
      )}

      {/* ── 7-Day Prediction Bar Chart ── */}
      {topPrediksi.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Prediksi 7 Hari per Kategori
          </p>

          {/* Bar chart */}
          <div className="flex items-end gap-1.5 h-[72px]">
            {topPrediksi.map(([kategori, amount]) => {
              const barHeightPx = Math.max(
                Math.round((amount / maxPrediksiVal) * 56),
                4,
              );
              const barColor = CATEGORY_BAR_COLORS[kategori] || "bg-teal-400";

              return (
                <div
                  key={kategori}
                  className="flex-1 flex flex-col items-center gap-1 group relative"
                >
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <div className="bg-zinc-900 text-white text-[9px] font-medium px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                      <span className="block capitalize">{kategori}</span>
                      <span className="block font-bold">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                    {/* Tooltip arrow */}
                    <div className="w-2 h-1 overflow-hidden" aria-hidden="true">
                      <div className="w-2 h-2 bg-zinc-900 rotate-45 -translate-y-1 mx-auto" />
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="w-full flex items-end justify-center">
                    <div
                      className={`w-full rounded-t-md ${barColor} opacity-75 group-hover:opacity-100 transition-opacity duration-150`}
                      style={{
                        height: `${barHeightPx}px`,
                        transition: "height 0.8s ease-out, opacity 0.15s ease",
                      }}
                    />
                  </div>

                  {/* Category abbreviation */}
                  <span className="text-[9px] text-zinc-400 truncate w-full text-center leading-tight">
                    {kategori.slice(0, 4)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Per-Category Status Indicators ── */}
      {statusPerKategori && Object.keys(statusPerKategori).length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Status Kategori
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {Object.entries(statusPerKategori).map(([kategori, statusData]) => {
              const catLabel = statusData?.label?.toLowerCase() || "aman";
              const dotColor = CAT_DOT_COLORS[catLabel] || "bg-zinc-400";
              const CatIcon = getCategoryIcon(kategori);
              const catConf = STATUS_CONFIG[catLabel] || STATUS_CONFIG.aman;

              return (
                <div
                  key={kategori}
                  className="flex items-center gap-1.5 text-xs text-zinc-600"
                >
                  {/* Status dot */}
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`}
                    aria-hidden="true"
                  />
                  {/* Category icon */}
                  <CatIcon size={11} className="flex-shrink-0 text-zinc-400" />
                  {/* Category name */}
                  <span className="truncate capitalize">
                    {kategori.replace(/_/g, " ")}
                  </span>
                  {/* Status label badge */}
                  <span
                    className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${catConf.badge}`}
                  >
                    {catLabel.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── No-data fallback (partial) ── */}
      {!rekomendasi && !prediksi && (
        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-50 rounded-xl px-4 py-3">
          <Info size={14} className="flex-shrink-0 text-zinc-300" />
          <span>
            Tambahkan lebih banyak transaksi untuk prediksi yang lebih akurat.
          </span>
        </div>
      )}
    </div>
  );
}
