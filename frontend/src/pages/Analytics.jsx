import { useState, useEffect, createElement } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import AIPredictionCard from "../components/dashboard/AIPredictionCard";
import transactionService from "../services/transactionService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  RefreshCw,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Lightbulb,
} from "lucide-react";
import { getCategoryIcon } from "../utils/categoryIcons.js";
import { FinancialStatusBadge } from "../utils/categoryIcons.jsx";
import Skeleton from "../components/ui/Skeleton";
import Button from "../components/ui/Button";

// Suppress unused-import lint noise — kept for future use
void ArrowUp;
void ArrowDown;
void Activity;

/** Teal-emerald cohesive color palette for donut slices */
const DONUT_COLORS = [
  "#14b8a6", // teal-500
  "#0d9488", // teal-600
  "#10b981", // emerald-500
  "#059669", // emerald-600
  "#2dd4bf", // teal-400
  "#34d399", // emerald-400
  "#0f766e", // teal-700
  "#047857", // emerald-700
];

/** Per-category icon background + foreground colors */
const CATEGORY_STYLE = {
  makanan: { bg: "bg-orange-50", color: "text-orange-500" },
  minuman: { bg: "bg-blue-50", color: "text-blue-500" },
  transportasi: { bg: "bg-purple-50", color: "text-purple-500" },
  belanja: { bg: "bg-pink-50", color: "text-pink-500" },
  tagihan: { bg: "bg-red-50", color: "text-red-500" },
  hiburan: { bg: "bg-yellow-50", color: "text-yellow-600" },
  kesehatan: { bg: "bg-green-50", color: "text-green-500" },
  lain_lain: { bg: "bg-zinc-50", color: "text-zinc-500" },
};

