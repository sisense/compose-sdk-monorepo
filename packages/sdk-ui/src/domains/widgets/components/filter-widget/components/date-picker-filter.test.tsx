import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DatePickerFilter } from './date-picker-filter';

/**
 * The language the control resolves its date format from. Mutable so a test can put the
 * reader in another locale; reset to `en-US` after each one.
 */
let language = 'en-US';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    /* Reports the key, and the format when one was interpolated into it — so a test can
       see that the message carries the reader's own pattern rather than a baked-in one. */
    useTranslation: () => ({
      t: (key: string, options?: { format?: string }) =>
        options?.format ? `${key}(${options.format})` : key,
      i18n: { language },
    }),
  };
});

afterEach(() => {
  language = 'en-US';
});

/** Pinned so the calendar renders the same month on any day the suite runs. */
const TODAY = new Date(2026, 8, 15);
const EARLIEST = new Date(2026, 8, 1);
const LATEST = new Date(2026, 8, 30);

const setup = (props: Partial<Parameters<typeof DatePickerFilter>[0]> = {}) => {
  const onChange = vi.fn();
  const result = render(
    <DatePickerFilter
      today={TODAY}
      earliestData={EARLIEST}
      latestData={LATEST}
      onChange={onChange}
      {...props}
    />,
  );
  return { onChange, ...result };
};

/** The day cell for a date in the visible month, found by its accessible name. */
const dayCell = (day: number) => {
  const grid = screen.getByTestId('filter-widget-calendar-grid');
  return within(grid).getByRole('gridcell', {
    name: new Date(2026, 8, day).toLocaleDateString('en-US', { dateStyle: 'long' }),
  });
};

const openPanel = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByTestId('filter-widget-date-input-calendar'));
};

describe('DatePickerFilter — single select', () => {
  /* AC-5: the manual-entry input holds focus when the picker opens, and the masked
     template stands in as the format hint. */
  it('focuses the entry when the panel opens and shows the format template', async () => {
    const user = userEvent.setup();
    setup();
    await openPanel(user);

    const entry = screen.getByTestId('filter-widget-date-input');
    expect(entry).toHaveFocus();
    expect(entry).toHaveValue('MM/DD/YYYY');
  });

  /* AC-6: a date arriving by any route replaces whatever was selected before, so exactly
     one day is ever held. */
  it('replaces the selected day when another is clicked', async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ value: ['09/10/2026'] });
    await openPanel(user);

    await user.click(dayCell(20));
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onChange).toHaveBeenCalledWith(['09/20/2026']);
  });

  /* AC-7: clicking the day already selected leaves the selection unchanged. */
  it('keeps the selection when the selected day is clicked again', async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ value: ['09/10/2026'] });
    await openPanel(user);

    await user.click(dayCell(10));
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onChange).toHaveBeenCalledWith(['09/10/2026']);
  });

  it('publishes a typed date on Apply', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();
    await openPanel(user);

    await user.type(screen.getByTestId('filter-widget-date-input'), '09152026');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onChange).toHaveBeenCalledWith(['09/15/2026']);
  });

  /**
   * A typed separator closes a one-digit part without padding it and moves to the next, so
   * the field really can hold `9/5/2026`. Two bugs met on this path: the caret was pulled
   * back to the first unfilled cell on the next render, which undid the jump and packed the
   * digits into the month (`90/26/YYYY`), and the member bridge then refused any unpadded
   * date outright — so a day the reader typed and Apply accepted vanished with no message.
   *
   * The ghost keeps showing the unfilled cells (`9M/5D/2026`) while the published value is
   * the clean `9/5/2026`.
   */
  it('publishes an unpadded date typed with separator jumps', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();
    await openPanel(user);

    await user.keyboard('9/5/2026');

    expect(screen.getByTestId('filter-widget-date-input')).toHaveValue('9M/5D/2026');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onChange).toHaveBeenCalledWith(['9/5/2026']);
  });

  /* The same jump on a day-first mask, so the behaviour is the mask's and not the slash's. */
  it('publishes an unpadded date on a dot-separated mask', async () => {
    language = 'de-DE';
    const user = userEvent.setup();
    const { onChange } = setup();
    await openPanel(user);

    await user.keyboard('5.9.2026');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onChange).toHaveBeenCalledWith(['5.9.2026']);
  });

  /* AC-11: a real day outside the data window is permitted. */
  it('publishes a real date outside the data window', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();
    await openPanel(user);

    await user.type(screen.getByTestId('filter-widget-date-input'), '01011999');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onChange).toHaveBeenCalledWith(['01/01/1999']);
  });
});

