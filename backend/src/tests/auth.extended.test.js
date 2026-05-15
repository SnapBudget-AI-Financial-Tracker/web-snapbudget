import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("../config/prisma.js", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
    compare: vi.fn(),
  },
}));

vi.mock("../services/emailService.js", () => ({
  default: {
    sendPasswordResetEmail: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock("google-auth-library", () => ({
  OAuth2Client: vi.fn().mockImplementation(() => ({
    verifyIdToken: vi.fn(),
  })),
}));

import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import app from "../app.js";

const makeUser = (overrides = {}) => ({
  id: "user-1",
  email: "user@example.com",
  name: "Test User",
  password: "hashed_password",
  avatarUrl: null,
  resetToken: null,
  resetTokenExpiry: null,
  ...overrides,
});

describe("POST /api/auth/login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with token and user when credentials are valid", async () => {
    const user = makeUser();
    prisma.user.findUnique.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: "validpass" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toMatchObject({ email: "user@example.com" });
    // Ensure password is NOT returned
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("returns 401 when user is not found", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "any" });

    expect(res.status).toBe(401);
  });

  it("returns 401 when password is incorrect", async () => {
    prisma.user.findUnique.mockResolvedValue(makeUser());
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: "wrongpass" });

    expect(res.status).toBe(401);
  });

  it("returns 400 when email or password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@example.com" }); // no password

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with a generic message regardless of whether the email exists", async () => {
    // Case 1: user exists
    prisma.user.findUnique.mockResolvedValueOnce(makeUser());
    prisma.user.update.mockResolvedValue({});

    const res1 = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "user@example.com" });

    expect(res1.status).toBe(200);
    expect(res1.body.message).toBeTruthy();

    prisma.user.findUnique.mockResolvedValueOnce(null);

    const res2 = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "ghost@example.com" });

    expect(res2.status).toBe(200);
    expect(res2.body.message).toBe(res1.body.message);
  });

  it("returns 400 when email field is missing", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({});

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when token or password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ token: "abc" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when token is invalid or expired", async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ token: "invalid-token", password: "newpassword123" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid|expired/i);
  });

  it("returns 200 and clears reset token on success", async () => {
    const user = makeUser({
      resetToken: "valid-token",
      resetTokenExpiry: new Date(Date.now() + 3600000),
    });
    prisma.user.findFirst.mockResolvedValue(user);
    prisma.user.update.mockResolvedValue({});

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ token: "valid-token", password: "newpassword123" });

    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          resetToken: null,
          resetTokenExpiry: null,
        }),
      }),
    );
  });
});

describe("POST /api/auth/google", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when credential is missing", async () => {
    const res = await request(app).post("/api/auth/google").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/credential/i);
  });

  it("returns 401 when Google token verification fails", async () => {
    const { OAuth2Client } = await import("google-auth-library");
    const instance = new OAuth2Client();
    instance.verifyIdToken.mockRejectedValue(new Error("Invalid token"));

    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "bad-token" });

    expect(res.status).toBe(401);
  });
});
