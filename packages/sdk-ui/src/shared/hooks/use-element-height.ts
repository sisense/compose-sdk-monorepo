import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Observes an HTML element's height via `ResizeObserver` and reports the latest
 * measured height in CSS pixels.
 *
 * Returns a callback ref to attach to the target element and the current height.
 * Height is `0` while no element is attached. The observer is re-bound when the
 * attached node changes and disconnected on unmount.
 *
 * @example
 * ```tsx
 * const { ref, height } = useElementHeight<HTMLDivElement>();
 * return <div ref={ref}>{height}px</div>;
 * ```
 * @internal
 */
export function useElementHeight<T extends HTMLElement = HTMLElement>(): {
  ref: (node: T | null) => void;
  height: number;
} {
  const [height, setHeight] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);
  const observedNodeRef = useRef<T | null>(null);

  const ref = useCallback((node: T | null) => {
    // Disconnect from a previously observed node before binding to the new one.
    if (observerRef.current && observedNodeRef.current) {
      observerRef.current.unobserve(observedNodeRef.current);
    }
    observedNodeRef.current = node;

    if (!node) {
      setHeight(0);
      return;
    }

    if (!observerRef.current) {
      observerRef.current = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        // Prefer the border-box metric (matches the seed below) so that padded or bordered
        // elements don't visibly "jump" on the first tick. Falls back to `contentRect.height`
        // (content-box) on browsers without `borderBoxSize` support.
        const borderBox = entry.borderBoxSize?.[0];
        const nextHeight = borderBox ? borderBox.blockSize : entry.contentRect.height;
        setHeight(nextHeight);
      });
    }
    observerRef.current.observe(node);
    // Seed with a synchronous read (border-box, matches the observer's `borderBoxSize`) so the
    // first paint isn't a frame behind.
    setHeight(node.offsetHeight);
  }, []);

  // Disconnect the observer on unmount.
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      observedNodeRef.current = null;
    };
  }, []);

  return { ref, height };
}