describe('DatePickerFilter — manual entry validation', () => {
  /* AC-9 / AC-10, as revised: while the panel is open a flagged entry shows the invalid
     border only; the message waits for the field to close. */
  it('withholds the message while the panel is open', async () => {
    const user = userEvent.setup();
    setup();
    await openPanel(user);

    await user.type(screen.getByTestId('filter-widget-date-input'), '02312026');

    expect(screen.getByTestId('filter-widget-date-input')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByText('filterWidget.calendar.nonexistent')).not.toBeInTheDocument();
  });

  /**
   * The close and the message are ONE event, which is what this test owns: the panel shuts
   * and the wording appears together, because while the panel is open a flagged entry
   * carries the red border only. Asserting both is what separates this from the
   * complete-entry cases below, which only check the message.
   */
  it('closes the panel and shows the message together on Apply', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();
    await openPanel(user);

    await user.type(screen.getByTestId('filter-widget-date-input'), '02312026');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(screen.queryByTestId('filter-widget-date-panel')).not.toBeInTheDocument();
    expect(screen.getByText('filterWidget.calendar.nonexistent')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  /**
   * A well-formed date whose every number is out of range is still a date that does not
   * exist — not a format mistake. The reader followed `MM/DD/YYYY`, so repeating the
   * format back at them explains nothing.
   *
   * The mask only ever produces the `MM/DD/YYYY` shape once eight digits are in, so this
   * is the message any complete entry gets; the format message belongs to entries left
   * incomplete, covered by the two cases below.
   */
  it.each([
    ['every digit out of range', '33333333', '33/33/3333'],
    ['a month above 12', '13452026', '13/45/2026'],
    ['a February 29th outside a leap year', '02292001', '02/29/2001'],
  ])('reports %s as a date that does not exist', async (_label, typed, shown) => {
    const user = userEvent.setup();
    const { onChange } = setup();
    await openPanel(user);

    await user.type(screen.getByTestId('filter-widget-date-input'), typed);
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(screen.getByText('filterWidget.calendar.nonexistent')).toBeInTheDocument();
    expect(
      screen.queryByText('filterWidget.calendar.formatError(MM/DD/YYYY)'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('filter-widget-date-input')).toHaveValue(shown);
    expect(onChange).not.toHaveBeenCalled();
  });

  /* The refused entry stays in view under the closed field rather than snapping back to
     the committed value, so the reader can see what was refused. */
  /**
   * AC-25's exception, which needs a **committed** value to mean anything: the refused text
   * must stay on the closed field rather than snapping back to the date already applied, so
   * the reader corrects it in place instead of the committed date reappearing under their
   * click. Seeded deliberately — without a prior value this asserts nothing the
   * complete-entry cases above do not already cover.
   */
  it('keeps the refused text rather than reverting to the committed date', async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ value: ['09/10/2026'] });
    await openPanel(user);

    await user.keyboard('{Backspace>10/}');
    await user.type(screen.getByTestId('filter-widget-date-input'), '02312026');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    const entry = screen.getByTestId('filter-widget-date-input');
    expect(entry).toHaveValue('02/31/2026');
    expect(entry).not.toHaveValue('09/10/2026');
    expect(onChange).not.toHaveBeenCalled();
  });

  /* Typing only flags once the mask is full, so a half-typed entry carries no problem of
     its own — and a click on Apply never triggers the field's blur commit, because the
     button sits in the panel the field counts as its own. Apply therefore has to classify
     the draft itself, or an abandoned entry closes with no message at all. */
  /** Deletes the tail of a committed date, leaving a real half-typed entry behind. */
  const breakTheYear = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByTestId('filter-widget-date-input'));
    await user.keyboard('{Backspace}{Backspace}{Backspace}');
  };

  it('reports a half-typed entry on Apply, having broken a committed value', async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ value: ['12/01/2013'] });
    await openPanel(user);

    await breakTheYear(user);
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(screen.getByText('filterWidget.calendar.formatError(MM/DD/YYYY)')).toBeInTheDocument();
    // The refused entry stays in view rather than snapping back to the committed date.
    expect(screen.getByTestId('filter-widget-date-input')).toHaveValue('12/01/2YYY');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('reports a half-typed entry on Enter too, identically', async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ value: ['12/01/2013'] });
    await openPanel(user);

    await breakTheYear(user);
    await user.keyboard('{Enter}');

    expect(screen.getByText('filterWidget.calendar.formatError(MM/DD/YYYY)')).toBeInTheDocument();
    expect(screen.getByTestId('filter-widget-date-input')).toHaveValue('12/01/2YYY');
    expect(onChange).not.toHaveBeenCalled();
  });

  /* The bug this guards: Apply used to publish a refused entry. Apply and Enter now
     settle identically — neither persists a date that does not parse. */
  it('never publishes an entry that does not parse', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();
    await openPanel(user);

    await user.type(screen.getByTestId('filter-widget-date-input'), '02312026');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));
    expect(onChange).not.toHaveBeenCalled();

    await user.keyboard('{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });
});

