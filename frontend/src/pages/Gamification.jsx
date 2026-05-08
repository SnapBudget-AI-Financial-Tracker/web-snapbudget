// frontend/src/pages/Gamification.jsx
import { useState, useEffect } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import api from "../services/api";
import {
  Trophy,
  Star,
  Zap,
  Target,
  Award,
  TrendingUp,
  Lock,
  CheckCircle2,
  Flame,
  Footprints,
  PenLine,
  Briefcase,
  Camera,
  Search,
  Wallet,
  Crown,
  Rocket,
  Sparkles,
  Shield,
  Bike,
  BookOpen,
  Plane,
  Shirt,
  Heart,
  Laptop,
  Sprout,
} from "lucide-react";

const formatPoin = (p) => p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// Map icon names to Lucide components
const iconMap = {
  footprints: Footprints,
  "pen-line": PenLine,
  briefcase: Briefcase,
  trophy: Trophy,
  camera: Camera,
  search: Search,
  wallet: Wallet,
  crown: Crown,
  flame: Flame,
  zap: Zap,
  star: Star,
  target: Target,
  sparkles: Sparkles,
  rocket: Rocket,
  shield: Shield,
  bike: Bike,
  "book-open": BookOpen,
  plane: Plane,
  shirt: Shirt,
  heart: Heart,
  laptop: Laptop,
  seedling: Sprout,
  award: Award,
};

const IconRenderer = ({ name, size = 24, className = "" }) => {
  const Icon = iconMap[name];
  return Icon ? <Icon size={size} className={className} /> : null;
};

