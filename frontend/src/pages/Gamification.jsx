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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((badge) => (
          <div
            key={badge.id}
            className={`relative rounded-2xl p-4 border text-center transition-all duration-300 group/badge ${
              badge.earned
                ? "border-teal-100 bg-gradient-to-b from-white to-teal-50/30 hover:shadow-lg hover:-translate-y-1"
                : "border-zinc-100 bg-zinc-50/50 opacity-60"
            }`}
          >
            {badge.earned ? (
              <div className="absolute top-2.5 right-2.5 p-1 bg-teal-500 rounded-full shadow-sm">
                <CheckCircle2 size={10} className="text-white" />
              </div>
            ) : (
              <div className="absolute top-2.5 right-2.5 p-1 bg-zinc-200 rounded-full">
                <Lock size={10} className="text-zinc-400" />
              </div>
            )}
            
            <div className="mb-3 flex justify-center">
              <div className={`p-3 rounded-2xl transition-transform duration-500 group-hover/badge:scale-110 ${
                badge.earned ? "bg-white shadow-sm" : "bg-zinc-100"
              }`}>
                {badge.earned ? (
                  <IconRenderer
                    name={badge.icon}
                    size={32}
                    className="text-teal-600"
                  />
                ) : (
                  <Lock size={32} className="text-zinc-300" />
                )}
              </div>
            </div>
            
            <h4 className="mb-1 text-xs font-bold text-zinc-900 leading-tight">
              {badge.nama}
            </h4>
            <p className="text-[10px] text-zinc-500 leading-relaxed px-1">
              {badge.deskripsi}
            </p>
            
            <div
              className={`mt-3 text-[10px] font-bold px-3 py-1 rounded-full inline-flex items-center gap-1 ${
                badge.earned
                  ? "bg-teal-500 text-white shadow-sm shadow-teal-200"
                  : "bg-zinc-200 text-zinc-500"
              }`}
            >
              <Star size={8} className={badge.earned ? "fill-white" : ""} />
              {badge.poin} poin
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
        <div className="flex items-center justify-between animate-fadeIn">
          <div>
            <h1
              className="text-teal-900 font-semibold text-[17px] leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Gamifikasi Keuangan
            </h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              Raih poin dan badge dengan kebiasaan keuangan baik
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
          {/* Points Card */}
          <div className="relative overflow-hidden p-6 bg-white border border-teal-100/60 rounded-2xl shadow-sm group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Star size={80} className="text-teal-600 fill-teal-600" />
            </div>
            <div className="relative flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-teal-50 rounded-xl">
                <Sparkles className="text-teal-600" size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Poin</p>
                <p className="text-2xl font-bold text-zinc-900">{formatPoin(data.stats.totalPoin)}</p>
              </div>
            </div>
          </div>

          {/* Level Card */}
          <div className="relative overflow-hidden p-6 bg-white border border-teal-100/60 rounded-2xl shadow-sm group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <IconRenderer name={data.currentLevel.icon} size={80} className="text-amber-500 fill-amber-500" />
            </div>
            <div className="relative flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-amber-50 rounded-xl">
                <IconRenderer name={data.currentLevel.icon} size={24} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Level {data.currentLevel.level}</p>
                <p className="text-2xl font-bold text-zinc-900">{data.currentLevel.nama}</p>
              </div>
            </div>
          </div>

          {/* Rank Card */}
          <div className="relative overflow-hidden p-6 bg-white border border-teal-100/60 rounded-2xl shadow-sm group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp size={80} className="text-blue-500" />
            </div>
            <div className="relative flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl">
                <Trophy className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Peringkat</p>
                <p className="text-2xl font-bold text-zinc-900">#{data.rank}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress Section */}
        <div className="p-5 md:p-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl text-white shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10 -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700">
             <Trophy size={200} />
          </div>
          
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <IconRenderer name={data.currentLevel.icon} size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{data.currentLevel.nama}</h2>
                  <p className="text-teal-100 text-sm">Terus kumpulkan poin untuk naik level!</p>
                </div>
              </div>
              
              {data.nextLevel && (
                <div className="text-left md:text-right">
                  <p className="text-teal-200 text-xs uppercase tracking-widest font-bold mb-1">Level Berikutnya</p>
                  <div className="flex items-center md:justify-end gap-2 text-xl font-bold">
                    <IconRenderer name={data.nextLevel.icon} size={20} />
                    {data.nextLevel.nama}
                  </div>
                </div>
              )}
            </div>

            {data.nextLevel && (
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-medium text-teal-100">
                    Progres Level {data.currentLevel.level}
                  </span>
                  <span className="text-lg font-bold">
                    {data.progressLevel}%
                  </span>
                </div>
                <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-200 to-white rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{ width: `${data.progressLevel}%` }}
                  />
                </div>
                <p className="text-sm text-teal-100 text-center md:text-left italic">
                  Tinggal {formatPoin(data.poinKeLevel)} poin lagi untuk menjadi {data.nextLevel.nama}!
                </p>
              </div>
            )}
          </div>
          
          {/* Internal Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-8 border-t border-white/10 pt-6">
            {[
              { label: "Streak", value: `${data.stats.streakHarian} hari`, icon: "flame" },
              { label: "Terpanjang", value: `${data.stats.streakTerpanjang} hari`, icon: "zap" },
              { label: "Badge", value: data.earnedBadges.length, icon: "award" },
            ].map((s, i) => (
              <div key={i} className="text-center group/stat">
                <div className="flex justify-center mb-2">
                  <IconRenderer name={s.icon} size={24} className="text-teal-200 group-hover/stat:text-white transition-colors" />
                </div>
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-[10px] text-teal-300 uppercase tracking-wider font-bold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Streak */}
        <StreakCard stats={data.stats} />

        {/* Cara Dapat Poin */}
        <div className="p-5 bg-white border shadow-sm rounded-2xl border-teal-100/60 overflow-hidden relative group">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-yellow-50 rounded-lg">
              <Star size={18} className="text-yellow-500 fill-yellow-500" />
            </div>
            <h3 className="font-bold text-zinc-900 tracking-tight">Cara Dapat Poin</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: "pen-line", aksi: "Input Transaksi", poin: "+10", color: "bg-blue-50 text-blue-600" },
              { icon: "camera", aksi: "Scan Struk", poin: "+25", color: "bg-purple-50 text-purple-600" },
              { icon: "target", aksi: "Buat Goal", poin: "+50", color: "bg-emerald-50 text-emerald-600" },
              { icon: "sparkles", aksi: "Capai Goal", poin: "+100", color: "bg-amber-50 text-amber-600" },
              { icon: "flame", aksi: "Streak Harian", poin: "+5/hari", color: "bg-orange-50 text-orange-600" },
              { icon: "wallet", aksi: "Status HEMAT", poin: "+200", color: "bg-teal-50 text-teal-600" },
              { icon: "award", aksi: "Raih Badge", poin: "Varies", color: "bg-indigo-50 text-indigo-600" },
              { icon: "crown", aksi: "Naik Level", poin: "Bonus", color: "bg-rose-50 text-rose-600" },
            ].map((item, i) => (
              <div 
                key={i} 
                className="group/card p-4 text-center bg-zinc-50 border border-transparent hover:border-teal-100 hover:bg-white hover:shadow-md transition-all duration-300 rounded-2xl"
              >
                <div className={`flex justify-center items-center w-10 h-10 mx-auto mb-3 rounded-xl ${item.color.split(' ')[0]} transition-transform group-hover/card:scale-110`}>
                  <IconRenderer
                    name={item.icon}
                    size={20}
                    className={item.color.split(' ')[1]}
                  />
                </div>
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">
                  {item.aksi}
                </p>
                <p className="text-sm font-bold text-zinc-900">
                  {item.poin} <span className="text-[10px] text-zinc-400 font-normal">poin</span>
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
