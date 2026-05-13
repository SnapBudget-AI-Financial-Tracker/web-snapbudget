import { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

function formatIDR(amount) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(Math.abs(amount))}`;
}

export default function DeleteConfirmSheet({
  transaction,
  onConfirm,
  onCancel,
  isDeleting = false,
}) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  if (!transaction) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
        style={{ animation: "fadeIn 200ms ease both" }}
      />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl pt-6 pb-6 px-5"
        style={{ animation: "slideUp 250ms cubic-bezier(0.16,1,0.3,1) both" }}
      >
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={26} className="text-rose-500" />
        </div>

        {/* Title */}
        <h3
          className="text-lg font-bold text-zinc-900 text-center mb-1"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Hapus Transaksi?
        </h3>

        {/* Transaction preview */}
        <div className="mt-3 mb-5 bg-zinc-50 rounded-xl px-4 py-3 text-center">
          <p className="text-sm font-semibold text-zinc-800 truncate">
            {transaction.description || "Transaksi"}
          </p>
          <p className="text-sm text-rose-600 font-bold mt-0.5">
            {formatIDR(transaction.amount)}
          </p>
        </div>

        <p className="text-sm text-zinc-400 text-center mb-6 leading-relaxed">
          Transaksi ini akan dihapus permanen dan tidak bisa dikembalikan.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <X size={15} />
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-60"
          >
            {isDeleting ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
            {isDeleting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
