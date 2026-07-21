import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useFireOnReady } from './use-fire-on-ready.js';

describe('useFireOnReady', () => {
  it('fires immediately when isReady starts true', () => {
    const callback = vi.fn();
    renderHook(() => useFireOnReady(true, callback));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not fire when isReady starts false', () => {
    const callback = vi.fn();
    renderHook(() => useFireOnReady(false, callback));
    expect(callback).not.toHaveBeenCalled();
  });

  it('fires once on false → true transition', () => {
    const callback = vi.fn();
    let isReady = false;
    const { rerender } = renderHook(() => useFireOnReady(isReady, callback));

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      isReady = true;
    });
    rerender();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not refire while continuously ready', () => {
    const callback = vi.fn();
    const isReady = true;
    const { rerender } = renderHook(() => useFireOnReady(isReady, callback));

    expect(callback).toHaveBeenCalledTimes(1);

    rerender();
    rerender();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('fires again on each false → true cycle', () => {
    const callback = vi.fn();
    let isReady = false;
    const { rerender } = renderHook(() => useFireOnReady(isReady, callback));

    act(() => {
      isReady = true;
    });
    rerender();
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      isReady = false;
    });
    rerender();
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      isReady = true;
    });
    rerender();
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('uses the latest callback identity without extra invocations', () => {
    const first = vi.fn();
    const second = vi.fn();
    let callback: (() => void) | undefined = first;
    let isReady = true;
    const { rerender } = renderHook(() => useFireOnReady(isReady, callback));

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();

    // Swap callback while staying ready — must not refire.
    act(() => {
      callback = second;
    });
    rerender();
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();

    // Cycle through not-ready and back — new callback fires.
    act(() => {
      isReady = false;
    });
    rerender();
    act(() => {
      isReady = true;
    });
    rerender();
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledTimes(1);
  });

  it('does not throw when callback is undefined', () => {
    let isReady = false;
    const { rerender } = renderHook(() => useFireOnReady(isReady, undefined));
    expect(() => {
      act(() => {
        isReady = true;
      });
      rerender();
    }).not.toThrow();
  });
});