// ── Level Card ────────────────────────────────────────────────────
function LevelCard({ data }) {
  const { stats, currentLevel, nextLevel, poinKeLevel, progressLevel } = data;

  return (
    <div className="p-5 md:p-6 text-white shadow-lg bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20">
            <IconRenderer
              name={currentLevel.icon}
              size={28}
              className="text-white"
            />
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-teal-200 uppercase">
              Level {currentLevel.level}
            </p>
            <h2 className="text-2xl font-bold">{currentLevel.nama}</h2>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-teal-200">Total Poin</p>
          <p className="text-3xl font-bold">{formatPoin(stats.totalPoin)}</p>
        </div>
      </div>

      {/* Progress ke level berikutnya */}
      {nextLevel && (
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-teal-200">
              Menuju{" "}
              <IconRenderer
                name={nextLevel.icon}
                size={14}
                className="inline"
              />{" "}
              {nextLevel.nama}
            </span>
            <span className="font-semibold">
              {formatPoin(poinKeLevel)} poin lagi
            </span>
          </div>
          <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-700 bg-white rounded-full"
              style={{ width: `${progressLevel}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          {
            label: "Streak",
            value: `${stats.streakHarian} hari`,
            icon: "flame",
          },
          {
            label: "Terpanjang",
            value: `${stats.streakTerpanjang} hari`,
            icon: "zap",
          },
          { label: "Badge", value: data.earnedBadges.length, icon: "award" },
        ].map((s, i) => (
          <div key={i} className="px-3 py-2 text-center bg-white/10 rounded-xl">
            <div className="flex justify-center mb-1">
              <IconRenderer name={s.icon} size={20} className="text-white" />
            </div>
            <p className="text-sm font-bold">{s.value}</p>
            <p className="text-[10px] text-teal-200 uppercase">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Streak Card ───────────────────────────────────────────────────
function StreakCard({ stats }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  return (
    <div className="p-5 bg-white border shadow-sm rounded-2xl border-teal-100/60">
      <div className="flex items-center gap-2 mb-4">
        <Flame size={18} className="text-orange-500" />
        <h3 className="font-bold text-zinc-900">Streak Harian</h3>
      </div>
      <div className="flex justify-between gap-1.5">
        {days.map((d, i) => {
          const isToday = i === 6;
          const isActive = i >= 7 - stats.streakHarian;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <p className="text-[10px] text-zinc-400">
                {d.toLocaleDateString("id-ID", { weekday: "short" })}
              </p>
              <div
                className={`w-full aspect-square rounded-lg flex items-center justify-center text-sm transition-all ${
                  isActive
                    ? isToday
                      ? "bg-orange-500 text-white shadow-md"
                      : "bg-orange-100 text-orange-600"
                    : "bg-zinc-100 text-zinc-300"
                }`}
              >
                {isActive ? <Flame size={16} /> : "·"}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-center text-zinc-500">
        {stats.streakHarian > 0
          ? `${stats.streakHarian} hari berturut-turut! Pertahankan!`
          : "Input transaksi hari ini untuk mulai streak!"}
      </p>
    </div>
  );
}

// ── Badge Grid ────────────────────────────────────────────────────
function BadgeGrid({ allBadges }) {
  const [filter, setFilter] = useState("semua");

  const filtered = allBadges.filter((b) =>
    filter === "semua" ? true : filter === "diraih" ? b.earned : !b.earned,
  );

  return (
    <div className="p-5 bg-white border shadow-sm rounded-2xl border-teal-100/60">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-teal-600" />
          <h3 className="font-bold text-zinc-900">Koleksi Badge</h3>
          <span className="text-xs text-zinc-400">
            ({allBadges.filter((b) => b.earned).length}/{allBadges.length})
          </span>
        </div>
        <div className="flex gap-1">
          {["semua", "diraih", "belum"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                filter === f
                  ? "bg-teal-500 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((badge) => (
          <div
            key={badge.id}
            className={`relative rounded-xl p-3 border text-center transition-all ${
              badge.earned
                ? "border-teal-100 bg-teal-50 hover:shadow-md hover:-translate-y-0.5"
                : "border-zinc-100 bg-zinc-50 opacity-50"
            }`}
          >
            {badge.earned && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 size={12} className="text-teal-500" />
              </div>
            )}
            {!badge.earned && (
              <div className="absolute top-2 right-2">
                <Lock size={12} className="text-zinc-400" />
              </div>
            )}
            <div className="mb-2 flex justify-center">
              {badge.earned ? (
                <IconRenderer
                  name={badge.icon}
                  size={32}
                  className="text-teal-600"
                />
              ) : (
                <Lock size={32} className="text-zinc-400" />
              )}
            </div>
            <p className="mb-1 text-xs font-bold leading-tight text-zinc-800">
              {badge.nama}
            </p>
            <p className="text-[10px] text-zinc-500 leading-tight">
              {badge.deskripsi}
            </p>
            <div
              className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                badge.earned
                  ? "bg-teal-100 text-teal-700"
                  : "bg-zinc-100 text-zinc-500"
              }`}
            >
              +{badge.poin} poin
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function Gamification() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/gamification");
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-teal-500 rounded-full border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  return (
    <DashboardLayout>
      <div className="w-full max-w-5xl p-4 mx-auto space-y-5 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 animate-fadeIn">
          <div className="flex items-center justify-center w-10 h-10 bg-teal-500 rounded-xl">
            <Trophy size={20} className="text-white" />
          </div>
          <div>
            <h1
              style={{ fontFamily: "var(--font-heading)" }}
              className="text-xl font-bold text-zinc-900"
            >
              Gamifikasi Keuangan
            </h1>
            <p className="text-sm text-zinc-500">
              Raih poin dan badge dengan kebiasaan keuangan baik
            </p>
          </div>
        </div>

        {/* Level Card */}
        <LevelCard data={data} />

        {/* Streak */}
        <StreakCard stats={data.stats} />

        {/* Cara Dapat Poin */}
        <div className="p-5 bg-white border shadow-sm rounded-2xl border-teal-100/60">
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-yellow-500" />
            <h3 className="font-bold text-zinc-900">Cara Dapat Poin</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: "pen-line", aksi: "Input Transaksi", poin: "+10 poin" },
              { icon: "camera", aksi: "Scan Struk", poin: "+25 poin" },
              { icon: "target", aksi: "Buat Goal", poin: "+50 poin" },
              { icon: "sparkles", aksi: "Capai Goal", poin: "+100 poin" },
              { icon: "flame", aksi: "Streak Harian", poin: "+5/hari" },
              { icon: "wallet", aksi: "Status HEMAT", poin: "+200/bulan" },
              { icon: "award", aksi: "Raih Badge", poin: "Varies" },
              { icon: "crown", aksi: "Naik Level", poin: "Milestone" },
            ].map((item, i) => (
              <div key={i} className="p-3 text-center bg-zinc-50 rounded-xl">
                <div className="flex justify-center mb-1">
                  <IconRenderer
                    name={item.icon}
                    size={24}
                    className="text-zinc-700"
                  />
                </div>
                <p className="text-xs font-semibold text-zinc-700">
                  {item.aksi}
                </p>
                <p className="text-xs text-teal-600 font-bold mt-0.5">
                  {item.poin}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Badge Grid */}
        <BadgeGrid allBadges={data.allBadges} />
      </div>
    </DashboardLayout>
  );
}
