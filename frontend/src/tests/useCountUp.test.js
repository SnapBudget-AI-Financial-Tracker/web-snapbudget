/**
 * Tests for useCountUp hook
 *
 * Validates: Requirements 7.2, 12.1
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useCountUp from '../hooks/useCountUp';

// Mock useReducedMotion so we can control it per test
vi.mock('../hooks/useReducedMotion', () => ({
  default: vi.fn(),
}));

import useReducedMotion from '../hooks/useReducedMotion';

describe('useCountUp', () => {
  let rafCallbacks = [];
  let originalRaf;
  let originalCaf;

  beforeEach(() => {
    rafCallbacks = [];
    originalRaf = global.requestAnimationFrame;
    originalCaf = global.cancelAnimationFrame;

    // Capture rAF callbacks without auto-running them
    global.requestAnimationFrame = vi.fn((cb) => {
      const id = rafCallbacks.length;
      rafCallbacks.push(cb);
      return id;
    });
    global.cancelAnimationFrame = vi.fn((id) => {
      rafCallbacks[id] = null;
    });

    // Default: no reduced motion
    useReducedMotion.mockReturnValue(false);
  });

  afterEach(() => {
    global.requestAnimationFrame = originalRaf;
    global.cancelAnimationFrame = originalCaf;
    vi.restoreAllMocks();
  });

  /**
   * Helper: flush all pending rAF callbacks with a given timestamp.
   */
  function flushRaf(timestamp) {
    const pending = [...rafCallbacks];
    rafCallbacks = [];
    pending.forEach((cb) => cb && cb(timestamp));
  }

  it('starts at 0 when reduced motion is off', () => {
    const { result } = renderHook(() => useCountUp(100, 1000));
    // Before any rAF fires, count should be 0
    expect(result.current).toBe(0);
  });

  it('returns target immediately when useReducedMotion is true', () => {
    useReducedMotion.mockReturnValue(true);
    const { result } = renderHook(() => useCountUp(500, 1000));
    expect(result.current).toBe(500);
  });

  it('reaches target value after full duration', () => {
    const { result } = renderHook(() => useCountUp(100, 1000));

    act(() => {
      // First frame sets startTime
      flushRaf(0);
      // Second frame at full duration → progress = 1
      flushRaf(1000);
    });

    expect(result.current).toBe(100);
  });

  it('animates to an intermediate value mid-duration', () => {
    const { result } = renderHook(() => useCountUp(100, 1000));

    act(() => {
      flushRaf(0);       // sets startTime = 0
      flushRaf(500);     // 50% through duration
    });

    // Cubic ease-out at progress=0.5: 1 - (0.5)^3 = 0.875 → round(87.5) = 88
    expect(result.current).toBeGreaterThan(0);
    expect(result.current).toBeLessThan(100);
  });

  it('never exceeds target value', () => {
    const { result } = renderHook(() => useCountUp(50, 1000));

    act(() => {
      flushRaf(0);
      flushRaf(2000); // way past duration
    });

    expect(result.current).toBeLessThanOrEqual(50);
  });

  it('restarts animation when target changes', () => {
    const { result, rerender } = renderHook(
      ({ target }) => useCountUp(target, 1000),
      { initialProps: { target: 100 } }
    );

    act(() => {
      flushRaf(0);
      flushRaf(1000);
    });
    expect(result.current).toBe(100);

    // Change target
    rerender({ target: 200 });

    act(() => {
      flushRaf(1001);  // new startTime
      flushRaf(2001);  // full duration from new start
    });

    expect(result.current).toBe(200);
  });

  it('cancels animation on unmount', () => {
    const { unmount } = renderHook(() => useCountUp(100, 1000));

    act(() => {
      flushRaf(0);
    });

    unmount();

    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('handles target = 0 without animation', () => {
    const { result } = renderHook(() => useCountUp(0, 1000));

    act(() => {
      flushRaf(0);
      flushRaf(1000);
    });

    expect(result.current).toBe(0);
  });
});
