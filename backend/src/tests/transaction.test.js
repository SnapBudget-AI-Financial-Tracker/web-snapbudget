import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

vi.mock("../config/prisma.js", () => ({
  default: {
    user: { findUnique: vi.fn() },
    transaction: {
      create: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    userGameStats: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    userBadge: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("../services/inferenceService.js", () => ({
  scanStruk: vi.fn(),
  getPrediksi: vi.fn().mockResolvedValue({
    prediksi_7hari: {},
    rekomendasi: { label: "AMAN", saldo_rp: 0 },
    status_per_kategori: {},
  }),
}));

vi.mock("../services/gamificationService.js", () => ({
  updateStreak: vi.fn().mockResolvedValue({ streak: 1, newBadges: [] }),
  checkTransaksiBadges: vi.fn().mockResolvedValue([]),
  checkGoalBadges: vi.fn().mockResolvedValue([]),
  getOrCreateGameStats: vi.fn(),
  awardBadge: vi.fn().mockResolvedValue(null),
  addPoin: vi.fn().mockResolvedValue({}),
  getLevelFromPoin: vi
    .fn()
    .mockReturnValue({ currentLevel: { level: 1 }, nextLevel: null }),
}));

import prisma from "../config/prisma.js";
import app from "../app.js";

const SECRET = process.env.JWT_SECRET || "fallback_secret";
const OWNER_ID = "owner-user-id";
const OTHER_ID = "other-user-id";

const tokenFor = (userId) => jwt.sign({ userId }, SECRET, { expiresIn: "1h" });
const ownerToken = tokenFor(OWNER_ID);

const ownerUser = {
  id: OWNER_ID,
  email: "owner@example.com",
  name: "Owner",
  avatarUrl: null,
};

const makeTx = (overrides = {}) => ({
  id: "tx-1",
  userId: OWNER_ID,
  amount: -50000,
  category: "makanan",
  description: "Nasi goreng",
  date: new Date().toISOString(),
  receiptUrl: null,
  ...overrides,
});

describe("POST /api/transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue(ownerUser);
  });

  it("creates a transaction and returns 201", async () => {
    const tx = makeTx();
    prisma.transaction.create.mockResolvedValue(tx);

    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        amount: -50000,
        category: "makanan",
        description: "Nasi goreng",
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ category: "makanan" });
  });

  it("returns 400 when amount is missing", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ category: "makanan" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when category is missing", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ amount: -50000 });

    expect(res.status).toBe(400);
  });

  it("returns 401 when no auth token is provided", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .send({ amount: -50000, category: "makanan" });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue(ownerUser);
  });

  it("returns an array of transactions for the authenticated user", async () => {
    const txList = [makeTx(), makeTx({ id: "tx-2" })];
    prisma.transaction.findMany.mockResolvedValue(txList);

    const res = await request(app)
      .get("/api/transactions")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
  });

  it("returns an empty array when user has no transactions", async () => {
    prisma.transaction.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get("/api/transactions")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

describe("GET /api/transactions/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue(ownerUser);
  });

  it("returns 200 with the transaction when owned by the user", async () => {
    prisma.transaction.findFirst.mockResolvedValue(makeTx());

    const res = await request(app)
      .get("/api/transactions/tx-1")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe("tx-1");
  });

  it("returns 404 when transaction does not exist", async () => {
    prisma.transaction.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/transactions/non-existent")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(404);
  });

  it("returns 404 (not 403) when transaction belongs to another user", async () => {
    prisma.transaction.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/transactions/tx-other")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(404);
  });
});

describe("PUT /api/transactions/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue(ownerUser);
  });

  it("returns 200 with updated transaction", async () => {
    const original = makeTx();
    const updated = { ...original, description: "Updated description" };
    prisma.transaction.findFirst.mockResolvedValue(original);
    prisma.transaction.update.mockResolvedValue(updated);

    const res = await request(app)
      .put("/api/transactions/tx-1")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ description: "Updated description" });

    expect(res.status).toBe(200);
    expect(res.body.description).toBe("Updated description");
  });

  it("returns 404 when transaction not found", async () => {
    prisma.transaction.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put("/api/transactions/nonexistent")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ amount: -100 });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/transactions/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue(ownerUser);
  });

  it("returns 200 with success message on successful delete", async () => {
    prisma.transaction.findFirst.mockResolvedValue(makeTx());
    prisma.transaction.delete.mockResolvedValue({});

    const res = await request(app)
      .delete("/api/transactions/tx-1")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted|berhasil/i);
    expect(prisma.transaction.delete).toHaveBeenCalledWith({
      where: { id: "tx-1" },
    });
  });

  it("returns 404 when transaction not found", async () => {
    prisma.transaction.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete("/api/transactions/ghost-tx")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(404);
    expect(prisma.transaction.delete).not.toHaveBeenCalled();
  });
});
