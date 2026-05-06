// backend/src/services/gamificationService.js
import prisma from "../config/prisma.js";
// ── Definisi semua badge ──────────────────────────────────────────
export const BADGES = {
  // Transaksi
  TRANSAKSI_PERTAMA: {
    id: "TRANSAKSI_PERTAMA",
    nama: "Langkah Pertama",
    icon: "footprints",
    deskripsi: "Input transaksi pertama kali",
    poin: 50,
  },
  TRANSAKSI_10: {
    id: "TRANSAKSI_10",
    nama: "Pencatat Rajin",
    icon: "pen-line",
    deskripsi: "Input 10 transaksi",
    poin: 100,
  },
  TRANSAKSI_50: {
    id: "TRANSAKSI_50",
    nama: "Ahli Keuangan",
    icon: "briefcase",
    deskripsi: "Input 50 transaksi",
    poin: 200,
  },
  TRANSAKSI_100: {
    id: "TRANSAKSI_100",
    nama: "Master Keuangan",
    icon: "trophy",
    deskripsi: "Input 100 transaksi",
    poin: 500,
  },

  // Scan struk
  SCAN_PERTAMA: {
    id: "SCAN_PERTAMA",
    nama: "Scanner Pemula",
    icon: "camera",
    deskripsi: "Scan struk pertama kali",
    poin: 75,
  },
  SCAN_10: {
    id: "SCAN_10",
    nama: "Scanner Handal",
    icon: "search",
    deskripsi: "Scan 10 struk",
    poin: 150,
  },

  // Hemat
  HEMAT_1_BULAN: {
    id: "HEMAT_1_BULAN",
    nama: "Pejuang Hemat",
    icon: "wallet",
    deskripsi: "Status HEMAT selama 1 bulan penuh",
    poin: 200,
  },
  HEMAT_3_BULAN: {
    id: "HEMAT_3_BULAN",
    nama: "Raja Hemat",
    icon: "crown",
    deskripsi: "Status HEMAT 3 bulan berturut-turut",
    poin: 500,
  },

  // Streak
  STREAK_3: {
    id: "STREAK_3",
    nama: "Konsisten 3 Hari",
    icon: "flame",
    deskripsi: "Input transaksi 3 hari berturut-turut",
    poin: 75,
  },
  STREAK_7: {
    id: "STREAK_7",
    nama: "Seminggu Konsisten",
    icon: "zap",
    deskripsi: "Input transaksi 7 hari berturut-turut",
    poin: 150,
  },
  STREAK_30: {
    id: "STREAK_30",
    nama: "Bulan Penuh",
    icon: "star",
    deskripsi: "Input transaksi 30 hari berturut-turut",
    poin: 500,
  },

  // Goals
  GOAL_PERTAMA: {
    id: "GOAL_PERTAMA",
    nama: "Pemimpi Besar",
    icon: "target",
    deskripsi: "Buat goal tabungan pertama",
    poin: 100,
  },
  GOAL_TERCAPAI: {
    id: "GOAL_TERCAPAI",
    nama: "Pencapai Impian",
    icon: "sparkles",
    deskripsi: "Capai goal tabungan pertama",
    poin: 300,
  },
  GOAL_3_TERCAPAI: {
    id: "GOAL_3_TERCAPAI",
    nama: "Goal Getter",
    icon: "rocket",
    deskripsi: "Capai 3 goal tabungan",
    poin: 750,
  },

  // Budget
  BUDGET_AMAN: {
    id: "BUDGET_AMAN",
    nama: "Bijak Berbelanja",
    icon: "shield",
    deskripsi: "Selesaikan bulan tanpa melebihi budget",
    poin: 250,
  },
};

// ── Level system ──────────────────────────────────────────────────
export const LEVELS = [
  { level: 1, nama: "Pemula", minPoin: 0, icon: "seedling" },
  { level: 2, nama: "Pelajar", minPoin: 200, icon: "book-open" },
  { level: 3, nama: "Mahir", minPoin: 500, icon: "star" },
  { level: 4, nama: "Ahli", minPoin: 1000, icon: "sparkles" },
  { level: 5, nama: "Master", minPoin: 2000, icon: "trophy" },
  { level: 6, nama: "Legenda", minPoin: 5000, icon: "crown" },
];

export const getLevelFromPoin = (poin) => {
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (poin >= level.minPoin) currentLevel = level;
  }
  const nextLevel = LEVELS.find((l) => l.minPoin > poin) || null;
  return { currentLevel, nextLevel };
};

// ── Get atau buat game stats ──────────────────────────────────────
export const getOrCreateGameStats = async (userId) => {
  let stats = await prisma.userGameStats.findUnique({ where: { userId } });
  if (!stats) {
    stats = await prisma.userGameStats.create({
      data: { userId, totalPoin: 0, streakHarian: 0, level: 1 },
    });
  }
  return stats;
};

