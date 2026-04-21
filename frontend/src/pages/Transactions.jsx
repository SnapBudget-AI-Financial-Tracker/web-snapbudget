import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { getCategoryIcon } from "../utils/categoryIcons.js";
import useReducedMotion from "../hooks/useReducedMotion";
import transactionService from "../services/transactionService";
import { Search, Plus, X, ChevronDown } from "lucide-react";

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

const TRANSACTION_TYPES = [
  { id: "expense", label: "Pengeluaran" },
  { id: "income",  label: "Pemasukan" },
];

/* ─── Helpers ────────────────────────────────────────────────── */
const formatIDR = (amount) =>
  new Intl.NumberFormat("id-ID").format(Math.abs(amount));

/* ─── Empty State SVG ────────────────────────────────────────── */
function EmptyIllustration() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="24" y="16" width="72" height="88" rx="8" fill="#f4f4f5" />
      <rect x="24" y="16" width="72" height="88" rx="8" stroke="#e4e4e7" strokeWidth="1.5" />
      <path
        d="M24 96 L30 104 L36 96 L42 104 L48 96 L54 104 L60 96 L66 104 L72 96 L78 104 L84 96 L90 104 L96 96"
        stroke="#e4e4e7"
        strokeWidth="1.5"
        fill="none"
      />
      <rect x="36" y="36" width="48" height="6" rx="3" fill="#d4d4d8" />
      <rect x="36" y="50" width="32" height="5" rx="2.5" fill="#e4e4e7" />
      <rect x="36" y="63" width="40" height="5" rx="2.5" fill="#e4e4e7" />
      <rect x="36" y="76" width="24" height="5" rx="2.5" fill="#e4e4e7" />
      <circle cx="88" cy="76" r="16" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="1.5" />
      <text x="88" y="81" textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="700">Rp</text>
    </svg>
  );
}

/* ─── Add Transaction Modal ──────────────────────────────────── */
function AddTransactionModal({ onClose }) {
  const reducedMotion = useReducedMotion();

  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "makanan",
    date: new Date().toISOString().split("T")[0],
    type: "expense",
  });

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onClose();
  };

  const backdropAnim = { animation: "fadeIn 200ms ease both" };
  const modalAnim = reducedMotion
    ? { animation: "fadeIn 200ms ease both" }
    : { animation: "slideUp 250ms ease both" };

  const inputClass =
    "w-full px-3 py-2.5 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow bg-white text-teal-900 placeholder:text-teal-400";
  const labelClass = "block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={backdropAnim}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Tambah Transaksi"
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
        style={modalAnim}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="text-base font-bold text-zinc-900" style={{ fontFamily: "var(--font-heading)" }}>
            Tambah Transaksi
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-400 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-300"
            aria-label="Tutup modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Type toggle */}
          <div>
            <label className={labelClass}>Tipe</label>
            <div className="flex rounded-lg border border-zinc-200 overflow-hidden">
              {TRANSACTION_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, type: t.id }))}
                  className={`flex-1 py-2 text-sm font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 ${
                    form.type === t.id
                      ? t.id === "expense" ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                      : "bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="modal-description" className={labelClass}>Deskripsi</label>
            <input
              id="modal-description"
              name="description"
              type="text"
              placeholder="Contoh: Makan siang di warteg"
              value={form.description}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="modal-amount" className={labelClass}>Jumlah (IDR)</label>
            <input
              id="modal-amount"
              name="amount"
              type="number"
              placeholder="0"
              min="0"
              value={form.amount}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="modal-category" className={labelClass}>Kategori</label>
            <div className="relative">
              <select
                id="modal-category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`${inputClass} appearance-none pr-9 cursor-pointer`}
              >
                {CATEGORIES.filter((c) => c.id !== "semua").map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="modal-date" className={labelClass}>Tanggal</label>
            <input
              id="modal-date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-300"
            >
              Batal
            </button>
            <div className="flex-1">
              <Button type="submit" variant="gradient">Simpan</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Skeleton rows ──────────────────────────────────────────── */
function TransactionSkeletons() {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 space-y-1 divide-y divide-zinc-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="py-2">
            <Skeleton variant="row" />
          </div>
        ))}
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
  const reducedMotion                       = useReducedMotion();

  const openModal  = useCallback(() => setShowModal(true),  []);
  const closeModal = useCallback(() => setShowModal(false), []);

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await transactionService.getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filtered = transactions.filter((t) => {
    const matchSearch =
      !searchTerm ||
      (t.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      activeCategory === "semua" || t.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              Transaksi
            </h1>
            <p className="text-sm text-zinc-500">
              Kelola dan lihat semua pengeluaran serta pemasukan kamu.
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

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-teal-100 shadow-[var(--shadow-sm)] mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
            />
          </div>
        </div>

        {/* Category filter chips */}
        <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Filter kategori">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const Icon = cat.id !== "semua" ? getCategoryIcon(cat.id) : null;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={isActive}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1 ${
                  reducedMotion ? "" : "duration-150"
                } ${
                  isActive
                    ? "bg-teal-600 text-white border-transparent shadow-sm scale-105"
                    : "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 scale-100"
                }`}
              >
                {Icon && <Icon size={12} strokeWidth={2.5} />}
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <TransactionSkeletons />
        ) : filtered.length > 0 ? (
          <div
            className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden"
            style={reducedMotion ? {} : { animation: "fadeIn 200ms ease both" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Deskripsi</th>
                    <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filtered.map((t) => {
                    const CategoryIcon = getCategoryIcon(t.category);
                    const isExpense = t.amount < 0;
                    return (
                      <tr key={t.id} className="hover:bg-zinc-50 transition-colors duration-150 cursor-default">
                        <td className="px-6 py-4 text-sm text-zinc-500 whitespace-nowrap">
                          {new Date(t.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                          {t.description || "Tanpa deskripsi"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium">
                            <CategoryIcon size={12} strokeWidth={2.5} />
                            {t.category}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${isExpense ? "text-rose-600" : "text-emerald-600"}`}>
                          {isExpense ? "−" : "+"}{formatIDR(t.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-sm text-zinc-500">Menampilkan {filtered.length} transaksi</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-zinc-200 rounded text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-300">Sebelumnya</button>
                <button className="px-3 py-1 border border-zinc-200 rounded text-sm text-zinc-600 hover:bg-zinc-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-300">Berikutnya</button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div
            className="bg-white rounded-xl border border-zinc-200 shadow-sm p-16 text-center flex flex-col items-center"
            style={reducedMotion ? {} : { animation: "fadeIn 200ms ease both" }}
          >
            <EmptyIllustration />
            <h3 className="text-lg font-bold text-zinc-900 mt-6 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Belum ada transaksi
            </h3>
            <p className="text-zinc-500 max-w-xs mb-8 text-sm leading-relaxed">
              Mulai catat pengeluaran dan pemasukanmu agar keuanganmu lebih terkontrol.
            </p>
            <Button variant="gradient" icon={Plus} className="max-w-xs" onClick={openModal}>
              Tambah Transaksi Pertama
            </Button>
          </div>
        )}
      </div>

      {showModal && <AddTransactionModal onClose={closeModal} />}
    </DashboardLayout>
  );
}
