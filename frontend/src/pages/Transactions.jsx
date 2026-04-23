import { useState, useEffect, useCallback, useMemo, createElement } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import AddTransactionModal from "../components/dashboard/AddTransactionModal";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { getCategoryIcon } from "../utils/categoryIcons.js";
import useReducedMotion from "../hooks/useReducedMotion";
import transactionService from "../services/transactionService";
import {
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Filter,
  Calendar,
  TrendingDown,
  TrendingUp,
  Wallet,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { useToast } from "../context/ToastContext";

/* ─── Constants ─────────────────────────────────────────────── */
const CATEGORIES = [
  { id: "semua",        label: "Semua" },
  { id: "makanan",      label: "Makanan" },
  { id: "minuman",      label: "Minuman" },
  { id: "transportasi", label: "Transportasi" },
  { id: "belanja",      label: "Belanja" },
  { id: "tagihan",      label: "Tagihan" },
  { id: "hiburan",      label: "Hiburan" },
  { id: "kesehatan",    label: "Kesehatan" },
  { id: "lain-lain",    label: "Lain-lain" },
];

const CATEGORY_COLORS = {
  makanan:      { bg: "bg-orange-50",  text: "text-orange-600",  ring: "ring-orange-200" },
  minuman:      { bg: "bg-blue-50",    text: "text-blue-600",    ring: "ring-blue-200" },
  transportasi: { bg: "bg-purple-50",  text: "text-purple-600",  ring: "ring-purple-200" },
  belanja:      { bg: "bg-pink-50",    text: "text-pink-600",    ring: "ring-pink-200" },
  tagihan:      { bg: "bg-red-50",     text: "text-red-600",     ring: "ring-red-200" },
  hiburan:      { bg: "bg-yellow-50",  text: "text-yellow-600",  ring: "ring-yellow-200" },
  kesehatan:    { bg: "bg-green-50",   text: "text-green-600",   ring: "ring-green-200" },
  "lain-lain":  { bg: "bg-zinc-50",    text: "text-zinc-500",    ring: "ring-zinc-200" },
};

/* ─── Helpers ────────────────────────────────────────────────── */
const formatIDR = (amount) =>
  `Rp ${new Intl.NumberFormat("id-ID").format(Math.abs(amount))}`;

function getRelativeDateLabel(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "Hari Ini";
  if (diff === 1) return "Kemarin";
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function groupTransactionsByDate(transactions) {
  const groups = {};
  transactions.forEach((t) => {
    const dateKey = new Date(t.date).toISOString().split("T")[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(t);
  });
  // Sort keys in descending order (newest first)
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      label: getRelativeDateLabel(date),
      transactions: items,
    }));
}

/* ─── Empty State SVG ────────────────────────────────────────── */
function EmptyIllustration() {
  return (
    <svg
      width="140"
      height="140"
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Receipt card */}
      <rect x="30" y="18" width="80" height="104" rx="12" fill="#f0fdfa" />
      <rect x="30" y="18" width="80" height="104" rx="12" stroke="#ccfbf1" strokeWidth="1.5" />
      {/* Zigzag bottom */}
      <path
        d="M30 110 L37 118 L44 110 L51 118 L58 110 L65 118 L72 110 L79 118 L86 110 L93 118 L100 110 L107 118 L110 114"
        stroke="#ccfbf1"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Content lines */}
      <rect x="44" y="40" width="52" height="6" rx="3" fill="#99f6e4" />
      <rect x="44" y="56" width="36" height="5" rx="2.5" fill="#ccfbf1" />
      <rect x="44" y="70" width="44" height="5" rx="2.5" fill="#ccfbf1" />
      <rect x="44" y="84" width="28" height="5" rx="2.5" fill="#ccfbf1" />
      {/* Coin circle */}
      <circle cx="104" cy="86" r="18" fill="#f0fdfa" stroke="#14b8a6" strokeWidth="1.5" />
      <text x="104" y="91" textAnchor="middle" fontSize="12" fill="#14b8a6" fontWeight="700">Rp</text>
    </svg>
  );
}

