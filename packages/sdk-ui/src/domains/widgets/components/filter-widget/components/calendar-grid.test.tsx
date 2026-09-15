import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CalendarGrid } from './calendar-grid';
import type { CalendarGridProps } from './calendar-grid';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en-US' } }),
  };
});

/** Pinned so the grid renders September 2026 whenever the suite runs. */
const TODAY = new Date(2026, 8, 15);
const EARLIEST = new Date(2026, 8, 10);
const LATEST = new Date(2026, 8, 20);

const bounds = { today: TODAY, earliestData: EARLIEST, latestData: LATEST };

/* `mode` discriminates the props, so each shape gets its own helper rather than one taking
   a widened `mode` that fits neither arm. `mode` is set after the overrides so a caller
   cannot switch the shape out from under the types. */
type SingleProps = Extract<CalendarGridProps, { mode: 'single' }>;
type MultiProps = Extract<CalendarGridProps, { mode: 'multi' }>;

const setup = (props: Partial<SingleProps> = {}) => {
  const onChange = vi.fn();
  render(<CalendarGrid {...bounds} onChange={onChange} {...props} mode="single" />);
  return { onChange };
};

const setupMulti = (props: Partial<MultiProps> = {}) => {
  const onChange = vi.fn();
  render(<CalendarGrid {...bounds} onChange={onChange} {...props} mode="multi" />);
  return { onChange };
};

/** A day cell of the shown month, found by its accessible name. */
const dayCell = (day: number, month = 8, year = 2026) => {
  const grid = screen.getByTestId('filter-widget-calendar-grid');
  return within(grid).getByRole('gridcell', {
    name: new Date(year, month, day).toLocaleDateString('en-US', { dateStyle: 'long' }),
  });
};

describe('CalendarGrid — day availability', () => {
  /* AC-23: days the data covers are visually distinguishable from days beyond it, and both
     remain selectable. "Beyond" is outside the earliest/latest window. */
  /* Asserted through the marker the cell carries rather than its opacity: the number is a
     design token, and a change to it should not read as a behaviour regression. */
  it('marks the days beyond the data window and leaves those inside unmarked', () => {
    setup();

    expect(dayCell(15)).not.toHaveAttribute('data-beyond-data');
    expect(dayCell(5)).toHaveAttribute('data-beyond-data');
    expect(dayCell(25)).toHaveAttribute('data-beyond-data');
  });

  /* The marker and the dimming have to agree, so one test still pins them together. */
  it('dims exactly the days it marks', () => {
    setup();

    expect(getComputedStyle(dayCell(15)).opacity).toBe('1');
    expect(getComputedStyle(dayCell(5)).opacity).toBe('0.45');
  });

  it('leaves every day selectable, inside the window or not', () => {
    setup();

    [5, 15, 25].forEach((day) => expect(dayCell(day)).not.toBeDisabled());
  });

  /* AC-11: a day beyond the data window is still a real choice. */
  it('selects a day beyond the data window when it is clicked', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();

    await user.click(dayCell(25));

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 8, 25));
  });

  it('marks today for assistive technology', () => {
    setup();

    expect(dayCell(15)).toHaveAttribute('aria-current', 'date');
    expect(dayCell(14)).not.toHaveAttribute('aria-current');
  });
});

