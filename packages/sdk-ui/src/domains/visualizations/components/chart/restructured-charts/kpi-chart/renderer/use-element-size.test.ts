import { StrictMode } from 'react';

import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useElementSize } from './use-element-size';

function mockRect(element: HTMLElement, width: number, height: number) {
  Object.defineProperty(element, 'getBoundingClientRect', {
    value: () => ({
      width,
      height,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
    configurable: true,
  });
}

describe('useElementSize', () => {
  it('returns a 0x0 size when the ref has no element yet', () => {
    const ref = { current: null as HTMLDivElement | null };
    const { result } = renderHook(() => useElementSize(ref));
    expect(result.current).toEqual({ width: 0, height: 0 });
  });

  it('measures the element size on mount', () => {
    const element = document.createElement('div');
    mockRect(element, 274, 32);
    document.body.appendChild(element);

    const ref = { current: element as HTMLDivElement | null };
    const { result } = renderHook(() => useElementSize(ref));

    expect(result.current).toEqual({ width: 274, height: 32 });

    element.remove();
  });

  it('re-measures when the ResizeObserver reports a new size', () => {
    const element = document.createElement('div');
    mockRect(element, 100, 100);
    document.body.appendChild(element);

    vi.mocked(ResizeObserver).mockClear();

    const ref = { current: element as HTMLDivElement | null };
    const { result } = renderHook(() => useElementSize(ref));
    expect(result.current).toEqual({ width: 100, height: 100 });

    mockRect(element, 600, 400);
    const observerCallback = vi.mocked(ResizeObserver).mock.calls[0]?.[0];
    act(() => {
      observerCallback?.([], {} as ResizeObserver);
    });

    expect(result.current).toEqual({ width: 600, height: 400 });

    element.remove();
  });

  it('skips a state update when the ResizeObserver reports the same size', () => {
    const element = document.createElement('div');
    mockRect(element, 100, 100);
    document.body.appendChild(element);

    const ref = { current: element as HTMLDivElement | null };
    const { result, rerender } = renderHook(() => useElementSize(ref));
    const first = result.current;

    const observerCallback = vi.mocked(ResizeObserver).mock.calls[0]?.[0];
    act(() => {
      observerCallback?.([], {} as ResizeObserver);
    });
    rerender();

    // Same object reference -- no unnecessary re-render was triggered by an unchanged size.
    expect(result.current).toBe(first);

    element.remove();
  });

  it('disconnects the ResizeObserver when the hook unmounts', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    vi.mocked(ResizeObserver).mockClear();

    const ref = { current: element as HTMLDivElement | null };
    const { unmount } = renderHook(() => useElementSize(ref));

    const roInstance = vi.mocked(ResizeObserver).mock.results[0]?.value as {
      disconnect: ReturnType<typeof vi.fn>;
    };

    unmount();

    expect(roInstance.disconnect).toHaveBeenCalled();

    element.remove();
  });

  it('resets to 0x0 when the element is conditionally removed', () => {
    const element = document.createElement('div');
    mockRect(element, 200, 150);
    document.body.appendChild(element);

    const ref = { current: element as HTMLDivElement | null };
    const { result, rerender } = renderHook(() => useElementSize(ref));
    expect(result.current).toEqual({ width: 200, height: 150 });

    ref.current = null;
    rerender();

    expect(result.current).toEqual({ width: 0, height: 0 });

    element.remove();
  });

  it('survives StrictMode double-mount: still tracks resizes after the simulated unmount/remount', () => {
    // React 18 StrictMode (dev) runs mount -> simulated unmount -> remount. The simulated
    // unmount executes the hook's teardown cleanup (cancel + disconnect) WITHOUT a real
    // unmount; the remounted no-dep effect then sees an unchanged element and must resurrect
    // the observer rather than early-return -- otherwise the reported size freezes at its
    // mount value for the component's whole life (the "tiny KPI value until a resize wiggle,
    // and even the wiggle doesn't help" UAT bug, reproduced live in the demo app, which
    // renders inside <StrictMode>).
    const element = document.createElement('div');
    mockRect(element, 100, 100);
    document.body.appendChild(element);

    vi.mocked(ResizeObserver).mockClear();

    const ref = { current: element as HTMLDivElement | null };
    const { result } = renderHook(() => useElementSize(ref), { wrapper: StrictMode });
    expect(result.current).toEqual({ width: 100, height: 100 });

    // The LAST-created observer is the resurrected one; it must be live (not disconnected).
    mockRect(element, 600, 400);
    const calls = vi.mocked(ResizeObserver).mock.calls;
    const lastObserverCallback = calls[calls.length - 1]?.[0];
    act(() => {
      lastObserverCallback?.([], {} as ResizeObserver);
    });

    expect(result.current).toEqual({ width: 600, height: 400 });

    element.remove();
  });
});
