import { describe, it, expect } from "vitest";
import {
  getLevelFromPoin,
  BADGES,
  LEVELS,
} from "../services/gamificationService.js";

describe("getLevelFromPoin()", () => {
  it.each([
    [0, "Pemula", "Pelajar"],
    [199, "Pemula", "Pelajar"],
    [200, "Pelajar", "Mahir"],
    [499, "Pelajar", "Mahir"],
    [500, "Mahir", "Ahli"],
    [999, "Mahir", "Ahli"],
    [1000, "Ahli", "Master"],
    [1999, "Ahli", "Master"],
    [2000, "Master", "Legenda"],
    [4999, "Master", "Legenda"],
    [5000, "Legenda", null],
    [9999, "Legenda", null],
  ])(
    "poin=%i → currentLevel=%s, nextLevel=%s",
    (poin, expectedCurrent, expectedNext) => {
      const { currentLevel, nextLevel } = getLevelFromPoin(poin);
      expect(currentLevel.nama).toBe(expectedCurrent);
      if (expectedNext === null) {
        expect(nextLevel).toBeNull();
      } else {
        expect(nextLevel?.nama).toBe(expectedNext);
      }
    },
  );

  it("returns Pemula for negative poin (defensive edge case)", () => {
    const { currentLevel } = getLevelFromPoin(-100);
    expect(currentLevel.nama).toBe("Pemula");
  });

  it("currentLevel.level is always a positive integer", () => {
    [0, 200, 500, 1000, 2000, 5000].forEach((poin) => {
      const { currentLevel } = getLevelFromPoin(poin);
      expect(currentLevel.level).toBeGreaterThan(0);
      expect(Number.isInteger(currentLevel.level)).toBe(true);
    });
  });

  it("nextLevel.minPoin is always greater than poin when nextLevel exists", () => {
    [0, 100, 300, 700, 1500, 3000].forEach((poin) => {
      const { nextLevel } = getLevelFromPoin(poin);
      if (nextLevel) {
        expect(nextLevel.minPoin).toBeGreaterThan(poin);
      }
    });
  });
});

describe("BADGES — data integrity", () => {
  const badgeEntries = Object.entries(BADGES);

  it("has at least one badge defined", () => {
    expect(badgeEntries.length).toBeGreaterThan(0);
  });

  it.each(badgeEntries)("badge %s has all required fields", (key, badge) => {
    expect(badge).toHaveProperty("id");
    expect(badge).toHaveProperty("nama");
    expect(badge).toHaveProperty("icon");
    expect(badge).toHaveProperty("deskripsi");
    expect(badge).toHaveProperty("poin");
  });

  it.each(badgeEntries)(
    "badge %s — id matches its key in BADGES",
    (key, badge) => {
      expect(badge.id).toBe(key);
    },
  );

  it.each(badgeEntries)(
    "badge %s — poin is a positive integer",
    (key, badge) => {
      expect(badge.poin).toBeGreaterThan(0);
      expect(Number.isInteger(badge.poin)).toBe(true);
    },
  );

  it.each(badgeEntries)(
    "badge %s — nama and deskripsi are non-empty strings",
    (key, badge) => {
      expect(typeof badge.nama).toBe("string");
      expect(badge.nama.trim().length).toBeGreaterThan(0);
      expect(typeof badge.deskripsi).toBe("string");
      expect(badge.deskripsi.trim().length).toBeGreaterThan(0);
    },
  );

  it("all badge IDs are unique", () => {
    const ids = badgeEntries.map(([, b]) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("LEVELS — structural integrity", () => {
  it("starts at level 1 with minPoin 0", () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].minPoin).toBe(0);
  });

  it("level numbers are sequential starting at 1", () => {
    LEVELS.forEach((l, i) => {
      expect(l.level).toBe(i + 1);
    });
  });

  it("minPoin values are strictly increasing", () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].minPoin).toBeGreaterThan(LEVELS[i - 1].minPoin);
    }
  });

  it("each level has nama, icon, and minPoin", () => {
    LEVELS.forEach((level) => {
      expect(typeof level.nama).toBe("string");
      expect(level.nama.trim().length).toBeGreaterThan(0);
      expect(typeof level.icon).toBe("string");
      expect(typeof level.minPoin).toBe("number");
    });
  });
});