describe('CalendarGrid — selection', () => {
  it('reports the clicked day in single mode', async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ value: new Date(2026, 8, 12) });

    await user.click(dayCell(18));

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 8, 18));
  });

  it('marks the chosen day as selected', () => {
    setup({ value: new Date(2026, 8, 12) });

    expect(dayCell(12)).toHaveAttribute('aria-selected', 'true');
    expect(dayCell(13)).toHaveAttribute('aria-selected', 'false');
  });

  /* AC-12: multi mode toggles — a chosen day comes back out on the next click. */
  it('adds and removes days in multi mode', async () => {
    const user = userEvent.setup();
    const { onChange } = setupMulti({ value: [new Date(2026, 8, 12)] });

    await user.click(dayCell(18));
    expect(onChange).toHaveBeenLastCalledWith([new Date(2026, 8, 12), new Date(2026, 8, 18)]);

    await user.click(dayCell(12));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

describe('CalendarGrid — navigation', () => {
  it('walks months and years with the header arrows', async () => {
    const user = userEvent.setup();
    setup();
    const label = screen.getByTestId('filter-widget-calendar-label');

    expect(label).toHaveTextContent('Sep 2026');

    await user.click(screen.getByTestId('filter-widget-calendar-next'));
    expect(label).toHaveTextContent('Oct 2026');

    await user.click(screen.getByTestId('filter-widget-calendar-prev'));
    expect(label).toHaveTextContent('Sep 2026');

    await user.click(screen.getByTestId('filter-widget-calendar-next-year'));
    expect(label).toHaveTextContent('Sep 2027');

    await user.click(screen.getByTestId('filter-widget-calendar-prev-year'));
    expect(label).toHaveTextContent('Sep 2026');
  });

  /* AC-18: the quick chips move the grid to their date and act on it exactly as clicking
     that day would — replacing in single mode. */
  it('navigates to and selects the earliest date', async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ earliestData: new Date(2026, 5, 3) });

    await user.click(screen.getByTestId('filter-widget-calendar-earliest'));

    expect(screen.getByTestId('filter-widget-calendar-label')).toHaveTextContent('Jun 2026');
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 5, 3));
  });

  it('navigates to and selects the latest date', async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ latestData: new Date(2026, 11, 24) });

    await user.click(screen.getByTestId('filter-widget-calendar-latest'));

    expect(screen.getByTestId('filter-widget-calendar-label')).toHaveTextContent('Dec 2026');
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 11, 24));
  });

  it('selects today, even when it lies beyond the data window', async () => {
    const user = userEvent.setup();
    const { onChange } = setup({
      earliestData: new Date(2020, 0, 1),
      latestData: new Date(2020, 11, 31),
    });

    await user.click(screen.getByTestId('filter-widget-calendar-today'));

    expect(onChange).toHaveBeenCalledWith(TODAY);
  });

  /* AC-18, multi mode: the chip toggles rather than being idempotent, since it stands in
     for clicking that day on the grid. */
  it('toggles the chip’s day in multi mode', async () => {
    const user = userEvent.setup();
    const { onChange } = setupMulti({ value: [TODAY] });

    await user.click(screen.getByTestId('filter-widget-calendar-today'));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('disables a chip whose date the data does not report', () => {
    setup({ earliestData: undefined, latestData: undefined });

    expect(screen.getByTestId('filter-widget-calendar-earliest')).toBeDisabled();
    expect(screen.getByTestId('filter-widget-calendar-latest')).toBeDisabled();
    expect(screen.getByTestId('filter-widget-calendar-today')).not.toBeDisabled();
  });
});

describe('CalendarGrid — keyboard', () => {
  it('names the grid by its month and gives it one home cell', () => {
    setup();

    expect(screen.getByRole('grid')).toHaveAccessibleName('September 2026');
    expect(
      screen.getByTestId('filter-widget-calendar-grid').querySelectorAll('[data-tabstop]'),
    ).toHaveLength(1);
  });

  it('moves the home cell with the arrow keys', async () => {
    const user = userEvent.setup();
    setup();

    dayCell(15).focus();
    await user.keyboard('{ArrowRight}');

    expect(dayCell(16)).toHaveAttribute('data-tabstop');
  });

  it('picks the focused day with Enter', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();

    dayCell(15).focus();
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(TODAY);
  });

  it('marks the grid’s top and bottom rows so the arrows can leave it', () => {
    setup();
    const rows = screen.getByTestId('filter-widget-calendar-grid').querySelectorAll('[role="row"]');
    // The first row is the weekday header; the six week rows follow.
    const weeks = Array.from(rows).slice(1);

    expect(weeks[0].querySelector('[data-edge="top"]')).not.toBeNull();
    expect(weeks[weeks.length - 1].querySelector('[data-edge="bottom"]')).not.toBeNull();
    expect(weeks[2].querySelector('[data-edge]')).toBeNull();
  });
});
