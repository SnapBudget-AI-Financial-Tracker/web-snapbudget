import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import prisma from "../config/prisma.js";

vi.mock("../config/prisma.js", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("Auth API Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        name: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: "1",
        name: "testuser",
        email: "test@example.com",
      });

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      expect(response.body.user.name).toBe("testuser");
    });

    it("should return 400 if user already exists", async () => {
      const userData = {
        name: "existinguser",
        email: "existing@example.com",
        password: "password123",
      };

      prisma.user.findUnique.mockResolvedValue({
        id: "1",
        email: "existing@example.com",
      });

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/already exists/i);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return 401 for invalid credentials", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "wrong@example.com", password: "wrong" });

      expect(response.status).toBe(401);
    });
  });
});
