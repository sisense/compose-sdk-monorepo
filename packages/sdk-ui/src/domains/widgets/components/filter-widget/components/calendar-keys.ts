/**
 * The keyboard contract the calendar grid follows — pure functions, so the rules are
 * testable without mounting a grid.
 *
 * The grid follows the ARIA Authoring Practices "grid" pattern for its roles and arrow
 * keys, with one deliberate departure: EVERY cell is in the Tab order, so Tab and
 * Shift+Tab also step from day to day. One cell is still the grid's **home**
 * (`data-tabstop`) — where a `↓` from the field and the panel arrows enter the grid, and
 * what the arrow keys move.
 *
 * 1. `←` / `→` — one day earlier / later.
 * 2. `↑` / `↓` — one week earlier / later (the same weekday).
 * 3. `Home` / `End` — the first / last day of the focused day's week.
 * 4. `PageUp` / `PageDown` — the same date one month earlier / later; with `Shift`, one
 *    year. A date the target month lacks (the 31st) clamps to its last day.
 * 5. `Enter` / `Space` — picks the focused day (the cell button's own click).
 * 6. Moving past the shown month pages the grid so the target is on screen — except `↓`
 *    on the last row and `↑` on the first, which leave the grid for the footer buttons
 *    and the month arrows respectively.
 * 7. A blocked day is stepped over in the direction of travel; when nothing pickable
 *    lies that way, focus stays put.
 * @internal
 */

/** A key the day grid handles itself. @internal */
export type GridKey =
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'Home'
  | 'End'
  | 'PageUp'
  | 'PageDown';

const GRID_KEYS: readonly string[] = [
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
];

/** Reports whether the day grid handles a key itself. @internal */
export function isGridKey(key: string): key is GridKey {
  return GRID_KEYS.includes(key);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Adds months, clamping to the target month's length (Jan 31 → Feb 28). */
function addMonthsClamped(date: Date, months: number): Date {
  const first = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return new Date(first.getFullYear(), first.getMonth(), Math.min(date.getDate(), lastDay));
}

/**
 * Resolves where a key moves focus from `day` on the day grid (rules 1-4), or null for a
 * key the grid does not handle. `direction` is the sign of travel — what rule 7 steps over
 * blocked days by.
 * @internal
 */
export function dayKeyTarget(
  key: string,
  shiftKey: boolean,
  day: Date,
  weekStartsOn: 0 | 1,
): { target: Date; direction: 1 | -1 } | null {
  switch (key) {
    case 'ArrowLeft':
      return { target: addDays(day, -1), direction: -1 };
    case 'ArrowRight':
      return { target: addDays(day, 1), direction: 1 };
    case 'ArrowUp':
      return { target: addDays(day, -7), direction: -1 };
    case 'ArrowDown':
      return { target: addDays(day, 7), direction: 1 };
    case 'Home': {
      const offset = (day.getDay() - weekStartsOn + 7) % 7;
      return { target: addDays(day, -offset), direction: -1 };
    }
    case 'End': {
      const offset = (day.getDay() - weekStartsOn + 7) % 7;
      return { target: addDays(day, 6 - offset), direction: 1 };
    }
    case 'PageUp':
      return { target: addMonthsClamped(day, shiftKey ? -12 : -1), direction: -1 };
    case 'PageDown':
      return { target: addMonthsClamped(day, shiftKey ? 12 : 1), direction: 1 };
    default:
      return null;
  }
}

/**
 * Walks from `target` in `direction` until a day `blocked` does not refuse (rule 7). The
 * walk is bounded, so a grid with nothing pickable that way returns null rather than
 * spinning.
 * @internal
 */
export function firstPickable(
  target: Date,
  direction: 1 | -1,
  blocked: (day: Date) => boolean,
): Date | null {
  let probe = target;
  for (let step = 0; step < 400; step += 1) {
    if (!blocked(probe)) return probe;
    probe = addDays(probe, direction);
  }
  return null;
}
