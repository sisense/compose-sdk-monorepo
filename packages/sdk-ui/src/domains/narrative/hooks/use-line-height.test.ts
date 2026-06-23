import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLineHeight } from './use-line-height';

// measureLineHeight appends a two-line probe span and divides its height by 2.
// We mock getBoundingClientRect globally so JSDOM returns a meaningful value.
const PROBE_HEIGHT = 36;
const EXPECTED_LINE_HEIGHT = PROBE_HEIGHT / 2; // 18

describe('useLineHeight', () => {
  let element: HTMLDivElement;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);

    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      height: PROBE_HEIGHT,
      width: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    vi.mocked(ResizeObserver).mockClear();
  });

  afterEach(() => {
    element.remove();
    vi.restoreAllMocks();
  });

  it('returns null when the ref has no element yet', () => {
    const ref = { current: null as HTMLDivElement | null };
    const { result } = renderHook(() => useLineHeight(ref));
    expect(result.current).toBeNull();
  });

  it('measures line height immediately when the element is available on mount', async () => {
    const ref = { current: element as HTMLDivElement | null };
    const { result } = renderHook(() => useLineHeight(ref));
    // waitFor flushes the fonts.ready microtask so no act() warning is emitted.
    await waitFor(() => expect(result.current).toBe(EXPECTED_LINE_HEIGHT));
  });

  it('measures line height after the element appears in a later render (deferred mount)', async () => {
    // Regression test for the [ref]-dependency bug: the old implementation ran
    // useLayoutEffect([ref]) which never re-fired when ref.current changed from null
    // to an element because the ref *object* reference stayed the same.
    // The fix removes the dependency array so the effect re-runs on every render
    // and detects the null → element transition via an internal tracker.
    const ref = { current: null as HTMLDivElement | null };
    const { result, rerender } = renderHook(() => useLineHeight(ref));

    expect(result.current).toBeNull();

    // Element becomes available (e.g. isLoading turns false, conditional branch renders).
    ref.current = element;
    rerender();

    await waitFor(() => expect(result.current).toBe(EXPECTED_LINE_HEIGHT));
  });

  it('resets to null when the element is conditionally removed', async () => {
    const ref = { current: element as HTMLDivElement | null };
    const { result, rerender } = renderHook(() => useLineHeight(ref));
    await waitFor(() => expect(result.current).toBe(EXPECTED_LINE_HEIGHT));

    ref.current = null;
    rerender();

    await waitFor(() => expect(result.current).toBeNull());
  });

  it('disconnects the ResizeObserver when the hook unmounts', async () => {
    const ref = { current: element as HTMLDivElement | null };
    const { unmount } = renderHook(() => useLineHeight(ref));
    await waitFor(() => expect(vi.mocked(ResizeObserver).mock.results).toHaveLength(1));

    const roInstance = vi.mocked(ResizeObserver).mock.results[0]?.value as {
      disconnect: ReturnType<typeof vi.fn>;
    };

    unmount();

    expect(roInstance.disconnect).toHaveBeenCalled();
  });

  it('disconnects old and creates new ResizeObserver when the element swaps', async () => {
    const element2 = document.createElement('div');
    document.body.appendChild(element2);

    const ref = { current: element as HTMLDivElement | null };
    const { result, rerender } = renderHook(() => useLineHeight(ref));
    await waitFor(() => expect(result.current).toBe(EXPECTED_LINE_HEIGHT));

    const firstRo = vi.mocked(ResizeObserver).mock.results[0]?.value as {
      disconnect: ReturnType<typeof vi.fn>;
      observe: ReturnType<typeof vi.fn>;
    };

    ref.current = element2;
    rerender();

    await waitFor(() => expect(vi.mocked(ResizeObserver).mock.results).toHaveLength(2));

    expect(firstRo.disconnect).toHaveBeenCalled();
    const secondRo = vi.mocked(ResizeObserver).mock.results[1]?.value as {
      observe: ReturnType<typeof vi.fn>;
    };
    expect(secondRo.observe).toHaveBeenCalledWith(element2);
    expect(result.current).toBe(EXPECTED_LINE_HEIGHT);

    element2.remove();
  });
});
