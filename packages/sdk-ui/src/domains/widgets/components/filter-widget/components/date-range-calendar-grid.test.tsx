import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DateRangeCalendarGrid } from './date-range-calendar-grid.js';
import type { DateRangePickResult, DateRangeValue } from './date-range-calendar-grid.js';
import { DEFAULT_DATE_MASK } from './date-text.js';
import type { RangeEnd } from './range-date.js';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en-US' } }),
  };
});

/** Pinned so the pair renders September / October 2026 whenever the suite runs. */
const TODAY = new Date(2026, 8, 15);
const EARLIEST = new Date(2026, 8, 10);
const LATEST = new Date(2026, 9, 20);

const EMPTY: DateRangeValue = { from: null, to: null };

const setup = (props: Partial<{ value: DateRangeValue; activeEnd: RangeEnd }> = {}) => {
  const onPick = vi.fn();
  render(
    <DateRangeCalendarGrid
      today={TODAY}
      earliestData={EARLIEST}
      latestData={LATEST}
      value={props.value ?? EMPTY}
      activeEnd={props.activeEnd ?? 'from'}
      onPick={onPick}
      mask={DEFAULT_DATE_MASK}
    />,
  );
  return { onPick };
};

const dayCell = (side: 'left' | 'right', day: number, month: number, year = 2026) => {
  const grid = screen.getByTestId(`filter-widget-date-range-grid-${side}`);
  return within(grid).getByRole('gridcell', {
    name: new Date(year, month, day).toLocaleDateString('en-US', { dateStyle: 'long' }),
  });
};

/** The single `DateRangePickResult` argument of the most recent `onPick` call. */
const lastPick = (onPick: ReturnType<typeof vi.fn>): DateRangePickResult => {
  const [result] = onPick.mock.calls[onPick.mock.calls.length - 1] as [DateRangePickResult];
  return result;
};

describe('DateRangeCalendarGrid — two consecutive months', () => {
  it('shows the value month on the left and the month after it on the right', () => {
    setup();

    expect(screen.getByTestId('filter-widget-date-range-label-left')).toHaveTextContent('Sep 2026');
    expect(screen.getByTestId('filter-widget-date-range-label-right')).toHaveTextContent(
      'Oct 2026',
    );
  });
});

describe('DateRangeCalendarGrid — year navigation (Calendar-grid parity)', () => {
  it('pages the whole pair back/forward a year from the outer prev/next-year buttons', async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByTestId('filter-widget-date-range-prev-year-left'));
    expect(screen.getByTestId('filter-widget-date-range-label-left')).toHaveTextContent('Sep 2025');
    expect(screen.getByTestId('filter-widget-date-range-label-right')).toHaveTextContent(
      'Oct 2025',
    );

    await user.click(screen.getByTestId('filter-widget-date-range-next-year-right'));
    // Back to the original pair, then one year on.
    expect(screen.getByTestId('filter-widget-date-range-label-left')).toHaveTextContent('Sep 2026');
    expect(screen.getByTestId('filter-widget-date-range-label-right')).toHaveTextContent(
      'Oct 2026',
    );
  });

  it('hides the inner year buttons — prev-year on the right grid, next-year on the left', () => {
    setup();

    expect(screen.getByTestId('filter-widget-date-range-prev-year-right')).toBeDisabled();
    expect(screen.getByTestId('filter-widget-date-range-next-year-left')).toBeDisabled();
    expect(screen.getByTestId('filter-widget-date-range-prev-year-left')).not.toBeDisabled();
    expect(screen.getByTestId('filter-widget-date-range-next-year-right')).not.toBeDisabled();
  });
});