/**
 * AC-5, AC-9 and AC-22 — manual entry follows the reader's own locale. The placeholder,
 * the ghost mask, the segment order, the separators, the parser and the error text are all
 * driven by it; nothing here may be a hard-coded `MM/DD/YYYY`.
 */
describe('DatePickerFilter — localised manual entry', () => {
  /** The masked entry, whatever locale it is rendering in. */
  const entry = () => screen.getByTestId('filter-widget-date-input');

  it.each([
    ['de-DE', 'DD.MM.YYYY'],
    ['ru-RU', 'DD.MM.YYYY'],
    ['nl-NL', 'DD-MM-YYYY'],
    ['ja-JP', 'YYYY/MM/DD'],
    ['en-US', 'MM/DD/YYYY'],
  ])('shows a %s reader the placeholder %s', async (locale, template) => {
    language = locale;
    const user = userEvent.setup();
    setup();
    await openPanel(user);

    expect(entry()).toHaveValue(template);
  });

  /* The same eight keystrokes mean a different day in each locale, and the value the
     control publishes is written in the reader's own format. */
  it('reads the digits a German reader types as day-month-year', async () => {
    language = 'de-DE';
    const user = userEvent.setup();
    const { onChange } = setup();
    await openPanel(user);

    await user.type(entry(), '24112009');
    expect(entry()).toHaveValue('24.11.2009');

    await user.click(screen.getByTestId('filter-widget-panel-apply'));
    expect(onChange).toHaveBeenCalledWith(['24.11.2009']);
  });

  /* Year first, so the leading segment is four cells wide — the case a mask pinned to
     `MM/DD/YYYY` could not walk at all. */
  it('reads the digits a Japanese reader types as year-month-day', async () => {
    language = 'ja-JP';
    const user = userEvent.setup();
    const { onChange } = setup();
    await openPanel(user);

    await user.type(entry(), '20091124');
    expect(entry()).toHaveValue('2009/11/24');

    await user.click(screen.getByTestId('filter-widget-panel-apply'));
    expect(onChange).toHaveBeenCalledWith(['2009/11/24']);
  });

  /* AC-9: the message names the reader's OWN pattern. A translated literal carrying
     `MM/DD/YYYY` would be wrong here, which is why the string is parameterised. */
  it("names the reader's own pattern in the format message", async () => {
    language = 'de-DE';
    const user = userEvent.setup();
    setup({ value: ['01.12.2013'] });
    await openPanel(user);

    await user.click(entry());
    await user.keyboard('{Backspace}{Backspace}{Backspace}');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(screen.getByText('filterWidget.calendar.formatError(DD.MM.YYYY)')).toBeInTheDocument();
  });

  /* AC-22: a date the locale accepts is never reported as a format error. Day 24 in the
     first segment is fine for a German reader and impossible for an American one. */
  it('accepts a day-first date a German reader types', async () => {
    language = 'de-DE';
    const user = userEvent.setup();
    const { onChange } = setup();
    await openPanel(user);

    await user.type(entry(), '24112009');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(
      screen.queryByText('filterWidget.calendar.formatError(DD.MM.YYYY)'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('filterWidget.calendar.nonexistent')).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith(['24.11.2009']);
  });

  /* The same digits in the US mask name month 24 — a date that does not exist. The
     complaint is about the date, not the format, in both locales. */
  it('reports the same digits as nonexistent for an American reader', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();
    await openPanel(user);

    await user.type(entry(), '24112009');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(screen.getByText('filterWidget.calendar.nonexistent')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  /* A committed value is displayed in the reader's format too, not just typed in it —
     the presentation half of AC-31. */
  it('displays a committed date in the reader’s own format', async () => {
    language = 'de-DE';
    const user = userEvent.setup();
    setup({ value: ['15.09.2026'] });
    await openPanel(user);

    expect(entry()).toHaveValue('15.09.2026');
  });
});

describe('DatePickerFilter — multi select', () => {
  const openMulti = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('combobox'));
  };

  /* AC-12: day selection is a toggle — clicking an unselected day adds it, clicking a
     selected one removes it, with no separate deselect control. */
  it('adds an unselected day to the selection', async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ multiselect: true, value: ['09/10/2026'] });
    await openMulti(user);

    await user.click(dayCell(20));
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onChange).toHaveBeenCalledWith(['09/10/2026', '09/20/2026']);
  });

  it('removes a day that is already selected, with no separate deselect control', async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ multiselect: true, value: ['09/10/2026', '09/20/2026'] });
    await openMulti(user);

    await user.click(dayCell(10));
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onChange).toHaveBeenCalledWith(['09/20/2026']);
  });

  /* AC-13: an empty multi-select control hints that it takes more than one day. */
  it('hints that several days can be chosen while nothing is selected', async () => {
    const user = userEvent.setup();
    setup({ multiselect: true });

    await user.hover(screen.getByRole('combobox'));

    expect(screen.getByText('filterWidget.calendar.multipleDaysHint')).toBeInTheDocument();
  });

  /* AC-15: with days selected, the hover tooltip lists every one of them. */
  it('lists every selected day in the tooltip', async () => {
    const user = userEvent.setup();
    setup({ multiselect: true, value: ['09/20/2026', '09/10/2026'] });

    await user.hover(screen.getByRole('combobox'));

    // Earliest first, so the tooltip reads in the order the trigger names them.
    expect(screen.getByText('09/10/2026, 09/20/2026')).toBeInTheDocument();
  });

  /* AC-14: the trigger hands its names to the Selector earliest-first, so the one it names
     is the earliest chosen and the rest fall behind the `+N` count. The fitting itself is
     the Selector's, measured against a real layout in its own suite; here the contract
     under test is the order. */
  it('names the selected dates earliest first', () => {
    setup({ multiselect: true, value: ['09/20/2026', '09/10/2026'] });

    expect(screen.getByRole('combobox')).toHaveValue('09/10/2026, 09/20/2026');
  });

  it('discards the pending selection when Cancel closes the panel', async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ multiselect: true, value: ['09/10/2026'] });
    await openMulti(user);

    await user.click(dayCell(20));
    await user.click(screen.getByTestId('filter-widget-panel-cancel'));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox')).toHaveValue('09/10/2026');
  });

  it('empties the draft on Clear, and publishes it only on Apply', async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ multiselect: true, value: ['09/10/2026'] });
    await openMulti(user);

    await user.click(screen.getByTestId('filter-widget-panel-clear'));
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByTestId('filter-widget-panel-apply'));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});

describe('DatePickerFilter — accessibility', () => {
  it('names the panel a dialog for what it chooses', async () => {
    const user = userEvent.setup();
    setup();
    await openPanel(user);

    expect(screen.getByRole('dialog')).toHaveAccessibleName('filterWidget.calendar.chooseDate');
  });

  it('names the multi-select panel for several dates', async () => {
    const user = userEvent.setup();
    setup({ multiselect: true });
    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('dialog')).toHaveAccessibleName('filterWidget.calendar.chooseDates');
  });
});
