import { useState, useEffect, useRef } from "react";
import { X, Check, Loader2, Pencil } from "lucide-react";
import transactionService from "../../services/transactionService";
import { useToast } from "../../context/ToastContext";

const CATEGORIES = [
  { value: "makanan", label: "Makanan" },
  { value: "minuman", label: "Minuman" },
  { value: "transportasi", label: "Transportasi" },
  { value: "belanja", label: "Belanja" },
  { value: "tagihan", label: "Tagihan" },
  { value: "hiburan", label: "Hiburan" },
  { value: "kesehatan", label: "Kesehatan" },
  { value: "lain-lain", label: "Lain-lain" },
];

export default function EditTransactionModal({
  transaction,
  onClose,
  onSuccess,
}) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const descRef = useRef(null);

  const [form, setForm] = useState({
    description: transaction?.description || "",
    amount: transaction ? Math.abs(transaction.amount) : "",
    category: transaction?.category || "lain-lain",
    date: transaction?.date
      ? new Date(transaction.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (descRef.current) {
      descRef.current.focus();
      descRef.current.select();
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!transaction) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(form.amount);
    if (!parsedAmount || parsedAmount <= 0) {
      showToast("Masukkan jumlah yang valid", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await transactionService.updateTransaction(transaction.id, {
        description: form.description,
        amount: -Math.abs(parsedAmount),
        category: form.category,
        date: new Date(form.date).toISOString(),
      });
      showToast("Transaksi berhasil diperbarui", "success");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Update error:", err);
      showToast(
        err.response?.data?.message || "Gagal memperbarui transaksi",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Panel */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        style={{ animation: "slideUp 180ms cubic-bezier(0.16,1,0.3,1) both" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
              <Pencil size={13} className="text-teal-600" />
            </span>
            <h2
              className="text-base font-semibold text-zinc-900"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Edit Transaksi
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3.5">
          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
              Deskripsi
            </label>
            <input
              ref={descRef}
              type="text"
              value={form.description}
              onChange={set("description")}
              placeholder="Nama transaksi..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-all"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
              Jumlah (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-medium select-none">
                Rp
              </span>
              <input
                type="number"
                value={form.amount}
                onChange={set("amount")}
                min="0"
                step="500"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-all"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
              Kategori
            </label>
            <select
              value={form.category}
              onChange={set("category")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-all bg-white cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
              Tanggal
            </label>
            <input
              type="date"
              value={form.date}
              onChange={set("date")}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Check size={15} />
              )}
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>

        {/* Hint */}
        <p className="text-center text-[11px] text-zinc-300 pb-3 -mt-1">
          Tekan{" "}
          <kbd className="px-1 py-0.5 bg-zinc-100 rounded text-zinc-400 font-mono text-[10px]">
            Esc
          </kbd>{" "}
          untuk batal
        </p>
      </div>
    </div>
  );
}
