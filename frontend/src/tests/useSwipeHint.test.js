import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSwipeHint } from "../hooks/useSwipeHint.js";

const STORAGE_KEY = "snapbudget_swipe_hint_seen";

describe("useSwipeHint", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it("showHint starts as false before the timer fires", () => {
    const { result } = renderHook(() => useSwipeHint());
    // Timer hasn't fired yet
    expect(result.current[0]).toBe(false);
  });

  it("showHint becomes true after 1200ms when key is not in localStorage", () => {
    const { result } = renderHook(() => useSwipeHint());

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(result.current[0]).toBe(true);
  });

  it("showHint stays false after 1200ms when the key IS already set", () => {
    localStorage.setItem(STORAGE_KEY, "true");
    const { result } = renderHook(() => useSwipeHint());

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(result.current[0]).toBe(false);
  });

  it("markSeen() sets showHint back to false", () => {
    const { result } = renderHook(() => useSwipeHint());

    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1]();
    });

    expect(result.current[0]).toBe(false);
  });

  it("accepts a custom storage key", () => {
    const CUSTOM_KEY = "custom_hint_key";
    const { result } = renderHook(() => useSwipeHint(CUSTOM_KEY));

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(result.current[0]).toBe(true);
  });
});
