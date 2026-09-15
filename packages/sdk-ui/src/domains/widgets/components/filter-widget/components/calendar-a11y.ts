/**
 * Focus management for the date picker's calendar panel — the half of the keyboard
 * contract that has to touch the DOM, kept apart from the pure key math in
 * `calendar-keys.ts`.
 * @internal
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react';

/**
 * Moves keyboard focus onto a grid's home cell after a keyboard move re-renders the grid
 * with a new home (`data-tabstop`) — possibly on a freshly paged month. A layout effect,
 * so focus lands before the frame paints and a screen reader announces the new cell
 * rather than the old one. The ref goes on the grid's root; the cell is found by its
 * marker attribute, so the hook needs nothing else from the markup.
 * @internal
 */
export function useRovingFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const pending = useRef(false);
  const [tick, setTick] = useState(0);

  useLayoutEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    ref.current?.querySelector<HTMLElement>('[role="gridcell"][data-tabstop]')?.focus({
      preventScroll: true,
    });
  }, [tick]);

  const request = useCallback(() => {
    pending.current = true;
    setTick((value) => value + 1);
  }, []);

  return { ref, request } as const;
}

/* Whether the reader's last interaction was a key or a pointer — the one fact a popover
   needs when it closes. A keyboard close (Escape, Enter on Apply) must hand focus back to
   the field so the reader is not dropped at the top of the page; a pointer close must not,
   or the field would light up under a mouse that has moved on. Tracked once for the
   document, read by whoever closes. */
let lastModality: 'keyboard' | 'pointer' = 'pointer';
let modalityListening = false;

function listenForModality(): void {
  if (modalityListening || typeof document === 'undefined') return;
  modalityListening = true;
  document.addEventListener(
    'keydown',
    () => {
      lastModality = 'keyboard';
    },
    true,
  );
  document.addEventListener(
    'pointerdown',
    () => {
      lastModality = 'pointer';
    },
    true,
  );
}

/**
 * Hands focus back to `target` when a popover closes by keyboard and focus was on
 * something the close unmounted (the escaped grid cell, the Apply button) — otherwise the
 * browser drops it on the document body and Tab starts over from the page top. A pointer
 * close leaves focus alone.
 *
 * `suppressOnce` marks a close that drops focus on purpose, so settling the field with
 * Enter is not mistaken for focus lost to an unmounted control.
 * @internal
 */
export function useRestoreFocusOnClose(open: boolean, target: RefObject<HTMLElement | null>) {
  const wasOpen = useRef(open);
  const suppress = useRef(false);

  useEffect(() => {
    listenForModality();
  }, []);

  useEffect(() => {
    if (wasOpen.current && !open) {
      if (!suppress.current && lastModality === 'keyboard') {
        const active = document.activeElement;
        const lost = !active || active === document.body || !document.contains(active);
        if (lost) target.current?.focus({ preventScroll: true });
      }
      suppress.current = false;
    }
    wasOpen.current = open;
  }, [open, target]);

  const suppressOnce = useCallback(() => {
    suppress.current = true;
  }, []);

  return { suppressOnce } as const;
}

/**
 * Moves focus between the calendar panel's controls outside the grid — the quick chips,
 * the month arrows and the footer buttons. The panel's tab stops are read off the live
 * layout and grouped into visual rows: left/right step along a row, up/down move to the
 * nearest control in the row above or below, with the grid counting as one row entered on
 * its home cell. Inside the grid the arrows stay the grid's own, so this ignores a
 * `gridcell` — except on the grid's top and bottom edge rows, which may leave it that way.
 *
 * Returns true when it moved focus, so a nested panel can stop the event before an outer
 * one sees it.
 * @internal
 */
export function panelArrowNav(root: HTMLElement, event: ReactKeyboardEvent): boolean {
  const { key } = event;
  if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'ArrowUp' && key !== 'ArrowDown') {
    return false;
  }

  const target = event.target as HTMLElement;
  if (target.tagName === 'INPUT') return false;

  if (target.getAttribute('role') === 'gridcell') {
    const edge = target.getAttribute('data-edge') ?? '';
    const leaving =
      (key === 'ArrowDown' && edge.includes('bottom')) ||
      (key === 'ArrowUp' && edge.includes('top'));
    if (!leaving) return false;
  }

  const stops = Array.from(
    root.querySelectorAll<HTMLElement>('button, [role="gridcell"][data-tabstop]'),
  ).filter((element) => {
    if (element === target) return true;
    if (element.hasAttribute('disabled') || element.getAttribute('aria-hidden') === 'true') {
      return false;
    }
    // A grid is one stop — its home cell; the other cells belong to the grid's own arrows.
    if (
      element.getAttribute('role') === 'gridcell'
        ? !element.hasAttribute('data-tabstop')
        : element.tabIndex < 0
    ) {
      return false;
    }
    // Laid out and visible, or it is not somewhere focus can usefully go.
    return element.offsetParent !== null && getComputedStyle(element).visibility !== 'hidden';
  });
  if (!stops.includes(target)) return false;

  const box = (element: HTMLElement) => element.getBoundingClientRect();
  const sorted = [...stops].sort((a, b) => box(a).top - box(b).top || box(a).left - box(b).left);

  // Visual rows: controls whose tops sit within a few pixels of each other.
  const rows: HTMLElement[][] = [];
  sorted.forEach((element) => {
    const last = rows[rows.length - 1];
    if (last && Math.abs(box(last[0]).top - box(element).top) <= 6) last.push(element);
    else rows.push([element]);
  });

  const rowIndex = rows.findIndex((row) => row.includes(target));
  if (rowIndex < 0) return false;

  let next: HTMLElement | undefined;
  if (key === 'ArrowLeft' || key === 'ArrowRight') {
    const row = rows[rowIndex];
    next = row[row.indexOf(target) + (key === 'ArrowRight' ? 1 : -1)];
  } else {
    const other = rows[rowIndex + (key === 'ArrowDown' ? 1 : -1)];
    if (other) {
      const centre = (element: HTMLElement) => box(element).left + box(element).width / 2;
      const from = centre(target);
      next = [...other].sort((a, b) => Math.abs(centre(a) - from) - Math.abs(centre(b) - from))[0];
    }
  }
  if (!next) return false;

  event.preventDefault();
  event.stopPropagation();
  next.focus({ preventScroll: true });
  return true;
}

/**
 * Steps from a field's own input into its open calendar — onto the grid's home cell — when
 * the reader presses the down arrow, following the ARIA Authoring Practices date-picker
 * combobox pattern. Only a grid answers, so a list popover keeps the down arrow for its
 * own active-option walk.
 * @internal
 */
export function focusGridFromInput(root: HTMLElement | null, event: ReactKeyboardEvent): void {
  if (event.key !== 'ArrowDown' || !root) return;
  if ((event.target as HTMLElement).tagName !== 'INPUT') return;
  const cell = root.querySelector<HTMLElement>('[role="gridcell"][data-tabstop]');
  if (!cell) return;
  event.preventDefault();
  cell.focus({ preventScroll: true });
}
