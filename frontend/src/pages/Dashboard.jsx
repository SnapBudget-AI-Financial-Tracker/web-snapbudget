import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import transactionService from "../services/transactionService";
import userService from "../services/userService";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import ScanStrukUpload from "../components/dashboard/ScanStrukUpload";

import AddTransactionModal from "../components/dashboard/AddTransactionModal";
import OnboardingModal from "../components/onboarding/OnboardingModal";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { getCategoryIcon } from "../utils/categoryIcons.js";
import { FinancialStatusBadge } from "../utils/categoryIcons.jsx";
import {
  PieChart,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Scan,
  Settings as SettingsIcon,
  Wallet,
  Camera,
  Calendar,
  ChevronRight,
  X,
  BarChart3,
} from "lucide-react";

// ─── Design constants ────────────────────────────────────────────────────────

const CATEGORY_CONFIG = {
  makanan: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    bar: "bg-orange-400",
    label: "Makanan",
  },
  minuman: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    bar: "bg-blue-400",
    label: "Minuman",
  },
  transportasi: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    bar: "bg-purple-400",
    label: "Transportasi",
  },
  belanja: {
    bg: "bg-pink-100",
    text: "text-pink-600",
    bar: "bg-pink-400",
    label: "Belanja",
  },
  tagihan: {
    bg: "bg-red-100",
    text: "text-red-600",
    bar: "bg-red-400",
    label: "Tagihan",
  },
  hiburan: {
    bg: "bg-yellow-100",
    text: "text-yellow-600",
    bar: "bg-yellow-400",
    label: "Hiburan",
  },
  kesehatan: {
    bg: "bg-green-100",
    text: "text-green-600",
    bar: "bg-green-400",
    label: "Kesehatan",
  },
  "lain-lain": {
    bg: "bg-zinc-100",
    text: "text-zinc-500",
    bar: "bg-zinc-400",
    label: "Lain-lain",
  },
};

const STATUS_BANNER = {
  hemat: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    badge: "bg-emerald-100 text-emerald-700",
  },
  aman: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    badge: "bg-blue-100 text-blue-700",
  },
  waspada: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    badge: "bg-amber-100 text-amber-700",
  },
  boros: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-800",
    badge: "bg-orange-100 text-orange-700",
  },
  darurat: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-800",
    badge: "bg-rose-100 text-rose-700",
  },
};

const HERO_BADGE_COLORS = {
  hemat: "bg-emerald-400/20 text-emerald-200",
  aman: "bg-blue-400/20 text-blue-200",
  waspada: "bg-amber-400/20 text-amber-200",
  boros: "bg-orange-400/20 text-orange-200",
  darurat: "bg-rose-400/20 text-rose-200",
};

// SVG ring dimensions
const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ≈ 326.73

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 4 && h < 11) return "Selamat pagi";
  if (h >= 11 && h < 15) return "Selamat siang";
  if (h >= 15 && h < 18) return "Selamat sore";
  return "Selamat malam";
}