describe('DateRangeCalendarGrid — hand-off', () => {
  it('a pick on an empty pair fills the active end and hands off to the other', async () => {
    const user = userEvent.setup();
    const { onPick } = setup({ activeEnd: 'from' });

    await user.click(dayCell('left', 12, 8));

    const result = lastPick(onPick);
    expect(result.value.from).toEqual(new Date(2026, 8, 12));
    expect(result.value.to).toBeNull();
    expect(result.nextActiveEnd).toBe('to');
    expect(result.reordered).toBe(false);
  });

  it('Earliest/Today/Latest fill their own end and hand off like an ordinary pick', async () => {
    const user = userEvent.setup();
    const { onPick } = setup({ activeEnd: 'from' });

    await user.click(screen.getByTestId('filter-widget-date-range-earliest'));

    const result = lastPick(onPick);
    expect(result.value.from).toEqual(EARLIEST);
    expect(result.nextActiveEnd).toBe('to');
  });

  /* CodeRabbit review finding: Earliest/Latest are pinned to From/To — not `activeEnd` — so
     clicking "Earliest date" while To is the active field (e.g. the reader clicked into To
     first) must still fill From, not overwrite whatever To already held. Only Today follows
     the active field. The test above alone couldn't catch a regression here: it always left
     `activeEnd` at its default, 'from', which happens to already agree with Earliest's own
     fixed target. */
  it('Earliest still fills From (not To) when To is the active field', async () => {
    const user = userEvent.setup();
    const { onPick } = setup({ activeEnd: 'to' });

    await user.click(screen.getByTestId('filter-widget-date-range-earliest'));

    const result = lastPick(onPick);
    expect(result.value.from).toEqual(EARLIEST);
    expect(result.value.to).toBeNull();
  });

  it('Latest still fills To (not From) when From is the active field', async () => {
    const user = userEvent.setup();
    const { onPick } = setup({ activeEnd: 'from' });

    await user.click(screen.getByTestId('filter-widget-date-range-latest'));

    const result = lastPick(onPick);
    expect(result.value.to).toEqual(LATEST);
    expect(result.value.from).toBeNull();
  });

  it('Today follows the active field — To, when To is active', async () => {
    const user = userEvent.setup();
    const { onPick } = setup({ activeEnd: 'to' });

    await user.click(screen.getByTestId('filter-widget-date-range-today'));

    const result = lastPick(onPick);
    expect(result.value.to).toEqual(TODAY);
    expect(result.value.from).toBeNull();
  });
});

describe('DateRangeCalendarGrid — editing an applied range', () => {
  it('a pick replaces only the active end; the other end is unchanged', async () => {
    const user = userEvent.setup();
    const applied: DateRangeValue = {
      from: new Date(2026, 8, 5),
      to: new Date(2026, 8, 25),
    };
    const { onPick } = setup({ value: applied, activeEnd: 'to' });

    await user.click(dayCell('left', 20, 8));

    const result = lastPick(onPick);
    expect(result.value.from).toEqual(applied.from);
    expect(result.value.to).toEqual(new Date(2026, 8, 20));
  });
});

describe('DateRangeCalendarGrid — reversed range only swaps on a pick', () => {
  it('picking a To before the applied From swaps the ends and keeps both, reporting reordered', async () => {
    const user = userEvent.setup();
    const applied: DateRangeValue = {
      from: new Date(2026, 8, 20),
      to: null,
    };
    const { onPick } = setup({ value: applied, activeEnd: 'to' });

    // Picking an earlier day while filling "to" would invert the pair — the grid must swap.
    await user.click(dayCell('left', 5, 8));

    const result = lastPick(onPick);
    expect(result.value.from).toEqual(new Date(2026, 8, 5));
    expect(result.value.to).toEqual(new Date(2026, 8, 20));
    expect(result.reordered).toBe(true);
    // The hand-off direction also flips with the reorder, so the caret still lands on the
    // end that is still "to reconsider" rather than jumping back to From.
    expect(result.nextActiveEnd).toBe('to');
  });
});

describe('DateRangeCalendarGrid — cropped months, no cross-month spillover (product direction, 2026-09-22)', () => {
  it("blanks a leading week's days from the neighbouring month instead of drawing them", () => {
    setup();

    // Sep 2026's first row: Sun Aug 30, Mon Aug 31 (outside — blanked), Tue Sep 1 onward.
    const grid = screen.getByTestId('filter-widget-date-range-grid-left');
    const [aug30, aug31, sep1] = within(grid).getAllByTestId('filter-widget-date-range-day');

    expect(aug30).toHaveAttribute('aria-hidden', 'true');
    expect(aug30).toHaveAttribute('tabindex', '-1');
    expect(getComputedStyle(aug30)).toHaveProperty('visibility', 'hidden');

    expect(aug31).toHaveAttribute('aria-hidden', 'true');
    expect(getComputedStyle(aug31)).toHaveProperty('visibility', 'hidden');

    expect(sep1).not.toHaveAttribute('aria-hidden');
    expect(sep1).toHaveAttribute('tabindex', '0');
    expect(getComputedStyle(sep1)).toHaveProperty('visibility', 'visible');
  });

  it('a blanked spillover cell never dispatches a pick, even clicked directly', () => {
    const { onPick } = setup();

    const grid = screen.getByTestId('filter-widget-date-range-grid-left');
    const [aug30] = within(grid).getAllByTestId('filter-widget-date-range-day');

    fireEvent.click(aug30);

    expect(onPick).not.toHaveBeenCalled();
  });
});

