import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../config/prisma.js", () => ({
  default: {
    userGameStats: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    userBadge: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
    transaction: {
      count: vi.fn(),
    },
    savingGoal: {
      findMany: vi.fn(),
    },
  },
}));

import prisma from "../config/prisma.js";
import {
  updateStreak,
  checkTransaksiBadges,
  checkGoalBadges,
  awardBadge,
  addPoin,
  getOrCreateGameStats,
} from "../services/gamificationService.js";

const USER_ID = "user-123";

const makeStats = (overrides = {}) => ({
  userId: USER_ID,
  totalPoin: 0,
  streakHarian: 0,
  streakTerpanjang: 0,
  lastActiveDate: null,
  level: 1,
  ...overrides,
});

const today = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const daysAgo = (n) => {
  const d = today();
  d.setDate(d.getDate() - n);
  return d;
};

describe("getOrCreateGameStats()", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns existing stats when found", async () => {
    const existing = makeStats({ totalPoin: 500 });
    prisma.userGameStats.findUnique.mockResolvedValue(existing);

    const result = await getOrCreateGameStats(USER_ID);
    expect(result).toEqual(existing);
    expect(prisma.userGameStats.create).not.toHaveBeenCalled();
  });

  it("creates new stats when none found", async () => {
    prisma.userGameStats.findUnique.mockResolvedValue(null);
    const created = makeStats();
    prisma.userGameStats.create.mockResolvedValue(created);

    const result = await getOrCreateGameStats(USER_ID);
    expect(prisma.userGameStats.create).toHaveBeenCalledWith({
      data: { userId: USER_ID, totalPoin: 0, streakHarian: 0, level: 1 },
    });
    expect(result).toEqual(created);
  });
});

describe("addPoin()", () => {
  beforeEach(() => vi.clearAllMocks());

  it("accumulates poin on top of existing total", async () => {
    const stats = makeStats({ totalPoin: 150 });
    prisma.userGameStats.findUnique.mockResolvedValue(stats);
    prisma.userGameStats.update.mockResolvedValue({ totalPoin: 300, level: 2 });

    await addPoin(USER_ID, 150);

    expect(prisma.userGameStats.update).toHaveBeenCalledWith({
      where: { userId: USER_ID },
      data: expect.objectContaining({ totalPoin: 300 }),
    });
  });

  it("recalculates level when poin crosses a threshold", async () => {
    // 150 → 200 crosses the Pelajar threshold
    const stats = makeStats({ totalPoin: 150 });
    prisma.userGameStats.findUnique.mockResolvedValue(stats);
    prisma.userGameStats.update.mockResolvedValue({ totalPoin: 200, level: 2 });

    await addPoin(USER_ID, 50);

    expect(prisma.userGameStats.update).toHaveBeenCalledWith({
      where: { userId: USER_ID },
      data: expect.objectContaining({ level: 2 }),
    });
  });
});

describe("awardBadge()", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null for an unknown badge ID", async () => {
    const result = await awardBadge(USER_ID, "BADGE_TIDAK_ADA");
    expect(result).toBeNull();
    expect(prisma.userBadge.findUnique).not.toHaveBeenCalled();
  });

  it("returns null if the user already owns the badge (no duplicate award)", async () => {
    prisma.userBadge.findUnique.mockResolvedValue({
      userId: USER_ID,
      badgeId: "TRANSAKSI_PERTAMA",
    });

    const result = await awardBadge(USER_ID, "TRANSAKSI_PERTAMA");
    expect(result).toBeNull();
    expect(prisma.userBadge.create).not.toHaveBeenCalled();
  });

  it("creates badge record and adds poin when badge is new", async () => {
    prisma.userBadge.findUnique.mockResolvedValue(null);
    prisma.userBadge.create.mockResolvedValue({});
    // addPoin chain
    prisma.userGameStats.findUnique.mockResolvedValue(makeStats());
    prisma.userGameStats.update.mockResolvedValue({ totalPoin: 50, level: 1 });

    const result = await awardBadge(USER_ID, "TRANSAKSI_PERTAMA");

    expect(result).not.toBeNull();
    expect(result.id).toBe("TRANSAKSI_PERTAMA");
    expect(prisma.userBadge.create).toHaveBeenCalledWith({
      data: { userId: USER_ID, badgeId: "TRANSAKSI_PERTAMA" },
    });
  });
});

