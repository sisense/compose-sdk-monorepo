import { useEffect, useLayoutEffect, useRef, useState } from 'react';

function measureLineHeight(element: HTMLElement): number | null {
  // Append probe as a child so it inherits all CSS (including custom properties
  // and line-height:normal) without copying individual style declarations.
  const probe = document.createElement('span');
  probe.setAttribute('aria-hidden', 'true');
  probe.textContent = 'A\nA';

  Object.assign(probe.style, {
    position: 'absolute',
    visibility: 'hidden',
    pointerEvents: 'none',
    whiteSpace: 'pre',
    margin: '0',
    padding: '0',
    border: '0',
  } as Partial<CSSStyleDeclaration>);

  element.appendChild(probe);
  const { height } = probe.getBoundingClientRect();
  element.removeChild(probe);

  return height > 0 ? height / 2 : null;
}

/**
 * Measures the line height of the element referenced by `ref` in pixels.
 * Re-measures on resize and after fonts load. Returns `null` until measured.
 *
 * @param ref - Ref to the element whose line height should be measured.
 * @returns The line height in pixels, or `null` if not yet measured.
 * @internal
 */
export function useLineHeight<T extends HTMLElement>(ref: React.RefObject<T | null>) {
  const [lineHeight, setLineHeight] = useState<number | null>(null);

  // Tracks the currently observed element so the no-dep effect below can skip re-setup
  // when ref.current hasn't changed between renders.
  const trackerRef = useRef<{ element: T | null; ro: ResizeObserver | null; cancelled: boolean }>({
    element: null,
    ro: null,
    cancelled: false,
  });

  // Intentionally no dependency array: ref.current is not reactive and can silently
  // transition null → element (e.g. when a loading overlay unmounts the measured node
  // and later remounts it). The guard below makes every no-op render a cheap reference
  // comparison with no DOM work. The element-equality guard also prevents the infinite
  // update loop that react-hooks/exhaustive-deps warns about: once the element is set,
  // subsequent re-renders from setLineHeight hit the early-return and make no state change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const element = ref.current;
    const tracker = trackerRef.current;

    if (element === tracker.element) return; // element unchanged — observer already running

    // Element changed (appeared, disappeared, or swapped) — tear down previous observer.
    tracker.cancelled = true;
    tracker.ro?.disconnect();
    tracker.ro = null;
    tracker.element = element;

    if (!element) {
      setLineHeight(null);
      return;
    }

    tracker.cancelled = false;

    const measure = () => {
      if (tracker.cancelled) return;
      const h = measureLineHeight(element);
      // Functional updater: React skips the render entirely when the value is unchanged,
      // preventing spurious act() warnings from the fonts.ready async callback in tests.
      if (h != null) setLineHeight((prev) => (prev === h ? prev : h));
    };

    measure();
    // Only schedule a re-measure when fonts are still loading; avoids scheduling
    // a microtask on an already-resolved Promise (which emits act() warnings in tests).
    const fonts = document.fonts;
    if (fonts && fonts.status !== 'loaded') {
      void fonts.ready.then(measure);
    }

    const ro = new ResizeObserver(measure);
    ro.observe(element);
    tracker.ro = ro;
  });

  // Disconnect on unmount. The no-dep useLayoutEffect above returns no cleanup of its own,
  // so we need a separate effect for teardown when the component is removed from the tree.
  useEffect(
    () => () => {
      trackerRef.current.cancelled = true;
      trackerRef.current.ro?.disconnect();
    },
    [],
  );

  return lineHeight;
}