/* ─── Summary Mini Card ──────────────────────────────────────── */
function SummaryCard({ icon, iconBg, iconColor, label, value, valueColor }) {
  return (
    <div className="bg-white rounded-xl border border-teal-100/60 shadow-[var(--shadow-sm)] px-4 py-3 hover:shadow-[var(--shadow-md)] transition-all duration-200">
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {createElement(icon, { size: 14, className: iconColor })}
        </div>
        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{label}</p>
      </div>
      <p
        className={`text-lg font-bold truncate ${valueColor || "text-zinc-900"}`}
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {value}
      </p>
    </div>
  );
}

/* ─── Transaction Item ───────────────────────────────────────── */
function TransactionItem({ transaction, onDelete, isDeleting }) {
  const { description, amount, category, date } = transaction;
  const isExpense = amount < 0;
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS["lain-lain"];
  const timeStr = new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const catLabel = CATEGORIES.find((c) => c.id === category)?.label || category;

  return (
    <div className="group flex items-center gap-3 px-4 py-3 hover:bg-teal-50/40 transition-all duration-150 cursor-default">
      {/* Category Icon */}
      <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ${colors.ring}`}>
        {createElement(getCategoryIcon(category), { size: 17, className: colors.text })}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 truncate">
          {description || "Transaksi"}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${colors.bg} ${colors.text} capitalize`}>
            {catLabel}
          </span>
          <span className="text-[11px] text-zinc-400">{timeStr}</span>
        </div>
      </div>

      {/* Amount + Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <p className={`text-sm font-bold ${isExpense ? "text-rose-600" : "text-emerald-600"}`}>
            <span className="inline-flex items-center gap-0.5">
              {isExpense ? (
                <ArrowDownLeft size={12} className="text-rose-400" />
              ) : (
                <ArrowUpRight size={12} className="text-emerald-400" />
              )}
              {formatIDR(amount)}
            </span>
          </p>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(transaction.id);
            }}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-zinc-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-300"
            aria-label={`Hapus transaksi ${description}`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Skeleton Loading ───────────────────────────────────────── */
function TransactionSkeletons() {
  return (
    <div className="space-y-4">
      {/* Summary skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} variant="card" className="h-20" />
        ))}
      </div>
      {/* List skeleton */}
      <div className="bg-white rounded-xl border border-teal-100/60 shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="px-2 py-2 space-y-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="row" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function Transactions() {
  const [searchTerm, setSearchTerm]         = useState("");
  const [activeCategory, setActiveCategory] = useState("semua");
  const [showModal, setShowModal]           = useState(false);
  const [transactions, setTransactions]     = useState([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [deletingId, setDeletingId]         = useState(null);
  const [sortNewest, setSortNewest]         = useState(true);
  const [showFilters, setShowFilters]       = useState(false);
  const reducedMotion                       = useReducedMotion();
  const { showToast }                       = useToast();

  const openModal  = useCallback(() => setShowModal(true),  []);
  const closeModal = useCallback(() => setShowModal(false), []);

  // Initial data load
  useEffect(() => {
    let cancelled = false;
    transactionService.getTransactions().then(
      (data) => { if (!cancelled) { setTransactions(data); setIsLoading(false); } },
      (err) => { if (!cancelled) { console.error("Error:", err); setIsLoading(false); } }
    );
    return () => { cancelled = true; };
  }, []);

  // Refetch helper for imperative use (after add/delete)
  const refetch = async () => {
    try {
      setIsLoading(true);
      const data = await transactionService.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      showToast?.("Gagal memuat transaksi", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setShowModal(false);
    refetch();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus transaksi ini?")) return;
    try {
      setDeletingId(id);
      await transactionService.deleteTransaction(id);
      showToast?.("Transaksi berhasil dihapus", "success");
      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      showToast?.("Gagal menghapus transaksi", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter & sort
  const filtered = useMemo(() => {
    let result = transactions.filter((t) => {
      const matchSearch =
        !searchTerm ||
        (t.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory =
        activeCategory === "semua" || t.category === activeCategory;
      return matchSearch && matchCategory;
    });

    // Sort by date
    result.sort((a, b) => {
      const da = new Date(a.date);
      const db = new Date(b.date);
      return sortNewest ? db - da : da - db;
    });

    return result;
  }, [transactions, searchTerm, activeCategory, sortNewest]);

  // Computed stats
  const stats = useMemo(() => {
    const totalExpense = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      count: transactions.length,
      expense: totalExpense,
      income: totalIncome,
    };
  }, [transactions]);

  // Grouped by date
  const dateGroups = useMemo(() => groupTransactionsByDate(filtered), [filtered]);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full overflow-x-hidden">

        {/* ══ Header ══════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fadeIn">
          <div>
            <h1
              className="text-2xl font-bold text-teal-900"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Transaksi
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Kelola dan pantau semua arus keuanganmu
            </p>
          </div>
          <Button
            variant="gradient"
            icon={Plus}
            className="sm:w-auto"
            onClick={openModal}
            aria-label="Tambah transaksi baru"
          >
            Tambah Transaksi
          </Button>
        </div>

        {/* ══ Summary Cards ══════════════════════════════════════════════════ */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} variant="card" className="h-20" />
            ))}
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
            style={reducedMotion ? {} : { animation: "fadeIn 200ms ease both" }}
          >
            <SummaryCard
              icon={Receipt}
              iconBg="bg-teal-50"
              iconColor="text-teal-600"
              label="Total Transaksi"
              value={stats.count}
            />
            <SummaryCard
              icon={TrendingDown}
              iconBg="bg-rose-50"
              iconColor="text-rose-500"
              label="Total Pengeluaran"
              value={formatIDR(stats.expense)}
              valueColor="text-rose-600"
            />
            <SummaryCard
              icon={TrendingUp}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-500"
              label="Total Pemasukan"
              value={formatIDR(stats.income)}
              valueColor="text-emerald-600"
            />
          </div>
        )}

        {/* ══ Search & Filter Bar ════════════════════════════════════════════ */}
        <div className="bg-white rounded-xl border border-teal-100/60 shadow-[var(--shadow-sm)] mb-4 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5">
            {/* Search input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-zinc-400" />
              </div>
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 pr-9 py-2 border border-teal-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-300 transition-shadow bg-teal-50/30 placeholder:text-zinc-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort toggle */}
            <button
              onClick={() => setSortNewest((p) => !p)}
              className="flex items-center gap-1.5 px-3 py-2 border border-teal-100 rounded-lg text-xs font-medium text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer flex-shrink-0"
              title={sortNewest ? "Terbaru duluan" : "Terlama duluan"}
            >
              <Calendar size={13} />
              {sortNewest ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            </button>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-medium transition-colors cursor-pointer flex-shrink-0 ${
                showFilters || activeCategory !== "semua"
                  ? "bg-teal-600 text-white border-teal-600"
                  : "border-teal-100 text-teal-700 hover:bg-teal-50"
              }`}
            >
              <Filter size={13} />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>

          {/* Category filter chips — collapsible */}
          {showFilters && (
            <div className="px-4 pb-3 pt-1 border-t border-teal-50">
              <div
                className="flex flex-wrap gap-1.5"
                role="group"
                aria-label="Filter kategori"
              >
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  const Icon = cat.id !== "semua" ? getCategoryIcon(cat.id) : null;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      aria-pressed={isActive}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400/40 ${
                        reducedMotion ? "" : "duration-150"
                      } ${
                        isActive
                          ? "bg-teal-600 text-white border-transparent shadow-sm"
                          : "bg-white text-teal-700 border-teal-200 hover:bg-teal-50"
                      }`}
                    >
                      {Icon && <Icon size={11} strokeWidth={2.5} />}
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ══ Active filter indicator ════════════════════════════════════════ */}
        {(activeCategory !== "semua" || searchTerm) && (
          <div className="flex items-center gap-2 mb-4 animate-fadeIn">
            <span className="text-xs text-zinc-400">Filter aktif:</span>
            {activeCategory !== "semua" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-[11px] font-semibold">
                {CATEGORIES.find((c) => c.id === activeCategory)?.label}
                <button
                  onClick={() => setActiveCategory("semua")}
                  className="ml-0.5 hover:text-teal-900 cursor-pointer"
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-[11px] font-semibold">
                "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-0.5 hover:text-teal-900 cursor-pointer"
                >
                  <X size={10} />
                </button>
              </span>
            )}
            <span className="text-xs text-zinc-400 ml-auto">
              {filtered.length} transaksi
            </span>
          </div>
        )}

        {/* ══ Content ════════════════════════════════════════════════════════ */}
        {isLoading ? (
          <TransactionSkeletons />
        ) : filtered.length > 0 ? (
          <div
            className="space-y-4"
            style={reducedMotion ? {} : { animation: "fadeIn 200ms ease both" }}
          >
            {dateGroups.map((group) => (
              <div key={group.date}>
                {/* Date header */}
                <div className="flex items-center gap-2 mb-2 px-1">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    {group.label}
                  </h3>
                  <div className="flex-1 h-px bg-zinc-100" />
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {group.transactions.length} transaksi
                  </span>
                </div>

                {/* Transaction cards */}
                <div className="bg-white rounded-xl border border-teal-100/60 shadow-[var(--shadow-sm)] overflow-hidden">
                  <div className="divide-y divide-zinc-50/80">
                    {group.transactions.map((t) => (
                      <TransactionItem
                        key={t.id}
                        transaction={t}
                        onDelete={handleDelete}
                        isDeleting={deletingId === t.id}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Total bar */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl px-5 py-3.5 flex items-center justify-between shadow-[var(--shadow-primary)]">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-teal-200" />
                <span className="text-sm font-medium text-teal-100">
                  Total {filtered.length} transaksi
                </span>
              </div>
              <span
                className="text-lg font-bold text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {formatIDR(
                  filtered.reduce((sum, t) => sum + t.amount, 0)
                )}
              </span>
            </div>
          </div>
        ) : (
          /* ══ Empty State ══════════════════════════════════════════════════ */
          <div
            className="bg-white rounded-xl border border-teal-100/60 shadow-[var(--shadow-sm)] p-14 text-center flex flex-col items-center"
            style={reducedMotion ? {} : { animation: "fadeIn 200ms ease both" }}
          >
            <EmptyIllustration />
            <h3
              className="text-lg font-bold text-zinc-900 mt-6 mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {searchTerm || activeCategory !== "semua"
                ? "Tidak ada transaksi ditemukan"
                : "Belum ada transaksi"}
            </h3>
            <p className="text-zinc-500 max-w-xs mb-8 text-sm leading-relaxed">
              {searchTerm || activeCategory !== "semua"
                ? "Coba ubah filter atau kata kunci pencarian untuk menemukan transaksi yang kamu cari."
                : "Mulai catat pengeluaran dan pemasukanmu agar keuanganmu lebih terkontrol."}
            </p>
            {!searchTerm && activeCategory === "semua" && (
              <Button
                variant="gradient"
                icon={Plus}
                className="max-w-xs"
                onClick={openModal}
              >
                Tambah Transaksi Pertama
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ══ Add Transaction Modal ════════════════════════════════════════════ */}
      <AddTransactionModal
        isOpen={showModal}
        onClose={closeModal}
        onSuccess={handleAddSuccess}
      />
    </DashboardLayout>
  );
}