describe("updateStreak()", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does NOT increment streak if user already input today", async () => {
    const stats = makeStats({ streakHarian: 3, lastActiveDate: today() });
    prisma.userGameStats.findUnique.mockResolvedValue(stats);

    const { streak } = await updateStreak(USER_ID);
    expect(streak).toBe(3);
    expect(prisma.userGameStats.update).not.toHaveBeenCalled();
  });

  it("increments streak by 1 on consecutive days", async () => {
    const stats = makeStats({
      streakHarian: 2,
      streakTerpanjang: 2,
      lastActiveDate: daysAgo(1),
    });
    prisma.userGameStats.findUnique.mockResolvedValue(stats);
    prisma.userGameStats.update.mockResolvedValue({});
    prisma.userBadge.findUnique.mockResolvedValue({
      userId: USER_ID,
      badgeId: "STREAK_3",
    });

    const { streak } = await updateStreak(USER_ID);
    expect(streak).toBe(3);
    expect(prisma.userGameStats.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ streakHarian: 3 }),
      }),
    );
  });

  it("resets streak to 1 when more than 1 day has passed", async () => {
    const stats = makeStats({
      streakHarian: 5,
      streakTerpanjang: 5,
      lastActiveDate: daysAgo(3),
    });
    prisma.userGameStats.findUnique.mockResolvedValue(stats);
    prisma.userGameStats.update.mockResolvedValue({});
    prisma.userBadge.findUnique.mockResolvedValue(null);
    prisma.userGameStats.update.mockResolvedValue({});

    const { streak } = await updateStreak(USER_ID);
    expect(streak).toBe(1);
  });

  it("sets streak to 1 for a user with no prior activity", async () => {
    const stats = makeStats({ streakHarian: 0, lastActiveDate: null });
    prisma.userGameStats.findUnique.mockResolvedValue(stats);
    prisma.userGameStats.update.mockResolvedValue({});

    const { streak } = await updateStreak(USER_ID);
    expect(streak).toBe(1);
  });

  it("awards STREAK_7 badge when streak reaches 7", async () => {
    const stats = makeStats({
      streakHarian: 6,
      streakTerpanjang: 6,
      lastActiveDate: daysAgo(1),
    });
    prisma.userGameStats.findUnique.mockResolvedValue(stats);
    prisma.userGameStats.update.mockResolvedValue({});
    prisma.userBadge.findUnique
      .mockResolvedValueOnce({ userId: USER_ID, badgeId: "STREAK_3" })
      .mockResolvedValueOnce(null);
    prisma.userBadge.create.mockResolvedValue({});
    prisma.userGameStats.update.mockResolvedValue({ totalPoin: 150, level: 1 });

    const { streak, newBadges } = await updateStreak(USER_ID);
    expect(streak).toBe(7);
    expect(newBadges.some((b) => b.id === "STREAK_7")).toBe(true);
  });
});

describe("checkTransaksiBadges()", () => {
  beforeEach(() => vi.clearAllMocks());

  const setupAwardMocks = () => {
    prisma.userBadge.findUnique.mockResolvedValue(null);
    prisma.userBadge.create.mockResolvedValue({});
    prisma.userGameStats.findUnique.mockResolvedValue(makeStats());
    prisma.userGameStats.update.mockResolvedValue({});
  };

  it("awards TRANSAKSI_PERTAMA when count is 1", async () => {
    setupAwardMocks();
    prisma.transaction.count.mockResolvedValue(1);

    const badges = await checkTransaksiBadges(USER_ID);
    expect(badges.some((b) => b.id === "TRANSAKSI_PERTAMA")).toBe(true);
    expect(badges.some((b) => b.id === "TRANSAKSI_10")).toBe(false);
  });

  it("awards TRANSAKSI_10 (and TRANSAKSI_PERTAMA) when count is 10", async () => {
    setupAwardMocks();
    prisma.transaction.count.mockResolvedValue(10);

    const badges = await checkTransaksiBadges(USER_ID);
    const ids = badges.map((b) => b.id);
    expect(ids).toContain("TRANSAKSI_PERTAMA");
    expect(ids).toContain("TRANSAKSI_10");
  });

  it("does not award duplicate badges (all already owned)", async () => {
    prisma.transaction.count.mockResolvedValue(10);
    // All badges already owned
    prisma.userBadge.findUnique.mockResolvedValue({
      userId: USER_ID,
      badgeId: "X",
    });

    const badges = await checkTransaksiBadges(USER_ID);
    expect(badges).toHaveLength(0);
  });

  it("awards TRANSAKSI_50 when count is exactly 50", async () => {
    setupAwardMocks();
    prisma.transaction.count.mockResolvedValue(50);

    const badges = await checkTransaksiBadges(USER_ID);
    expect(badges.some((b) => b.id === "TRANSAKSI_50")).toBe(true);
  });

  it("awards TRANSAKSI_100 when count is 100+", async () => {
    setupAwardMocks();
    prisma.transaction.count.mockResolvedValue(100);

    const badges = await checkTransaksiBadges(USER_ID);
    expect(badges.some((b) => b.id === "TRANSAKSI_100")).toBe(true);
  });
});

describe("checkGoalBadges()", () => {
  beforeEach(() => vi.clearAllMocks());

  const setupAwardMocks = () => {
    prisma.userBadge.findUnique.mockResolvedValue(null);
    prisma.userBadge.create.mockResolvedValue({});
    prisma.userGameStats.findUnique.mockResolvedValue(makeStats());
    prisma.userGameStats.update.mockResolvedValue({});
  };

  it("awards GOAL_PERTAMA when first goal is created", async () => {
    setupAwardMocks();
    prisma.savingGoal.findMany.mockResolvedValue([{ status: "aktif" }]);

    const badges = await checkGoalBadges(USER_ID);
    expect(badges.some((b) => b.id === "GOAL_PERTAMA")).toBe(true);
  });

  it("awards GOAL_TERCAPAI when one goal is reached", async () => {
    setupAwardMocks();
    prisma.savingGoal.findMany.mockResolvedValue([{ status: "tercapai" }]);

    const badges = await checkGoalBadges(USER_ID);
    const ids = badges.map((b) => b.id);
    expect(ids).toContain("GOAL_PERTAMA");
    expect(ids).toContain("GOAL_TERCAPAI");
  });

  it("awards GOAL_3_TERCAPAI when 3+ goals are reached", async () => {
    setupAwardMocks();
    prisma.savingGoal.findMany.mockResolvedValue([
      { status: "tercapai" },
      { status: "tercapai" },
      { status: "tercapai" },
    ]);

    const badges = await checkGoalBadges(USER_ID);
    expect(badges.some((b) => b.id === "GOAL_3_TERCAPAI")).toBe(true);
  });

  it("does not award GOAL_TERCAPAI when no goals are reached yet", async () => {
    setupAwardMocks();
    prisma.savingGoal.findMany.mockResolvedValue([
      { status: "aktif" },
      { status: "aktif" },
    ]);

    const badges = await checkGoalBadges(USER_ID);
    expect(badges.some((b) => b.id === "GOAL_TERCAPAI")).toBe(false);
  });
});