describe('DateRangeCalendarGrid — out-of-span days', () => {
  it('marks days outside the earliest/latest window but leaves them pickable', async () => {
    const user = userEvent.setup();
    const { onPick } = setup({ activeEnd: 'from' });

    const outside = dayCell('left', 1, 8); // Sep 1 — before EARLIEST (Sep 10)
    expect(outside).toHaveAttribute('data-beyond-data');
    expect(outside).not.toBeDisabled();

    await user.click(outside);
    expect(lastPick(onPick).value.from).toEqual(new Date(2026, 8, 1));
  });
});

describe('DateRangeCalendarGrid — range readout (prototype parity)', () => {
  it("echoes the data's own earliest/latest bound, greyed, before either end is picked", () => {
    setup();

    const readout = screen.getByTestId('filter-widget-date-range-readout');
    expect(readout).toHaveTextContent('09/10/2026');
    expect(readout).toHaveTextContent('10/20/2026');
    expect(within(readout).getByText('09/10/2026')).toHaveAttribute('data-missing');
    expect(within(readout).getByText('10/20/2026')).toHaveAttribute('data-missing');
  });

  it('swaps in the picked date for whichever end is now set, dropping the greyed bound', () => {
    setup({ value: { from: new Date(2026, 8, 12), to: null } });

    const readout = screen.getByTestId('filter-widget-date-range-readout');
    expect(within(readout).getByText('09/12/2026')).not.toHaveAttribute('data-missing');
    // To is still unset — the readout still echoes the latest bound, greyed.
    expect(within(readout).getByText('10/20/2026')).toHaveAttribute('data-missing');
  });

  it('shows both picked dates, ungreyed, once the pair is complete', () => {
    setup({ value: { from: new Date(2026, 8, 12), to: new Date(2026, 9, 5) } });

    const readout = screen.getByTestId('filter-widget-date-range-readout');
    expect(readout).toHaveTextContent('09/12/2026 – 10/05/2026');
    // Nothing left greyed — not either end's date, and not the dash between them.
    expect(readout.querySelectorAll('[data-missing]')).toHaveLength(0);
  });
});

describe('DateRangeCalendarGrid — keyboard paging bridges more than one month', () => {
  /* CodeRabbit review finding: PageDown from a day in the right grid (Oct) lands two
     months past the left grid (Sep → Nov), so neither pane shows it. The old paging check
     compared the target against the right grid's OWN rendered window (`weeks[0][0]`) rather
     than the pair itself, so it left the pair on Sep/Oct and asked the left grid's roving
     focus for a day it had never rendered — `homeDay` fell back to some other cell instead
     of the target. */
  it('PageDown from the right grid pages the pair forward and focuses the target in the new right grid', async () => {
    const user = userEvent.setup();
    setup();

    // A raw DOM focus, not fireEvent.focus (which dispatches the event without moving
    // document.activeElement) — user.keyboard targets whatever is really focused.
    act(() => dayCell('right', 15, 9).focus()); // Oct 15
    await user.keyboard('{PageDown}');

    expect(screen.getByTestId('filter-widget-date-range-label-left')).toHaveTextContent('Oct 2026');
    expect(screen.getByTestId('filter-widget-date-range-label-right')).toHaveTextContent(
      'Nov 2026',
    );
    expect(document.activeElement).toHaveAttribute(
      'aria-label',
      new Date(2026, 10, 15).toLocaleDateString('en-US', { dateStyle: 'long' }),
    );
  });

  it('PageUp from the left grid pages the pair backward and focuses the target in the new left grid', async () => {
    const user = userEvent.setup();
    setup();

    act(() => dayCell('left', 15, 8).focus()); // Sep 15
    await user.keyboard('{PageUp}');

    expect(screen.getByTestId('filter-widget-date-range-label-left')).toHaveTextContent('Aug 2026');
    expect(screen.getByTestId('filter-widget-date-range-label-right')).toHaveTextContent(
      'Sep 2026',
    );
    expect(document.activeElement).toHaveAttribute(
      'aria-label',
      new Date(2026, 7, 15).toLocaleDateString('en-US', { dateStyle: 'long' }),
    );
  });
});