/** Custom tooltip for BarChart */
function BarTooltip({ active, payload, totalAmount }) {
  if (!active || !payload || !payload.length) return null;
  const { name, amount } = payload[0].payload;
  const pct = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : 0;
  return (
    <div className="bg-white border border-teal-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-zinc-900 capitalize mb-1">{name}</p>
      <p className="text-teal-700 font-medium">
        Rp{" "}
        {Math.abs(Math.round(amount))
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
      </p>
      <p className="text-zinc-400 text-xs">{pct}% dari total</p>
    </div>
  );
}

/** Custom tooltip for Donut/Pie chart */
function DonutTooltip({ active, payload, totalAmount }) {
  if (!active || !payload || !payload.length) return null;
  const { name, value } = payload[0];
  const pct = totalAmount > 0 ? ((value / totalAmount) * 100).toFixed(1) : 0;
  return (
    <div className="bg-white border border-teal-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-zinc-900 capitalize mb-1">{name}</p>
      <p className="text-teal-700 font-medium">
        Rp{" "}
        {Math.abs(Math.round(value))
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
      </p>
      <p className="text-zinc-400 text-xs">{pct}% dari total</p>
    </div>
  );
}

// ─── Reusable stat card (compact) ──────────────────────────────────────────────

function StatCard({ icon, iconBg, iconColor, label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-teal-100/60 shadow-[var(--shadow-sm)] px-3 py-2.5 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center gap-1.5 mb-1">
        <div
          className={`w-5 h-5 rounded-md ${iconBg} flex items-center justify-center flex-shrink-0`}
        >
          {createElement(icon, { size: 11, className: iconColor })}
        </div>
        <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider leading-tight">
          {label}
        </p>
      </div>
      <p
        style={{ fontFamily: "var(--font-heading)" }}
        className="text-[15px] font-bold text-zinc-900 truncate leading-snug"
      >
        {value}
      </p>
      {sub && (
        <p className="text-[11px] text-zinc-400 capitalize truncate leading-tight">
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Analytics Summary Note ────────────────────────────────────────────────────

function AnalyticsSummary({ totalActual, budgetBulanan, projectedPct, kategoriTertinggi, kategoriTerendah, rekomendasi, formatIDR }) {
  // Build dynamic summary sentences
  const statusLabel = rekomendasi?.label || "HEMAT";
  const statusMap = {
    HEMAT: { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", accent: "bg-emerald-500" },
    WASPADA: { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", accent: "bg-amber-500" },
    DARURAT: { color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", accent: "bg-rose-500" },
  };
  const style = statusMap[statusLabel] || statusMap.HEMAT;

  const topCatName = kategoriTertinggi ? kategoriTertinggi[0].replace(/_/g, " ") : null;
  const lowCatName = kategoriTerendah ? kategoriTerendah[0].replace(/_/g, " ") : null;

  const summaryLines = [];
  summaryLines.push(
    `Bulan ini total pengeluaran aktual kamu ${formatIDR(totalActual)} (${projectedPct}% dari budget ${formatIDR(budgetBulanan)}).`
  );
  if (topCatName) {
    summaryLines.push(
      `Kategori tertinggi: ${topCatName} (${formatIDR(kategoriTertinggi[1])})${lowCatName && lowCatName !== topCatName ? `, terendah: ${lowCatName} (${formatIDR(kategoriTerendah[1])})` : ""}.`
    );
  }
  if (rekomendasi?.pesan) {
    summaryLines.push(rekomendasi.pesan);
  }

  return (
    <div className={`rounded-xl ${style.bg} border ${style.border} px-4 py-3 mb-6 animate-fadeIn`}>
      <div className="flex gap-3 items-start">
        <div className={`w-8 h-8 rounded-lg ${style.accent} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <Lightbulb size={15} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-sm font-semibold ${style.color}`}>Ringkasan Analytics</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.accent} text-white uppercase tracking-wide`}>
              {statusLabel}
            </span>
          </div>
          <p className={`text-sm ${style.color} opacity-85 leading-relaxed`}>
            {summaryLines.join(" ")}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function Analytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await transactionService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Gagal memuat data analytics. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await transactionService.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Gagal memuat data analytics. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, []);

  const formatIDR = (value) => {
    const absValue = Math.abs(Math.round(value));
    const formatted = absValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Rp ${formatted}`;
  };

  // ── Safe data extraction ────────────────────────────────────────────────────
  const prediksi7hari = dashboardData?.prediksi_7hari || {};
  const statusPerKategori = dashboardData?.status_per_kategori || {};
  const actualPerKategori = dashboardData?.actual_per_kategori || {};
  const userBudget = dashboardData?.user_budget || {};

  // ── Computed aggregates ─────────────────────────────────────────────────────
  const totalActual = Object.values(actualPerKategori).reduce(
    (sum, v) => sum + v,
    0,
  );
  const budgetBulanan = userBudget.budgetBulanan || 2000000;
  const sisaBudget = budgetBulanan - totalActual;
  const projectedPct =
    budgetBulanan > 0 ? ((totalActual / budgetBulanan) * 100).toFixed(1) : 0;

  // ── Rule-based fallback recommendation ─────────────────────────────────────
  let rekomendasi = {
    label: "HEMAT",
    pesan:
      "Pengeluaran sangat terkontrol! Pertahankan kebiasaan ini dan alokasikan sisa ke tabungan.",
    saldo_rp: sisaBudget,
    proj_pct: projectedPct,
  };
  if (projectedPct > 90) {
    rekomendasi = {
      label: "DARURAT",
      pesan:
        "Pengeluaran sudah melebihi 90% budget! Segera kurangi pengeluaran tidak penting.",
      saldo_rp: sisaBudget,
      proj_pct: projectedPct,
    };
  } else if (projectedPct > 70) {
    rekomendasi = {
      label: "WASPADA",
      pesan:
        "Pengeluaran sudah 70% dari budget. Pertimbangkan untuk lebih hemat.",
      saldo_rp: sisaBudget,
      proj_pct: projectedPct,
    };
  }

  // ── Chart data ──────────────────────────────────────────────────────────────
  const chartData = Object.entries(prediksi7hari).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace("_", " "),
    amount: value,
  }));

  const prediksiEntries = Object.entries(prediksi7hari);
  const totalPrediksi7Hari = prediksiEntries.reduce((sum, [, v]) => sum + v, 0);

  const nonZeroEntries = prediksiEntries.filter(([, v]) => v > 0);
  const sortedEntries = [...nonZeroEntries].sort(([, a], [, b]) => b - a);
  const kategoriTertinggi = sortedEntries[0] ?? null;
  const kategoriTerendah = sortedEntries[sortedEntries.length - 1] ?? null;

  const donutData = nonZeroEntries.map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace("_", " "),
    value,
  }));

  // ── Category status transform ───────────────────────────────────────────────
  const CATEGORIES = [
    "makanan",
    "minuman",
    "transportasi",
    "belanja",
    "tagihan",
    "hiburan",
    "kesehatan",
    "lain_lain",
  ];

  const displayStatusPerKategori = CATEGORIES.reduce((acc, key) => {
    const actual = actualPerKategori[key] || 0;
    const pred = prediksi7hari[key] || 0;
    const pct = pred > 0 ? ((actual / pred) * 100).toFixed(1) : 0;

    let label = "HEMAT";
    if (pct > 90) label = "DARURAT";
    else if (pct > 70) label = "WASPADA";

    const apiStatus = statusPerKategori[key];
    const finalLabel = typeof apiStatus === "string" ? apiStatus : label;

    acc[key] = {
      label: finalLabel,
      aktual_rp: actual,
      pred_rp: pred,
      pct_used: parseFloat(pct),
    };
    return acc;
  }, {});

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full overflow-x-hidden">
        {/* ══ Page Header ══════════════════════════════════════════════════════ */}
        <div className="mb-6 flex items-center justify-between animate-fadeIn">
          <div>
            <h1
              style={{ fontFamily: "var(--font-heading)" }}
              className="text-2xl font-bold text-teal-900"
            >
              Analytics &amp; Insights
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Analisis mendalam pengeluaran &amp; prediksi AI
            </p>
          </div>
          <button
            onClick={fetchAnalyticsData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-teal-100 text-teal-700 hover:bg-teal-50 rounded-xl text-sm font-medium shadow-sm transition-colors"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* ══ Error state ══════════════════════════════════════════════════════ */}
        {error ? (
          <div className="bg-white rounded-xl border border-rose-200 shadow-sm p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
              <AlertCircle className="h-6 w-6 text-rose-500" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 mb-1">
              Gagal memuat data
            </h3>
            <p className="text-sm text-zinc-500 mb-6">{error}</p>
            <Button
              variant="outline"
              className="w-auto px-4 py-2"
              onClick={fetchAnalyticsData}
            >
              Coba Lagi
            </Button>
          </div>
        ) : /* ══ Skeleton loading state ══════════════════════════════════════════ */
        isLoading ? (
          <>
            {/* Top section: AI card + 2×2 stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <Skeleton variant="card" className="min-h-[280px]" />
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} variant="card" />
                ))}
              </div>
            </div>

            {/* Charts: 3/5 + 2/5 */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
              <Skeleton variant="chart" className="lg:col-span-3 h-72" />
              <Skeleton variant="chart" className="lg:col-span-2 h-72" />
            </div>

            {/* Category 2×4 grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} variant="card" className="h-32" />
              ))}
            </div>
          </>
        ) : (
          /* ══ Main content ════════════════════════════════════════════════════ */
          <div className="animate-fadeIn">
            {/* ── Section 1: AI Prediction Card + 2×2 Stat Grid ─────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Left — AIPredictionCard */}
              <AIPredictionCard
                prediksi={prediksi7hari}
                rekomendasi={dashboardData?.rekomendasi ?? rekomendasi}
                statusPerKategori={statusPerKategori}
              />

              {/* Right — 2×2 stat grid */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  icon={TrendingUp}
                  iconBg="bg-indigo-50"
                  iconColor="text-indigo-600"
                  label="Prediksi 7 Hari"
                  value={formatIDR(totalPrediksi7Hari)}
                />

                <StatCard
                  icon={BarChart3}
                  iconBg="bg-teal-50"
                  iconColor="text-teal-600"
                  label="Aktual Bulan Ini"
                  value={formatIDR(totalActual)}
                />

                <StatCard
                  icon={ArrowUpRight}
                  iconBg="bg-rose-50"
                  iconColor="text-rose-600"
                  label="Kategori Tertinggi"
                  value={
                    kategoriTertinggi
                      ? kategoriTertinggi[0].replace("_", " ")
                      : "—"
                  }
                  sub={
                    kategoriTertinggi
                      ? formatIDR(kategoriTertinggi[1])
                      : undefined
                  }
                />

                <StatCard
                  icon={ArrowDownRight}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-600"
                  label="Kategori Terendah"
                  value={
                    kategoriTerendah
                      ? kategoriTerendah[0].replace("_", " ")
                      : "—"
                  }
                  sub={
                    kategoriTerendah
                      ? formatIDR(kategoriTerendah[1])
                      : undefined
                  }
                />
              </div>
            </div>

            {/* ── Analytics Summary Note ──────────────────────────────────── */}
            <AnalyticsSummary
              totalActual={totalActual}
              budgetBulanan={budgetBulanan}
              projectedPct={projectedPct}
              kategoriTertinggi={kategoriTertinggi}
              kategoriTerendah={kategoriTerendah}
              rekomendasi={dashboardData?.rekomendasi ?? rekomendasi}
              formatIDR={formatIDR}
            />

            {/* ── Section 2: Charts (3/5 + 2/5) ─────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
              {/* Bar Chart — Prediksi 7 Hari */}
              <div className="lg:col-span-3 bg-white rounded-xl border border-teal-100/60 shadow-[var(--shadow-md)] p-5">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <BarChart3 size={14} className="text-teal-600" />
                  </div>
                  <h2
                    style={{ fontFamily: "var(--font-heading)" }}
                    className="text-base font-semibold text-zinc-900"
                  >
                    Prediksi Pengeluaran 7 Hari
                  </h2>
                </div>

                {chartData.length > 0 ? (
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f0fdfa"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#7aada8", fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#7aada8", fontSize: 12 }}
                          tickFormatter={(value) =>
                            new Intl.NumberFormat("id-ID", {
                              notation: "compact",
                              compactDisplay: "short",
                            }).format(value)
                          }
                        />
                        <Tooltip
                          cursor={{ fill: "#f0fdfa" }}
                          content={
                            <BarTooltip totalAmount={totalPrediksi7Hari} />
                          }
                        />
                        <Bar
                          dataKey="amount"
                          fill="#14b8a6"
                          radius={[8, 8, 0, 0]}
                          barSize={36}
                          isAnimationActive={true}
                          animationDuration={800}
                          animationEasing="ease-out"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[260px] flex items-center justify-center">
                    <p className="text-sm text-zinc-400 text-center max-w-[240px]">
                      Belum ada data prediksi. Tambahkan transaksi untuk
                      mendapatkan prediksi AI.
                    </p>
                  </div>
                )}
              </div>

              {/* Donut Chart — Proporsi per Kategori */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-teal-100/60 shadow-[var(--shadow-md)] p-5">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <TrendingUp size={14} className="text-teal-600" />
                  </div>
                  <h2
                    style={{ fontFamily: "var(--font-heading)" }}
                    className="text-base font-semibold text-zinc-900"
                  >
                    Proporsi per Kategori
                  </h2>
                </div>

                {donutData.length > 0 ? (
                  <div className="flex flex-col items-center gap-4">
                    {/* Donut ring */}
                    <div className="h-[160px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                            isAnimationActive={true}
                            animationDuration={800}
                            animationEasing="ease-out"
                          >
                            {donutData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            content={
                              <DonutTooltip totalAmount={totalPrediksi7Hari} />
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Compact legend */}
                    <ul className="w-full space-y-1.5">
                      {donutData.map((entry, index) => {
                        const pct =
                          totalPrediksi7Hari > 0
                            ? (
                                (entry.value / totalPrediksi7Hari) *
                                100
                              ).toFixed(1)
                            : 0;
                        return (
                          <li
                            key={entry.name}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor:
                                    DONUT_COLORS[index % DONUT_COLORS.length],
                                }}
                              />
                              <span className="text-zinc-600 capitalize truncate">
                                {entry.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-zinc-400">{pct}%</span>
                              <span className="font-semibold text-zinc-800">
                                {formatIDR(entry.value)}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div className="h-[240px] flex items-center justify-center">
                    <p className="text-sm text-zinc-400 text-center">
                      Tidak ada data prediksi untuk ditampilkan.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Section 3: Category Status Grid (2×4) ──────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2
                  style={{ fontFamily: "var(--font-heading)" }}
                  className="text-base font-semibold text-zinc-900"
                >
                  Status per Kategori
                </h2>
                <span className="text-xs text-zinc-400 font-normal">
                  ({CATEGORIES.length} kategori)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(displayStatusPerKategori).map(
                  ([categoryName, status]) => {
                    const Icon = getCategoryIcon(categoryName);
                    const catStyle =
                      CATEGORY_STYLE[categoryName] ?? CATEGORY_STYLE.lain_lain;
                    const clampedPct = Math.min(status.pct_used, 100);
                    const progressColor =
                      status.label === "DARURAT"
                        ? "bg-rose-500"
                        : status.label === "WASPADA"
                          ? "bg-amber-500"
                          : "bg-emerald-500";

                    return (
                      <div
                        key={categoryName}
                        className="bg-white rounded-xl border border-teal-100/60 shadow-[var(--shadow-sm)] p-4 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-all duration-200 cursor-default"
                      >
                        {/* Top row: category icon + status badge */}
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={`w-9 h-9 rounded-xl ${catStyle.bg} flex items-center justify-center flex-shrink-0`}
                          >
                            <Icon className={`h-4 w-4 ${catStyle.color}`} />
                          </div>
                          <FinancialStatusBadge status={status.label} />
                        </div>

                        {/* Category name */}
                        <p className="text-sm font-semibold text-zinc-800 capitalize mb-1 truncate">
                          {categoryName.replace(/_/g, " ")}
                        </p>

                        {/* Amount */}
                        <p
                          className="text-base font-bold text-zinc-900 mb-2 truncate"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {formatIDR(status.aktual_rp)}
                        </p>

                        {/* Progress bar */}
                        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${progressColor}`}
                            style={{
                              width: `${clampedPct}%`,
                              transition: "width 0.8s ease-out",
                            }}
                            role="progressbar"
                            aria-valuenow={status.pct_used}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${categoryName} usage ${status.pct_used}%`}
                          />
                        </div>

                        {/* Footer */}
                        <p className="text-xs text-zinc-400 mt-1.5">
                          {status.pct_used}% dari prediksi
                        </p>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
