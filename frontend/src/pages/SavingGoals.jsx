// frontend/src/pages/SavingGoals.jsx
import { useState, useEffect } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { savingGoalService } from "../services/transactionService";
import {
  Target,
  Plus,
  Trash2,
  PiggyBank,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  X,
  Loader2,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────
const formatIDR = (val) =>
  `Rp ${Math.abs(Math.round(val))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

const KATEGORI_OPTIONS = [
  { value: "elektronik", label: "Elektronik", icon: "laptop" },
  { value: "kendaraan", label: "Kendaraan", icon: "bike" },
  { value: "pendidikan", label: "Pendidikan", icon: "book-open" },
  { value: "liburan", label: "Liburan", icon: "plane" },
  { value: "darurat", label: "Dana Darurat", icon: "shield" },
  { value: "fashion", label: "Fashion", icon: "shirt" },
  { value: "kesehatan", label: "Kesehatan", icon: "heart" },
  { value: "umum", label: "Umum", icon: "target" },
];

// ── Status Badge ──────────────────────────────────────────────────
function StatusBadge({ goal }) {
  if (goal.isTercapai || goal.status === "tercapai") {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle2 size={10} /> TERCAPAI
      </span>
    );
  }
  if (goal.isOverdue) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
        <AlertCircle size={10} /> TERLAMBAT
      </span>
    );
  }
  if (goal.daysLeft <= 30) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
        <Clock size={10} /> {goal.daysLeft} HARI LAGI
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">
      <Target size={10} /> AKTIF
    </span>
  );
}

// ── Goal Card ─────────────────────────────────────────────────────
function GoalCard({ goal, onAdd, onDelete }) {
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const progressColor =
    goal.isTercapai || goal.status === "tercapai"
      ? "bg-emerald-500"
      : goal.isOverdue
      ? "bg-rose-500"
      : goal.daysLeft <= 30
      ? "bg-amber-500"
      : "bg-teal-500";

  const handleAdd = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    try {
      await onAdd(goal.id, parseFloat(amount));
      setAmount("");
      setShowAdd(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-teal-100/60 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center flex-shrink-0 text-xl w-11 h-11 rounded-xl bg-teal-50">
            {goal.icon}
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight text-zinc-900">
              {goal.nama}
            </h3>
            <p className="text-xs text-zinc-400 capitalize mt-0.5">
              {goal.kategori}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge goal={goal} />
          <button
            onClick={() => onDelete(goal.id)}
            className="flex items-center justify-center transition-colors rounded-lg w-7 h-7 text-zinc-400 hover:text-rose-500 hover:bg-rose-50"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-end justify-between mb-1.5">
          <div>
            <p className="text-xs text-zinc-400">Terkumpul</p>
            <p className="text-base font-bold text-zinc-900">
              {formatIDR(goal.currentAmount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-400">Target</p>
            <p className="text-sm font-semibold text-zinc-600">
              {formatIDR(goal.targetAmount)}
            </p>
          </div>
        </div>
        <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${progressColor} transition-all duration-700`}
            style={{ width: `${goal.progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-xs font-semibold text-zinc-500">
            {goal.progress}%
          </p>
          <p className="text-xs text-zinc-400">
            sisa {formatIDR(goal.sisaAmount)}
          </p>
        </div>
      </div>

      {/* Stats */}
      {!goal.isTercapai && goal.status !== "tercapai" && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="px-3 py-2 bg-zinc-50 rounded-xl">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wide">
              Per Hari
            </p>
            <p className="text-sm font-bold text-zinc-800">
              {formatIDR(goal.perHari)}
            </p>
          </div>
          <div className="px-3 py-2 bg-zinc-50 rounded-xl">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wide">
              Sisa Hari
            </p>
            <p className="text-sm font-bold text-zinc-800">
              {goal.daysLeft} hari
            </p>
          </div>
        </div>
      )}

      {/* Tercapai Banner */}
      {(goal.isTercapai || goal.status === "tercapai") && (
        <div className="px-3 py-2 mb-4 text-center border bg-emerald-50 border-emerald-100 rounded-xl">
          <p className="text-sm font-semibold text-emerald-700">
            🎉 Goal tercapai! Selamat!
          </p>
        </div>
      )}

      {/* Add Button */}
      {goal.status !== "tercapai" &&
        !goal.isTercapai &&
        (showAdd ? (
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Jumlah (Rp)"
              className="flex-1 px-3 py-2 text-sm border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-300"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              autoFocus
            />
            <button
              onClick={handleAdd}
              disabled={loading}
              className="px-3 py-2 text-sm text-white transition-colors bg-teal-500 rounded-xl hover:bg-teal-600 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Tambah"
              )}
            </button>
            <button
              onClick={() => {
                setShowAdd(false);
                setAmount("");
              }}
              className="flex items-center justify-center border w-9 h-9 rounded-xl border-zinc-200 text-zinc-400 hover:bg-zinc-50"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full py-2 text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus size={14} /> Tambah Tabungan
          </button>
        ))}
    </div>
  );
}

// ── Create Modal ──────────────────────────────────────────────────
function CreateGoalModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    nama: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
    kategori: "umum",
    icon: "target",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "kategori") {
      const kat = KATEGORI_OPTIONS.find((k) => k.value === value);
      setForm((prev) => ({
        ...prev,
        kategori: value,
        icon: kat?.icon || "target",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama || !form.targetAmount || !form.deadline) {
      setError("Nama, target, dan deadline wajib diisi");
      return;
    }
    setLoading(true);
    try {
      await onCreate(form);
      onClose();
    } catch {
      setError("Gagal membuat goal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 border border-teal-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white";
  const labelClass =
    "block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-teal-500">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/20">
              <Target size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Buat Goal Baru</h2>
              <p className="text-[11px] text-teal-100">
                Tentukan target tabunganmu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full w-7 h-7 bg-white/20 hover:bg-white/30"
          >
            <X size={14} className="text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-3 py-2 text-sm border bg-rose-50 border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className={labelClass}>Nama Goal</label>
            <input
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Contoh: Beli Laptop, Liburan Bali"
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Target (Rp)</label>
              <input
                name="targetAmount"
                type="number"
                value={form.targetAmount}
                onChange={handleChange}
                placeholder="5000000"
                className={inputClass}
                required
                min="1000"
              />
            </div>
            <div>
              <label className={labelClass}>Sudah punya (Rp)</label>
              <input
                name="currentAmount"
                type="number"
                value={form.currentAmount}
                onChange={handleChange}
                placeholder="0"
                className={inputClass}
                min="0"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Deadline</label>
            <input
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange}
              className={inputClass}
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <label className={labelClass}>Kategori</label>
            <div className="grid grid-cols-4 gap-2">
              {KATEGORI_OPTIONS.map((kat) => (
                <button
                  key={kat.value}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      kategori: kat.value,
                      icon: kat.icon,
                    }))
                  }
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs transition-all ${
                    form.kategori === kat.value
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-zinc-200 hover:border-teal-200 text-zinc-600"
                  }`}
                >
                  <span className="text-lg">{kat.icon}</span>
                  <span className="leading-tight text-center">{kat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              Buat Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function SavingGoals() {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await savingGoalService.getSavingGoals();
      setGoals(data);
    } catch {
      setError("Gagal memuat data goals.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadGoals = async () => {
      try {
        if (!mounted) return;
        setIsLoading(true);
        setError(null);
        const data = await savingGoalService.getSavingGoals();
        if (mounted) setGoals(data);
      } catch {
        if (mounted) setError("Gagal memuat data goals.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadGoals();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreate = async (form) => {
    await savingGoalService.createSavingGoal(form);
    await fetchGoals();
  };

  const handleAdd = async (id, amount) => {
    const result = await savingGoalService.addToSavingGoal(id, amount);
    await fetchGoals();
    if (result.tercapai) {
      alert(result.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus goal ini?")) return;
    await savingGoalService.deleteSavingGoal(id);
    await fetchGoals();
  };

  // Stats
  const totalTerkumpul = goals.reduce((s, g) => s + g.currentAmount, 0);
  const goalTercapai = goals.filter(
    (g) => g.status === "tercapai" || g.isTercapai
  ).length;
  const goalAktif = goals.filter(
    (g) => g.status === "aktif" && !g.isTercapai
  ).length;

  return (
    <DashboardLayout>
      <div className="w-full p-4 mx-auto md:p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fadeIn">
          <div>
            <h1
              className="text-teal-900 font-semibold text-[17px] leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Tabungan Goals
            </h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              Kelola target tabunganmu
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-[13px] font-medium rounded-lg shadow-sm transition-all"
          >
            <Plus size={14} />
            <span>Buat Goal</span>
          </button>
        </div>

        {/* Stats */}
        {goals.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
            {[
              {
                label: "Total Goal",
                value: goals.length,
                icon: Target,
                color: "text-teal-600",
                bg: "bg-teal-50",
              },
              {
                label: "Goal Aktif",
                value: goalAktif,
                icon: TrendingUp,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "Tercapai",
                value: goalTercapai,
                icon: CheckCircle2,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                label: "Total Terkumpul",
                value: formatIDR(totalTerkumpul),
                icon: PiggyBank,
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="px-4 py-3 bg-white border shadow-sm rounded-xl border-teal-100/60"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center`}
                  >
                    <stat.icon size={14} className={stat.color} />
                  </div>
                  <p className="text-xs font-medium text-zinc-400">
                    {stat.label}
                  </p>
                </div>
                <p className="text-lg font-bold text-zinc-900">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="text-teal-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center border bg-rose-50 border-rose-200 rounded-xl">
            <AlertCircle className="w-8 h-8 mx-auto mb-3 text-rose-400" />
            <p className="font-medium text-rose-700">{error}</p>
            <button
              onClick={fetchGoals}
              className="px-4 py-2 mt-4 text-sm text-white bg-rose-500 rounded-xl hover:bg-rose-600"
            >
              Coba Lagi
            </button>
          </div>
        ) : goals.length === 0 ? (
          <div className="p-16 text-center bg-white border shadow-sm rounded-2xl border-zinc-200">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-teal-50">
              <PiggyBank size={32} className="text-teal-400" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-zinc-900">
              Belum ada goal tabungan
            </h3>
            <p className="max-w-xs mx-auto mb-6 text-sm text-zinc-500">
              Mulai tentukan target tabunganmu dan pantau progressnya setiap
              hari!
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2.5 bg-teal-500 text-white text-sm font-semibold rounded-xl hover:bg-teal-600 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={16} /> Buat Goal Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onAdd={handleAdd}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateGoalModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </DashboardLayout>
  );
}
