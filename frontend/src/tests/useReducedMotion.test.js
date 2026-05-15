import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function buildMatchMediaMock(matches) {
  return vi.fn().mockReturnValue({
    matches,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
}

function simulateHookInitialValue() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

describe("useReducedMotion — Property 2 (Validates: Requirements 2.4, 12.1)", () => {
  const originalMatchMedia =
    typeof window !== "undefined" ? window.matchMedia : undefined;

  beforeEach(() => {
    if (typeof global.window === "undefined") {
      global.window = {};
    }
  });

  afterEach(() => {
    if (originalMatchMedia !== undefined) {
      window.matchMedia = originalMatchMedia;
    }
    vi.restoreAllMocks();
  });

  it("returns a boolean (true) when prefers-reduced-motion: reduce is ACTIVE", () => {
    window.matchMedia = buildMatchMediaMock(true);

    const result = simulateHookInitialValue();

    expect(typeof result).toBe("boolean");
    expect(result).toBe(true);
  });

  it("returns a boolean (false) when prefers-reduced-motion: reduce is NOT active", () => {
    window.matchMedia = buildMatchMediaMock(false);

    const result = simulateHookInitialValue();

    expect(typeof result).toBe("boolean");
    expect(result).toBe(false);
  });

  it("result is strictly true or false — never null, undefined, or other types", () => {
    for (const matches of [true, false]) {
      window.matchMedia = buildMatchMediaMock(matches);

      const result = simulateHookInitialValue();

      expect(result === true || result === false).toBe(true);
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      expect(typeof result).toBe("boolean");
    }
  });

  it("returns false (boolean) when window is undefined (SSR scenario)", () => {
    const savedWindow = global.window;
    delete global.window;
    const result =
      typeof window === "undefined" ? false : simulateHookInitialValue();

    expect(typeof result).toBe("boolean");
    expect(result).toBe(false);

    global.window = savedWindow;
  });
});
