import { useState, useEffect } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
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
import { Sparkles, TrendingUp, ArrowUp, ArrowDown, AlertCircle } from "lucide-react";
import { getCategoryIcon } from "../utils/categoryIcons.js";
import { FinancialStatusBadge } from "../utils/categoryIcons.jsx";
import Skeleton from "../components/ui/Skeleton";
import Button from "../components/ui/Button";

/** Returns gradient classes for the AI banner based on recommendation status */
function getBannerGradient(label) {
  const normalized = (label || "").toUpperCase().trim();
  if (normalized === "HEMAT") return "from-emerald-500 to-emerald-600";
  if (normalized === "DARURAT") return "from-rose-500 to-rose-600";
  if (normalized === "WASPADA") return "from-amber-500 to-amber-600";
  return "from-indigo-500 to-violet-600";
}

/** Indigo/violet color palette for pie slices */
const DONUT_COLORS = [
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#a78bfa", // violet-400
  "#818cf8", // indigo-400
  "#c4b5fd", // violet-300
  "#7c3aed", // violet-600
  "#4f46e5", // indigo-600
  "#ddd6fe", // violet-200
];

/** Custom tooltip for BarChart */
function BarTooltip({ active, payload, totalAmount }) {
  if (!active || !payload || !payload.length) return null;
  const { name, amount } = payload[0].payload;
  const pct = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : 0;
  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-zinc-900 capitalize mb-1">{name}</p>
      <p className="text-zinc-700">
        {new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(amount)}
      </p>
      <p className="text-zinc-500">{pct}% dari total</p>
    </div>
  );
}

