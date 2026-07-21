import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * An element's border-box size, in CSS pixels (matches `getBoundingClientRect`, which this hook
 * measures with -- border- and padding-inclusive, not the content box).
 * @internal
 */
export type ElementSize = { width: number; height: number };

const ZERO_SIZE: ElementSize = { width: 0, height: 0 };

function sameSize(a: ElementSize, b: ElementSize): boolean {
  return a.width === b.width && a.height === b.height;
}

/**
 * Observes the element referenced by `ref` via `ResizeObserver` and returns its current border
 * box size (via `getBoundingClientRect`, border- and padding-inclusive), in CSS pixels. Reports
 * `{ width: 0, height: 0 }` until the element is measured, or when no element is attached.
 *
 * This hook owns the KPI renderer's element-tracker/`ResizeObserver` lifecycle pattern in one
 * place: the renderer derives the card's coarse tier from this raw size (via the pure
 * `getSizeTier`, see `use-size-tier.ts`), and other callers consume the size directly -- e.g.
 * sizing a Highcharts sparkline to its cell, or computing a non-circular height budget for an
 * auto-fit sibling (whose own border-subtraction logic, see `kpi-chart-renderer.tsx`, relies on
 * this being border-box, not content-box).
 * @param ref - Ref to the element whose size should be observed.
 * @returns The element's current border box size.
 * @internal
 */
export function useElementSize(ref: RefObject<HTMLElement | null>): ElementSize {
  const [size, setSize] = useState<ElementSize>(ZERO_SIZE);

  // Tracks the currently observed element so the no-dep effect below can skip re-setup when
  // ref.current hasn't changed between renders (mirrors useLineHeight's approach).
  const trackerRef = useRef<{
    element: HTMLElement | null;
    ro: ResizeObserver | null;
    cancelled: boolean;
  }>({
    element: null,
    ro: null,
    cancelled: false,
  });

  // Intentionally no dependency array: ref.current is not reactive and can silently transition
  // null -> element across renders. The element-equality guard makes every no-op render a cheap
  // reference comparison with no DOM work.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const element = ref.current;
    const tracker = trackerRef.current;

    // Skip re-setup only while the tracker is HEALTHY for the current element. A same-element
    // but cancelled tracker means the unmount-effect cleanup below ran without a real unmount
    // -- exactly React 18 StrictMode's simulated unmount/remount in dev -- and the observer
    // must be resurrected here, or the reported size freezes at its pre-poisoning value for
    // the component's whole life (no resize would ever be delivered again).
    if (element === tracker.element && (!element || !tracker.cancelled)) return;

    // Tear down whatever observer the previous element (or the pre-poisoning run) had.
    tracker.cancelled = true;
    tracker.ro?.disconnect();
    tracker.ro = null;
    tracker.element = element;

    if (!element) {
      setSize((prev) => (sameSize(prev, ZERO_SIZE) ? prev : ZERO_SIZE));
      return;
    }

    tracker.cancelled = false;

    const measure = () => {
      if (tracker.cancelled) return;
      const { width, height } = element.getBoundingClientRect();
      const next = { width, height };
      setSize((prev) => (sameSize(prev, next) ? prev : next));
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(element);
    tracker.ro = ro;
  });

  // Disconnect on unmount. The no-dep useLayoutEffect above returns no cleanup of its own, so a
  // separate effect handles teardown when the component is removed from the tree.
  useEffect(
    () => () => {
      trackerRef.current.cancelled = true;
      trackerRef.current.ro?.disconnect();
    },
    [],
  );

  return size;
}
