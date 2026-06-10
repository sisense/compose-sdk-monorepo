/** @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react';

import { useElementHeight } from './use-element-height.js';

type ResizeObserverCallback = (
  entries: ReadonlyArray<{
    contentRect: DOMRectReadOnly;
    borderBoxSize?: ReadonlyArray<{ blockSize: number; inlineSize: number }>;
  }>,
) => void;

describe('useElementHeight', () => {
  let observedNodes: Element[];
  let observerCallback: ResizeObserverCallback | null;

  beforeEach(() => {
    observedNodes = [];
    observerCallback = null;

    class FakeResizeObserver {
      constructor(cb: ResizeObserverCallback) {
        observerCallback = cb;
      }

      observe(node: Element) {
        observedNodes.push(node);
      }

      unobserve(node: Element) {
        observedNodes = observedNodes.filter((n) => n !== node);
      }

      disconnect() {
        observedNodes = [];
        observerCallback = null;
      }
    }

    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts at 0 when no node is attached', () => {
    const { result } = renderHook(() => useElementHeight<HTMLDivElement>());

    expect(result.current.height).toBe(0);
  });

  it('seeds height from offsetHeight when a node is attached', () => {
    const { result } = renderHook(() => useElementHeight<HTMLDivElement>());

    const node = document.createElement('div');
    Object.defineProperty(node, 'offsetHeight', { configurable: true, value: 42 });

    act(() => {
      result.current.ref(node);
    });

    expect(result.current.height).toBe(42);
    expect(observedNodes).toEqual([node]);
  });

  it('updates height when the observer reports a new size (content-box fallback)', () => {
    const { result } = renderHook(() => useElementHeight<HTMLDivElement>());

    const node = document.createElement('div');
    act(() => {
      result.current.ref(node);
    });

    act(() => {
      observerCallback?.([{ contentRect: { height: 64 } as DOMRectReadOnly }]);
    });

    expect(result.current.height).toBe(64);
  });

  it('prefers `borderBoxSize.blockSize` when the observer entry provides it', () => {
    const { result } = renderHook(() => useElementHeight<HTMLDivElement>());

    const node = document.createElement('div');
    act(() => {
      result.current.ref(node);
    });

    act(() => {
      observerCallback?.([
        {
          // borderBoxSize wins — contentRect would have caused a jump for a padded element.
          borderBoxSize: [{ blockSize: 80, inlineSize: 200 }],
          contentRect: { height: 64 } as DOMRectReadOnly,
        },
      ]);
    });

    expect(result.current.height).toBe(80);
  });

  it('reports 0 when blockSize is 0, even if inlineSize is non-zero (regression: SNS-128141)', () => {
    // The wrapper around the drilldown breadcrumbs is empty (block-axis = 0) but stretches
    // to the widget width along the inline-axis. A previous `|| inlineSize` fallback would
    // have erroneously returned the widget's width as its height, causing the auto-height
    // calc to inflate by ~the widget's width on every layout pass.
    const { result } = renderHook(() => useElementHeight<HTMLDivElement>());

    const node = document.createElement('div');
    act(() => {
      result.current.ref(node);
    });

    act(() => {
      observerCallback?.([
        {
          borderBoxSize: [{ blockSize: 0, inlineSize: 800 }],
          contentRect: { height: 0 } as DOMRectReadOnly,
        },
      ]);
    });

    expect(result.current.height).toBe(0);
  });

  it('resets to 0 and unobserves when the node detaches', () => {
    const { result } = renderHook(() => useElementHeight<HTMLDivElement>());

    const node = document.createElement('div');
    Object.defineProperty(node, 'offsetHeight', { configurable: true, value: 30 });

    act(() => {
      result.current.ref(node);
    });
    expect(result.current.height).toBe(30);

    act(() => {
      result.current.ref(null);
    });

    expect(result.current.height).toBe(0);
    expect(observedNodes).toEqual([]);
  });
});