/** Custom tooltip for Donut/Pie chart */
function DonutTooltip({ active, payload, totalAmount }) {
  if (!active || !payload || !payload.length) return null;
  const { name, value } = payload[0];
  const pct = totalAmount > 0 ? ((value / totalAmount) * 100).toFixed(1) : 0;
  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-zinc-900 capitalize mb-1">{name}</p>
      <p className="text-zinc-700">
        {new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(value)}
      </p>
      <p className="text-zinc-500">{pct}% dari total</p>
    </div>
  );
}

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
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Transform data from API - with null checks
  const prediksi7hari = dashboardData?.prediksi_7hari || {};
  const statusPerKategori = dashboardData?.status_per_kategori || {};
  const actualPerKategori = dashboardData?.actual_per_kategori || {};
  const userBudget = dashboardData?.user_budget || {};
  
  // Only process if we have data
  if (!dashboardData) {
    return null; // Let loading state handle it
  }
  
  // Calculate recommendation data
  const totalActual = Object.values(actualPerKategori).reduce((sum, v) => sum + v, 0);
  const budgetBulanan = userBudget.budgetBulanan || 2000000;
  const sisaBudget = budgetBulanan - totalActual;
  const projectedPct = budgetBulanan > 0 ? ((totalActual / budgetBulanan) * 100).toFixed(1) : 0;
  
  // Determine recommendation label
  let rekomendasi = {
    label: "HEMAT",
    pesan: "Pengeluaran sangat terkontrol! Pertahankan kebiasaan ini dan alokasikan sisa ke tabungan.",
    saldo_rp: sisaBudget,
    proj_pct: projectedPct,
  };
  
  if (projectedPct > 90) {
    rekomendasi = {
      label: "DARURAT",
      pesan: "Pengeluaran sudah melebihi 90% budget! Segera kurangi pengeluaran tidak penting.",
      saldo_rp: sisaBudget,
      proj_pct: projectedPct,
    };
  } else if (projectedPct > 70) {
    rekomendasi = {
      label: "WASPADA",
      pesan: "Pengeluaran sudah 70% dari budget. Pertimbangkan untuk lebih hemat.",
      saldo_rp: sisaBudget,
      proj_pct: projectedPct,
    };
  }

  // Transform prediksi_7hari object into an array suitable for Recharts
  const chartData = Object.entries(prediksi7hari).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace("_", " "),
    amount: value,
  }));

  // Compute summary stats from prediksi_7hari
  const prediksiEntries = Object.entries(prediksi7hari);
  const totalPrediksi7Hari = prediksiEntries.reduce((sum, [, v]) => sum + v, 0);

  const nonZeroEntries = prediksiEntries.filter(([, v]) => v > 0);
  const sortedEntries = [...nonZeroEntries].sort(([, a], [, b]) => b - a);
  const kategoriTertinggi = sortedEntries[0] ?? null;
  const kategoriTerendah = sortedEntries[sortedEntries.length - 1] ?? null;

  // Donut chart data — filter out zero-value categories
  const donutData = nonZeroEntries.map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace("_", " "),
    value,
  }));

  const bannerGradient = getBannerGradient(rekomendasi.label);
  
  // Transform status per kategori for display
  const CATEGORIES = ['makanan', 'minuman', 'transportasi', 'belanja', 'tagihan', 'hiburan', 'kesehatan', 'lain_lain'];
  const displayStatusPerKategori = CATEGORIES.reduce((acc, key) => {
    const actual = actualPerKategori[key] || 0;
    const pred = prediksi7hari[key] || 0;
    const pct = pred > 0 ? ((actual / pred) * 100).toFixed(1) : 0;
    
    let label = "HEMAT";
    if (pct > 90) label = "DARURAT";
    else if (pct > 70) label = "WASPADA";
    
    // Get status from API or use calculated
    const apiStatus = statusPerKategori[key];
    const finalLabel = typeof apiStatus === 'string' ? apiStatus : label;
    
    acc[key] = {
      label: finalLabel,
      aktual_rp: actual,
      pred_rp: pred,
      pct_used: parseFloat(pct),
    };
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">
            Analytics & Insights
          </h1>
          <p className="text-sm text-zinc-500">
            Powered by AI recommendations to help you track and improve your
            spending habits.
          </p>
        </div>

        {error ? (
          /* ── Error state ── */
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
        ) : isLoading ? (
          /* ── Skeleton state ── */
          <>
            {/* Banner skeleton */}
            <Skeleton variant="card" className="mb-8 h-32" />

            {/* Summary stat card skeletons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Skeleton variant="card" />
              <Skeleton variant="card" />
              <Skeleton variant="card" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart area skeletons */}
              <div className="lg:col-span-2 space-y-8">
                <Skeleton variant="chart" className="h-[380px]" />
                <Skeleton variant="chart" className="h-[320px]" />
              </div>

              {/* Category card skeletons */}
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} variant="card" />
                ))}
              </div>
            </div>
          </>
        ) : (
          /* ── Real content with fade-in ── */
          <div
            style={{
              animation: "fadeIn 200ms ease-out both",
            }}
          >
            {/* AI Recommendation Banner */}
            <div
              className={`bg-gradient-to-r ${bannerGradient} p-6 rounded-2xl shadow-md mb-8 flex items-start gap-4`}
            >
              <div className="mt-0.5 shrink-0">
                <Sparkles className="text-white h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white">
                    AI Status: {rekomendasi.label}
                  </h3>
                </div>
                <p className="text-sm text-white/90 mb-4">
                  {rekomendasi.pesan}
                </p>
                <div className="flex gap-6">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider font-semibold text-white/60">
                      Sisa Budget
                    </span>
                    <span className="font-semibold text-white">
                      {formatIDR(rekomendasi.saldo_rp)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider font-semibold text-white/60">
                      Terpakai
                    </span>
                    <span className="font-semibold text-white">
                      {rekomendasi.proj_pct}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {/* Total Prediksi 7 Hari */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide mb-0.5">
                    Total Prediksi 7 Hari
                  </p>
                  <p className="text-lg font-bold text-zinc-900 truncate">
                    {formatIDR(totalPrediksi7Hari)}
                  </p>
                </div>
              </div>

              {/* Kategori Tertinggi */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                  <ArrowUp className="h-5 w-5 text-rose-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide mb-0.5">
                    Kategori Tertinggi
                  </p>
                  {kategoriTertinggi ? (
                    <>
                      <p className="text-base font-bold text-zinc-900 capitalize">
                        {kategoriTertinggi[0].replace("_", " ")}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatIDR(kategoriTertinggi[1])}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-zinc-400">—</p>
                  )}
                </div>
              </div>

              {/* Kategori Terendah */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <ArrowDown className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide mb-0.5">
                    Kategori Terendah
                  </p>
                  {kategoriTerendah ? (
                    <>
                      <p className="text-base font-bold text-zinc-900 capitalize">
                        {kategoriTerendah[0].replace("_", " ")}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatIDR(kategoriTerendah[1])}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-zinc-400">—</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                  <h2 className="text-lg font-bold text-zinc-900 mb-6">
                    7-Day Spending Prediction
                  </h2>
                  {chartData.length > 0 ? (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e4e4e7"
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#71717a", fontSize: 12 }}
                            dy={10}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#71717a", fontSize: 12 }}
                            tickFormatter={(value) =>
                              new Intl.NumberFormat("id-ID", {
                                notation: "compact",
                                compactDisplay: "short",
                              }).format(value)
                            }
                          />
                          <Tooltip
                            cursor={{ fill: "#f4f4f5" }}
                            content={
                              <BarTooltip totalAmount={totalPrediksi7Hari} />
                            }
                          />
                          <Bar
                            dataKey="amount"
                            fill="#6366f1"
                            radius={[6, 6, 0, 0]}
                            barSize={40}
                            isAnimationActive={true}
                            animationDuration={800}
                            animationEasing="ease-out"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400 text-center py-8">
                      Belum ada data prediksi. Tambahkan transaksi untuk mendapatkan prediksi AI.
                    </p>
                  )}
                </div>

                {/* Donut Chart — Spending Proportions per Category */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                  <h2 className="text-lg font-bold text-zinc-900 mb-6">
                    Spending Proportions
                  </h2>
                  {donutData.length > 0 ? (
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="h-[240px] w-full sm:w-[240px] shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={donutData}
                              cx="50%"
                              cy="50%"
                              innerRadius={65}
                              outerRadius={100}
                              paddingAngle={3}
                              dataKey="value"
                              isAnimationActive={true}
                              animationDuration={800}
                              animationEasing="ease-out"
                            >
                              {donutData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    DONUT_COLORS[index % DONUT_COLORS.length]
                                  }
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
                      {/* Legend */}
                      <ul className="flex flex-col gap-2 w-full">
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
                              className="flex items-center justify-between gap-3 text-sm"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{
                                    backgroundColor:
                                      DONUT_COLORS[
                                        index % DONUT_COLORS.length
                                      ],
                                  }}
                                />
                                <span className="text-zinc-700 capitalize truncate">
                                  {entry.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-zinc-500 text-xs">
                                  {pct}%
                                </span>
                                <span className="font-medium text-zinc-900">
                                  {formatIDR(entry.value)}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400 text-center py-8">
                      Tidak ada data prediksi untuk ditampilkan.
                    </p>
                  )}
                </div>
              </div>

              {/* Category Status Cards */}
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-zinc-900 mb-2">
                  Category Status
                </h2>
                {Object.entries(displayStatusPerKategori).map(
                  ([categoryName, status]) => {
                    const Icon = getCategoryIcon(categoryName);
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
                        className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm hover:border-zinc-300 transition-colors cursor-default"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                              <Icon className="h-4 w-4 text-zinc-600" />
                            </div>
                            <h4 className="font-semibold text-zinc-900 capitalize text-sm">
                              {categoryName.replace("_", " ")}
                            </h4>
                          </div>
                          <FinancialStatusBadge status={status.label} />
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-zinc-100 rounded-full h-1.5 mb-2">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${progressColor}`}
                            style={{ width: `${clampedPct}%` }}
                            role="progressbar"
                            aria-valuenow={status.pct_used}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${categoryName} usage ${status.pct_used}%`}
                          />
                        </div>

                        <div className="flex justify-between text-xs text-zinc-500">
                          <span>
                            Actual:{" "}
                            <span className="font-medium text-zinc-700">
                              {formatIDR(status.aktual_rp)}
                            </span>
                          </span>
                          <span className="font-medium text-zinc-600">
                            {status.pct_used}% used
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