// ── Tambah poin ───────────────────────────────────────────────────
export const addPoin = async (userId, poin) => {
  const stats = await getOrCreateGameStats(userId);
  const newPoin = stats.totalPoin + poin;
  const { currentLevel } = getLevelFromPoin(newPoin);

  return await prisma.userGameStats.update({
    where: { userId },
    data: { totalPoin: newPoin, level: currentLevel.level },
  });
};

// ── Award badge ───────────────────────────────────────────────────
export const awardBadge = async (userId, badgeId) => {
  const badge = BADGES[badgeId];
  if (!badge) return null;

  try {
    // Cek sudah punya badge belum
    const existing = await prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId } },
    });
    if (existing) return null;

    // Award badge dan tambah poin
    await prisma.userBadge.create({ data: { userId, badgeId } });
    await addPoin(userId, badge.poin);

    return badge;
  } catch {
    return null;
  }
};

// ── Update streak harian ──────────────────────────────────────────
export const updateStreak = async (userId) => {
  const stats = await getOrCreateGameStats(userId);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let newStreak = stats.streakHarian;
  const newBadges = [];

  if (stats.lastActiveDate) {
    const last = new Date(stats.lastActiveDate);
    const lastDate = new Date(
      last.getFullYear(),
      last.getMonth(),
      last.getDate()
    );
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Sudah input hari ini, tidak update streak
      return { streak: newStreak, newBadges };
    } else if (diffDays === 1) {
      // Hari berturut-turut
      newStreak += 1;
    } else {
      // Streak terputus
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  const terpanjang = Math.max(stats.streakTerpanjang, newStreak);

  await prisma.userGameStats.update({
    where: { userId },
    data: {
      streakHarian: newStreak,
      streakTerpanjang: terpanjang,
      lastActiveDate: now,
    },
  });

  // Cek badge streak
  if (newStreak >= 3) {
    const b = await awardBadge(userId, "STREAK_3");
    if (b) newBadges.push(b);
  }
  if (newStreak >= 7) {
    const b = await awardBadge(userId, "STREAK_7");
    if (b) newBadges.push(b);
  }
  if (newStreak >= 30) {
    const b = await awardBadge(userId, "STREAK_30");
    if (b) newBadges.push(b);
  }

  return { streak: newStreak, newBadges };
};

// ── Check dan award badge transaksi ──────────────────────────────
export const checkTransaksiBadges = async (userId) => {
  const newBadges = [];
  const count = await prisma.transaction.count({ where: { userId } });

  if (count >= 1) {
    const b = await awardBadge(userId, "TRANSAKSI_PERTAMA");
    if (b) newBadges.push(b);
  }
  if (count >= 10) {
    const b = await awardBadge(userId, "TRANSAKSI_10");
    if (b) newBadges.push(b);
  }
  if (count >= 50) {
    const b = await awardBadge(userId, "TRANSAKSI_50");
    if (b) newBadges.push(b);
  }
  if (count >= 100) {
    const b = await awardBadge(userId, "TRANSAKSI_100");
    if (b) newBadges.push(b);
  }

  return newBadges;
};

// ── Check badge goals ─────────────────────────────────────────────
export const checkGoalBadges = async (userId) => {
  const newBadges = [];
  const goals = await prisma.savingGoal.findMany({ where: { userId } });

  if (goals.length >= 1) {
    const b = await awardBadge(userId, "GOAL_PERTAMA");
    if (b) newBadges.push(b);
  }

  const tercapai = goals.filter((g) => g.status === "tercapai").length;
  if (tercapai >= 1) {
    const b = await awardBadge(userId, "GOAL_TERCAPAI");
    if (b) newBadges.push(b);
  }
  if (tercapai >= 3) {
    const b = await awardBadge(userId, "GOAL_3_TERCAPAI");
    if (b) newBadges.push(b);
  }

  return newBadges;
};

// ── Get full gamification data ────────────────────────────────────
export const getGamificationData = async (userId) => {
  const [stats, userBadges] = await Promise.all([
    getOrCreateGameStats(userId),
    prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: "desc" },
    }),
  ]);

  const { currentLevel, nextLevel } = getLevelFromPoin(stats.totalPoin);
  const earnedBadgeIds = userBadges.map((b) => b.badgeId);
  const poinKeLevel = nextLevel ? nextLevel.minPoin - stats.totalPoin : 0;
  const progressLevel = nextLevel
    ? ((stats.totalPoin - currentLevel.minPoin) /
        (nextLevel.minPoin - currentLevel.minPoin)) *
      100
    : 100;

  return {
    stats,
    currentLevel,
    nextLevel,
    poinKeLevel,
    progressLevel: Math.round(progressLevel),
    earnedBadges: userBadges
      .map((ub) => ({
        ...BADGES[ub.badgeId],
        earnedAt: ub.earnedAt,
      }))
      .filter(Boolean),
    allBadges: Object.values(BADGES).map((badge) => ({
      ...badge,
      earned: earnedBadgeIds.includes(badge.id),
      earnedAt:
        userBadges.find((ub) => ub.badgeId === badge.id)?.earnedAt || null,
    })),
  };
};
