import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../services/api.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "../services/api.js";
import authService from "../services/authService.js";

const fakeToken = "jwt.header.signature";
const fakeUser = { id: "user-1", email: "user@example.com", name: "Test User" };

describe("authService.login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("stores token and user in localStorage on successful login", async () => {
    api.post.mockResolvedValue({ data: { token: fakeToken, user: fakeUser } });

    await authService.login({
      email: "user@example.com",
      password: "password123",
    });

    expect(localStorage.getItem("token")).toBe(fakeToken);
    const stored = JSON.parse(localStorage.getItem("user"));
    expect(stored).toMatchObject({ email: "user@example.com" });
  });

  it("returns the full response data on success", async () => {
    api.post.mockResolvedValue({ data: { token: fakeToken, user: fakeUser } });

    const result = await authService.login({
      email: "user@example.com",
      password: "pass",
    });
    expect(result).toMatchObject({ token: fakeToken, user: fakeUser });
  });

  it("calls POST /auth/login with the credentials object", async () => {
    api.post.mockResolvedValue({ data: { token: fakeToken, user: fakeUser } });
    const creds = { email: "user@example.com", password: "pass" };

    await authService.login(creds);

    expect(api.post).toHaveBeenCalledWith("/auth/login", creds);
  });

  it("throws and does NOT persist anything when login fails (401)", async () => {
    const err = Object.assign(new Error("Unauthorized"), {
      response: { status: 401 },
    });
    api.post.mockRejectedValue(err);

    await expect(
      authService.login({ email: "x@y.com", password: "bad" }),
    ).rejects.toThrow();
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});

describe("authService.logout", () => {
  beforeEach(() => {
    localStorage.setItem("token", fakeToken);
    localStorage.setItem("user", JSON.stringify(fakeUser));
  });
  afterEach(() => localStorage.clear());

  it("removes token and user from localStorage", () => {
    authService.logout();

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});

describe("authService.register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("POSTs to /auth/register and returns response data", async () => {
    api.post.mockResolvedValue({ data: { token: fakeToken, user: fakeUser } });
    const userData = {
      name: "Test User",
      email: "user@example.com",
      password: "pass123",
    };

    const result = await authService.register(userData);

    expect(api.post).toHaveBeenCalledWith("/auth/register", userData);
    expect(result).toMatchObject({ user: fakeUser });
  });

  it("persists token and user in localStorage after registration", async () => {
    api.post.mockResolvedValue({ data: { token: fakeToken, user: fakeUser } });

    await authService.register({
      name: "Test",
      email: "test@ex.com",
      password: "p",
    });

    expect(localStorage.getItem("token")).toBe(fakeToken);
    expect(JSON.parse(localStorage.getItem("user"))).toMatchObject({
      id: "user-1",
    });
  });

  it("propagates 409 Conflict when email is already taken", async () => {
    const err = Object.assign(new Error("Conflict"), {
      response: { status: 409 },
    });
    api.post.mockRejectedValue(err);

    await expect(
      authService.register({ email: "dup@ex.com", password: "p" }),
    ).rejects.toMatchObject({
      response: { status: 409 },
    });
  });
});

describe("authService.getCurrentUser", () => {
  afterEach(() => localStorage.clear());

  it("returns the parsed user object when user is in localStorage", () => {
    localStorage.setItem("user", JSON.stringify(fakeUser));
    const result = authService.getCurrentUser();
    expect(result).toMatchObject({ id: "user-1", email: "user@example.com" });
  });

  it("returns null when no user is stored", () => {
    expect(authService.getCurrentUser()).toBeNull();
  });
});

describe("authService.updateCurrentUser", () => {
  afterEach(() => localStorage.clear());

  it("serializes and stores updated user in localStorage", () => {
    const updated = { ...fakeUser, name: "Updated Name" };
    authService.updateCurrentUser(updated);
    expect(JSON.parse(localStorage.getItem("user"))).toMatchObject({
      name: "Updated Name",
    });
  });
});
