import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

vi.mock("../config/prisma.js", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import prisma from "../config/prisma.js";
import authMiddleware from "../middleware/authMiddleware.js";

const SECRET = process.env.JWT_SECRET || "fallback_secret";

const makeReq = (authHeader = undefined) => ({
  headers: authHeader ? { authorization: authHeader } : {},
});

const makeRes = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
};

const makeNext = () => vi.fn();

const validToken = (userId = "user-abc") =>
  jwt.sign({ userId }, SECRET, { expiresIn: "1h" });

describe("authMiddleware", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when Authorization header is missing", async () => {
    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when Authorization header has no "Bearer" prefix', async () => {
    const req = makeReq("InvalidToken abc123");
    const res = makeRes();
    const next = makeNext();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 for a malformed / garbage token", async () => {
    const req = makeReq("Bearer this.is.not.a.jwt");
    const res = makeRes();
    const next = makeNext();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 for an expired token", async () => {
    const expired = jwt.sign({ userId: "u1" }, SECRET, { expiresIn: "-1s" });
    const req = makeReq(`Bearer ${expired}`);
    const res = makeRes();
    const next = makeNext();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is valid but user does not exist in DB", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const req = makeReq(`Bearer ${validToken("ghost-user")}`);
    const res = makeRes();
    const next = makeNext();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() and sets req.user when token is valid and user exists", async () => {
    const user = {
      id: "user-abc",
      email: "test@example.com",
      name: "Test",
      avatarUrl: null,
    };
    prisma.user.findUnique.mockResolvedValue(user);

    const req = makeReq(`Bearer ${validToken("user-abc")}`);
    const res = makeRes();
    const next = makeNext();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toEqual(user);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("queries the DB with the userId from the JWT payload", async () => {
    const user = {
      id: "specific-id",
      email: "x@x.com",
      name: "X",
      avatarUrl: null,
    };
    prisma.user.findUnique.mockResolvedValue(user);

    const req = makeReq(`Bearer ${validToken("specific-id")}`);
    const res = makeRes();

    await authMiddleware(req, res, makeNext());

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "specific-id" },
      select: expect.objectContaining({ id: true, email: true }),
    });
  });
});