function getIndonesianDate() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScanUpload, setShowScanUpload] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true);
  const [summary, setSummary] = useState({
    totalBalance: 0,
    monthlySpending: 0,
  });

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const budgetSettings = await userService.getBudgetSettings();
      setIsOnboardingComplete(budgetSettings.isOnboardingComplete);
      if (!budgetSettings.isOnboardingComplete) {
        setShowOnboarding(true);
      }

      const data = await transactionService.getDashboardData();
      setDashboardData(data);
      setTransactions(data.transaksi_bulan_ini || []);

      const total = (data.transaksi_bulan_ini || []).reduce(
        (acc, curr) => acc + curr.amount,
        0,
      );
      const spending = Object.values(data.actual_per_kategori || {}).reduce(
        (acc, curr) => acc + curr,
        0,
      );
      setSummary({ totalBalance: total, monthlySpending: spending });
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError("Data gagal dimuat. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const budgetSettings = await userService.getBudgetSettings();
        setIsOnboardingComplete(budgetSettings.isOnboardingComplete);
        if (!budgetSettings.isOnboardingComplete) {
          setShowOnboarding(true);
        }

        const data = await transactionService.getDashboardData();
        setDashboardData(data);
        setTransactions(data.transaksi_bulan_ini || []);

        const total = (data.transaksi_bulan_ini || []).reduce(
          (acc, curr) => acc + curr.amount,
          0,
        );
        const spending = Object.values(data.actual_per_kategori || {}).reduce(
          (acc, curr) => acc + curr,
          0,
        );
        setSummary({ totalBalance: total, monthlySpending: spending });
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError("Data gagal dimuat. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // ── Event handlers ─────────────────────────────────────────────────────────
  const handleScanSuccess = () => {
    setShowScanUpload(false);
    fetchDashboardData();
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchDashboardData();
  };

  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true);
    setShowOnboarding(false);
    fetchDashboardData();
  };

  // ── Format helpers ─────────────────────────────────────────────────────────
  const formatCurrency = (amount) => {
    const absAmount = Math.abs(Math.round(amount));
    const formatted = absAmount
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Rp ${formatted}`;
  };

  // ── Computed values ────────────────────────────────────────────────────────
  const budgetBulanan = dashboardData?.user_budget?.budgetBulanan || 0;
  const totalSpending = summary.monthlySpending;
  const sisaBudget = budgetBulanan - totalSpending;
  const percentageUsed =
    budgetBulanan > 0 ? (totalSpending / budgetBulanan) * 100 : 0;
  const daysRemaining = dashboardData?.rekomendasi?.days_remaining || 0;

  // SVG ring progress
  const ringOffset =
    RING_CIRCUMFERENCE * (1 - Math.min(percentageUsed, 100) / 100);
  const ringColor =
    percentageUsed >= 90
      ? "#fca5a5"
      : percentageUsed >= 70
        ? "#fcd34d"
        : "#6ee7b7";

  // Status label from rekomendasi
  const rekLabel = dashboardData?.rekomendasi?.label?.toLowerCase();
  const bannerConf = STATUS_BANNER[rekLabel] || null;
  const heroBadgeClass =
    HERO_BADGE_COLORS[rekLabel] || "bg-white/15 text-white";

  // Sisa budget color class
  const sisaColorClass =
    sisaBudget < 0
      ? "text-rose-300"
      : sisaBudget < budgetBulanan * 0.2
        ? "text-amber-300"
        : "text-emerald-300";

  // Spending breakdown — top 6 categories with actual spend
  const actualPerKategori = dashboardData?.actual_per_kategori || {};
  const spendingCategories = Object.entries(actualPerKategori)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Recent transactions — latest 8
  const recentTransactions = transactions.slice(0, 8);

  // User first name
  const firstName = user?.name?.split(" ")[0] || "Pengguna";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      {/* ── Modals ── */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />

      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Scan Struk modal overlay */}
      {showScanUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-2xl)] w-full max-w-lg animate-slideUp overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Camera size={17} className="text-teal-600" />
                <h3
                  className="font-semibold text-zinc-900 text-base"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Scan Struk
                </h3>
              </div>
              <button
                onClick={() => setShowScanUpload(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X size={17} />
              </button>
            </div>
            <ScanStrukUpload onSuccess={handleScanSuccess} />
          </div>
        </div>
      )}

      {/* ══ Main content ══════════════════════════════════════════════════════ */}
      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* ── 1. Welcome section ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-6 animate-fadeIn">
          <div>
            <h1
              className="text-2xl font-bold text-teal-900 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {getGreeting()}, {firstName}! 👋
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <Calendar size={13} className="text-zinc-400 flex-shrink-0" />
              <p className="text-sm text-zinc-500 capitalize">
                {getIndonesianDate()}
              </p>
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowScanUpload(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold rounded-xl shadow-[var(--shadow-primary)] hover:shadow-[var(--shadow-md)] transition-all duration-150 cursor-pointer"
            >
              <Scan size={16} />
              <span className="hidden sm:inline">Scan Struk</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-teal-50 active:bg-teal-100 text-teal-700 border border-teal-200 text-sm font-semibold rounded-xl shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-150 cursor-pointer"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Tambah</span>
            </button>
          </div>
        </div>

        {/* ── 2. Setup reminder banner ────────────────────────────────────── */}
        {!isOnboardingComplete && !showOnboarding && (
          <div className="mb-5 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-[var(--radius-xl)] p-4 animate-fadeIn">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-teal-900 mb-1">
                  Personalisasi Budget Anda
                </h3>
                <p className="text-sm text-teal-700 mb-3">
                  Dapatkan prediksi AI yang lebih akurat dengan mengatur budget
                  bulanan dan alokasi per kategori.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => setShowOnboarding(true)}
                    variant="gradient"
                    className="w-auto px-4 py-2 text-sm"
                  >
                    Setup Sekarang
                  </Button>
                  <Button
                    onClick={() => (window.location.href = "/settings")}
                    variant="outline"
                    className="w-auto px-4 py-2 text-sm"
                    icon={SettingsIcon}
                  >
                    Buka Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. AI status banner ─────────────────────────────────────────── */}
        {!isLoading && dashboardData?.rekomendasi && bannerConf && (
          <div
            className={`mb-5 ${bannerConf.bg} border ${bannerConf.border} rounded-[var(--radius-xl)] px-4 py-3 flex items-center justify-between gap-3 animate-slideUp`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${bannerConf.badge}`}
              >
                {dashboardData.rekomendasi.label_upper}
              </span>
              <p className={`text-sm ${bannerConf.text} truncate`}>
                {dashboardData.rekomendasi.pesan}
              </p>
            </div>
            <FinancialStatusBadge
              status={dashboardData.rekomendasi.label_upper}
            />
          </div>
        )}

        {/* ── 4. Budget hero card + stat cards ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          {/* Hero card — spans 2 columns on large screens */}
          {isLoading ? (
            <div className="lg:col-span-2 min-h-[200px]">
              <Skeleton variant="card" className="h-full min-h-[200px]" />
            </div>
          ) : (
            <div className="lg:col-span-2 bg-gradient-to-br from-teal-600 to-teal-800 rounded-[var(--radius-xl)] p-6 text-white shadow-[var(--shadow-primary)] relative overflow-hidden animate-slideUp">
              {/* Decorative background blobs */}
              <div
                className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-14 -left-6 w-56 h-56 bg-white/5 rounded-full pointer-events-none"
                aria-hidden="true"
              />

              {/* Top row — title + status badge */}
              <div className="relative flex items-start justify-between mb-4 gap-3">
                <div>
                  <p className="text-teal-200 text-xs font-semibold uppercase tracking-wider mb-1">
                    Budget Bulan Ini
                  </p>
                  <h2
                    className="text-3xl font-bold leading-tight"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {formatCurrency(budgetBulanan)}
                  </h2>
                </div>

                {dashboardData?.rekomendasi && (
                  <span
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${heroBadgeClass}`}
                  >
                    {dashboardData.rekomendasi.label_upper}
                  </span>
                )}
              </div>

              {/* Bottom row — metrics + ring */}
              <div className="relative flex items-end justify-between gap-6">
                {/* Left: metrics + progress bar */}
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div>
                      <p className="text-teal-200 text-xs mb-0.5">Terpakai</p>
                      <p
                        className="text-xl font-bold leading-tight"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {formatCurrency(totalSpending)}
                      </p>
                    </div>
                    <div>
                      <p className="text-teal-200 text-xs mb-0.5">
                        Sisa Budget
                      </p>
                      <p
                        className={`text-xl font-bold leading-tight ${sisaColorClass}`}
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {formatCurrency(Math.abs(sisaBudget))}
                      </p>
                    </div>
                  </div>

                  {/* Linear progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-teal-200 mb-1.5">
                      <span>{percentageUsed.toFixed(1)}% terpakai</span>
                      <span>{daysRemaining} hari tersisa</span>
                    </div>
                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min(percentageUsed, 100)}%`,
                          backgroundColor: ringColor,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right: SVG ring */}
                <div
                  className="relative flex-shrink-0"
                  style={{ width: 112, height: 112 }}
                  aria-label={`${percentageUsed.toFixed(0)}% budget terpakai`}
                >
                  <svg
                    width="112"
                    height="112"
                    viewBox="0 0 130 130"
                    className="-rotate-90"
                    aria-hidden="true"
                  >
                    {/* Track */}
                    <circle
                      cx="65"
                      cy="65"
                      r={RING_RADIUS}
                      fill="none"
                      strokeWidth="10"
                      stroke="rgba(255,255,255,0.2)"
                    />
                    {/* Progress arc */}
                    <circle
                      cx="65"
                      cy="65"
                      r={RING_RADIUS}
                      fill="none"
                      strokeWidth="10"
                      stroke={ringColor}
                      strokeLinecap="round"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      strokeDashoffset={ringOffset}
                      style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
                    />
                  </svg>

                  {/* Percentage overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-2xl font-bold leading-none text-white"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {Math.min(percentageUsed, 999).toFixed(0)}%
                    </span>
                    <span className="text-teal-200 text-xs mt-0.5">
                      terpakai
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right column: 2 stat cards stacked */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {isLoading ? (
              <>
                <Skeleton variant="card" />
                <Skeleton variant="card" />
              </>
            ) : (
              <div className="contents animate-fadeIn">
                <StatCard
                  title="Total Pengeluaran"
                  value={formatCurrency(totalSpending)}
                  subtitle={`${percentageUsed.toFixed(1)}% dari budget`}
                  icon={<TrendingDown className="h-5 w-5" />}
                  iconBg="bg-orange-50"
                  iconColor="text-orange-600"
                />
                <StatCard
                  title="Sisa Budget"
                  value={formatCurrency(Math.abs(sisaBudget))}
                  subtitle={`${daysRemaining} hari tersisa`}
                  icon={<Wallet className="h-5 w-5" />}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-600"
                />
              </div>
            )}
          </div>
        </div>

        {/* ── 5. Spending Breakdown (full-width) ──────────────────────────── */}
        {!isLoading && dashboardData && (
          <div className="mb-5 animate-fadeIn">
            <div className="bg-white rounded-[var(--radius-xl)] border border-teal-100/60 shadow-[var(--shadow-md)] p-6">
              {/* Card header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <BarChart3 size={14} className="text-teal-600" />
                  </div>
                  <h3
                    className="text-base font-semibold text-zinc-900"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Pengeluaran per Kategori
                  </h3>
                </div>
                <span className="text-xs text-zinc-400">Bulan ini</span>
              </div>

              {spendingCategories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5">
                  {spendingCategories.map(([kategori, amount]) => {
                    const conf =
                      CATEGORY_CONFIG[kategori] || CATEGORY_CONFIG["lain-lain"];
                    const Icon = getCategoryIcon(kategori);
                    const pct =
                      totalSpending > 0 ? (amount / totalSpending) * 100 : 0;

                    return (
                      <div key={kategori} className="flex items-center gap-3">
                        {/* Icon badge */}
                        <div
                          className={`w-8 h-8 rounded-lg ${conf.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}
                        >
                          <Icon size={14} className={conf.text} />
                        </div>

                        {/* Bar + labels */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-zinc-700">
                              {conf.label}
                            </span>
                            <span
                              className="text-sm font-bold text-zinc-900"
                              style={{ fontFamily: "var(--font-heading)" }}
                            >
                              {formatCurrency(amount)}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${conf.bar}`}
                              style={{
                                width: `${pct}%`,
                                transition: "width 0.8s ease-out",
                              }}
                            />
                          </div>
                        </div>

                        {/* Percentage */}
                        <span className="text-xs text-zinc-400 flex-shrink-0 w-9 text-right">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center mb-3">
                    <PieChart size={22} className="text-zinc-200" />
                  </div>
                  <p className="text-sm text-zinc-400">Belum ada pengeluaran</p>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    Tambahkan transaksi untuk melihat breakdown.
                  </p>
                </div>
              )}
            </div>

            {/* AI Insight teaser — CTA ke halaman Analytics */}
            <Link
              to="/analytics"
              className="mt-3 flex items-center justify-between gap-3 px-5 py-3.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 rounded-[var(--radius-xl)] shadow-[var(--shadow-primary)] transition-all duration-150 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">
                    Lihat Analisis &amp; AI Insight Lengkap
                  </p>
                  <p className="text-xs text-teal-200 leading-tight mt-0.5">
                    Prediksi 7 hari, health score, &amp; rekomendasi AI
                  </p>
                </div>
              </div>
              <ChevronRight
                size={18}
                className="text-teal-300 group-hover:translate-x-0.5 transition-transform duration-150 flex-shrink-0"
              />
            </Link>
          </div>
        )}

        {/* ── 6. Recent Transactions ──────────────────────────────────────── */}
        <div className="animate-slideUp">
          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-bold text-teal-900"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Transaksi Terbaru
            </h2>
            <Link
              to="/transactions"
              className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              Lihat Semua
              <ChevronRight size={15} />
            </Link>
          </div>

          {/* Loading skeleton */}
          {isLoading ? (
            <div className="bg-white rounded-[var(--radius-xl)] border border-teal-100/60 shadow-[var(--shadow-md)] overflow-hidden">
              <div className="divide-y divide-zinc-50 px-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="row" />
                ))}
              </div>
            </div>
          ) : error ? (
            /* Error state */
            <div className="bg-white rounded-[var(--radius-xl)] border border-rose-100 shadow-[var(--shadow-sm)] p-10 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-rose-50">
                <AlertCircle className="h-5 w-5 text-rose-500" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-1">
                Gagal memuat data
              </h3>
              <p className="text-sm text-zinc-400 mb-5">{error}</p>
              <Button
                variant="outline"
                className="w-auto px-4 py-2"
                onClick={fetchDashboardData}
              >
                Coba Lagi
              </Button>
            </div>
          ) : recentTransactions.length > 0 ? (
            /* Transaction list */
            <div className="bg-white rounded-[var(--radius-xl)] border border-teal-100/60 shadow-[var(--shadow-md)] overflow-hidden">
              <div className="divide-y divide-zinc-50/80">
                {recentTransactions.map((t) => {
                  const conf =
                    CATEGORY_CONFIG[t.category] || CATEGORY_CONFIG["lain-lain"];
                  const Icon = getCategoryIcon(t.category);
                  const dateStr = new Date(t.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  });

                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-teal-50/40 transition-colors"
                    >
                      {/* Category icon badge */}
                      <div
                        className={`w-10 h-10 rounded-xl ${conf.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}
                      >
                        <Icon size={17} className={conf.text} />
                      </div>

                      {/* Description + meta */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">
                          {t.description || "Transaksi"}
                        </p>
                        <p className="text-xs text-zinc-400 mt-0.5 capitalize">
                          {conf.label || t.category} · {dateStr}
                        </p>
                      </div>

                      {/* Amount */}
                      <span
                        className="text-sm font-bold text-zinc-900 flex-shrink-0"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        -{formatCurrency(Math.abs(t.amount))}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* "See more" footer */}
              {transactions.length > 8 && (
                <div className="border-t border-zinc-50 px-4 py-3">
                  <Link
                    to="/transactions"
                    className="flex items-center justify-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    Lihat {transactions.length - 8} transaksi lainnya
                    <ChevronRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* Empty state */
            <div className="bg-white rounded-[var(--radius-xl)] border border-teal-100/60 shadow-[var(--shadow-sm)] p-12 text-center animate-fadeIn">
              <div className="mx-auto mb-5 w-20 h-20 rounded-2xl bg-teal-50 flex items-center justify-center">
                <Wallet size={30} className="text-teal-300" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 mb-2">
                Belum ada transaksi
              </h3>
              <p className="text-sm text-zinc-400 max-w-xs mx-auto mb-6">
                Mulai catat pengeluaran hari ini. Scan struk atau tambahkan
                transaksi secara manual.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button
                  onClick={() => setShowScanUpload(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-[var(--shadow-primary)] transition-colors cursor-pointer"
                >
                  <Scan size={15} />
                  Scan Struk
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-teal-50 text-teal-700 border border-teal-200 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <Plus size={15} />
                  Tambah Manual
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom padding for comfort */}
        <div className="h-8" aria-hidden="true" />
      </div>
    </DashboardLayout>
  );
}