describe('DateRangeCalendarGrid — hover preview follows the pointer (prototype parity)', () => {
  const previewed = () =>
    screen
      .getAllByTestId('filter-widget-date-range-day')
      .filter((cell) => cell.hasAttribute('data-preview'))
      .map((cell) => cell.textContent);

  it('bands from the fixed From to the day under the pointer while To is being picked', async () => {
    const user = userEvent.setup();
    setup({ value: { from: new Date(2026, 8, 20), to: null }, activeEnd: 'to' });

    await user.hover(dayCell('left', 23, 8));
    expect(previewed()).toEqual(['20', '21', '22', '23']);

    // The band follows the pointer, across the seam into the right month too.
    await user.hover(dayCell('right', 2, 9));
    expect(previewed()).toEqual([
      ...['20', '21', '22', '23', '24', '25'],
      ...['26', '27', '28', '29', '30'],
      '01',
      '02',
    ]);
  });

  it('moves the edited end of an applied range, leaving the other end as the anchor', async () => {
    const user = userEvent.setup();
    setup({ value: { from: new Date(2026, 8, 10), to: new Date(2026, 8, 20) }, activeEnd: 'from' });

    await user.hover(dayCell('left', 17, 8));
    expect(previewed()).toEqual(['17', '18', '19', '20']);
    // A previewed day is not selected — only the committed range is.
    expect(dayCell('left', 12, 8)).toHaveAttribute('aria-selected', 'true');
    expect(dayCell('left', 12, 8)).not.toHaveAttribute('data-preview');
  });

  it('keeps the committed band while the pointer rests on the anchor, and drops the preview on leave', async () => {
    const user = userEvent.setup();
    setup({ value: { from: new Date(2026, 8, 10), to: new Date(2026, 8, 20) }, activeEnd: 'to' });

    await user.hover(dayCell('left', 10, 8));
    expect(previewed()).toEqual([]);
    expect(dayCell('left', 15, 8)).toHaveAttribute('aria-selected', 'true');

    await user.hover(dayCell('left', 25, 8));
    expect(previewed()).toHaveLength(16);
    await user.unhover(dayCell('left', 25, 8));
    expect(previewed()).toEqual([]);
  });

  it('drops the preview when the pair is paged, though the pointer never left it', () => {
    setup({ value: { from: new Date(2026, 8, 10), to: null }, activeEnd: 'to' });

    // A day in the right month: after paging forward that month is on the left, so a
    // stale preview would still paint Oct 1–15 there. `fireEvent`, not `user.hover`:
    // in jsdom user-event's pointer move to the arrow reports no `relatedTarget`, which
    // React reads as leaving the window — it would clear the preview by itself and hide
    // exactly the case a real pointer hits (it stays inside the pair, no leave fires).
    fireEvent.mouseEnter(dayCell('right', 15, 9));
    expect(previewed()).toContain('15');

    fireEvent.click(screen.getByTestId('filter-widget-date-range-next-right'));

    expect(screen.getByTestId('filter-widget-date-range-label-left')).toHaveTextContent('Oct 2026');
    expect(previewed()).toEqual([]);
  });
});

describe('DateRangeCalendarGrid — band rounds at the month edge, not the week edge', () => {
  /** `TL TR BR BL` — the band cell's one radius shorthand, split into its four corners. */
  const corners = (cell: HTMLElement) => getComputedStyle(cell).borderRadius.split(/ (?![^(]*\))/);
  const ROUND = 'calc(36px / 2)';

  it("rounds a month's first and last day when the band crosses the seam mid-week", () => {
    // Sep 30 2026 is a Wednesday, Oct 1 a Thursday — both mid-week.
    setup({ value: { from: new Date(2026, 8, 10), to: new Date(2026, 9, 20) }, activeEnd: 'to' });

    // Last banded day of September: square on the left, round on the right.
    expect(corners(dayCell('left', 30, 8))).toEqual(['0', ROUND, ROUND, '0']);
    // First banded day of October: round on the left, square on the right.
    expect(corners(dayCell('right', 1, 9))).toEqual([ROUND, '0', '0', ROUND]);
    // A day mid-row keeps square corners on both sides.
    expect(corners(dayCell('right', 6, 9))).toEqual(['0', '0', '0', '0']);
  });
});
