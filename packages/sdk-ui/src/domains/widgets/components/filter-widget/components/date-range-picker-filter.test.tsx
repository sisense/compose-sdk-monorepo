/** @vitest-environment jsdom */
import { DateLevels, DimensionalLevelAttribute, filterFactory } from '@sisense/sdk-data';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DateRangePickerFilter } from './date-range-picker-filter.js';
import { DEFAULT_DATE_MASK } from './date-text.js';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en-US' } }),
  };
});

vi.mock('./use-date-mask', () => ({
  useDateMask: () => ({ mask: DEFAULT_DATE_MASK, locale: 'en-US' }),
}));

const years = new DimensionalLevelAttribute(
  'Years',
  '[Commerce.Date (Calendar)]',
  DateLevels.Years,
  'yyyy',
);

const TODAY = new Date(2026, 8, 11);
const EARLIEST = new Date(2026, 0, 1);
const LATEST = new Date(2026, 11, 31);

const setup = (overrides: Partial<Parameters<typeof DateRangePickerFilter>[0]> = {}) => {
  const onFilterUpdate = vi.fn();
  const view = render(
    <DateRangePickerFilter
      attribute={years}
      today={TODAY}
      onFilterUpdate={onFilterUpdate}
      {...overrides}
    />,
  );
  return { ...view, onFilterUpdate };
};

const fromInput = () => screen.getByTestId('filter-widget-date-range-from');
const toInput = () => screen.getByTestId('filter-widget-date-range-to');

const openPanel = async (user: ReturnType<typeof userEvent.setup>, end: 'from' | 'to' = 'from') => {
  await user.click(end === 'from' ? fromInput() : toInput());
  expect(screen.getByTestId('filter-widget-date-range-panel')).toBeInTheDocument();
};

describe('DateRangePickerFilter — the row is an accessible group named by the field label', () => {
  // CodeRabbit review finding: the two inputs exposed only their own generic From/To
  // accessible names — nothing tied the visible filter label to the pair as a group, so
  // multiple date-range filters on one dashboard read alike to assistive tech.
  it('associates the label with the row via aria-labelledby, computing it as the group name', () => {
    setup({ label: 'Order Date' });

    expect(screen.getByRole('group', { name: 'Order Date' })).toBeInTheDocument();
  });
});

describe('DateRangePickerFilter — fields as the trigger (no separate closed summary)', () => {
  it('shows the idle From/To word on both ends and no panel when nothing is applied', () => {
    setup();
    expect(fromInput()).toHaveValue('');
    expect(toInput()).toHaveValue('');
    expect(screen.getByText('filterWidget.dateRange.from')).toBeInTheDocument();
    expect(screen.getByText('filterWidget.dateRange.to')).toBeInTheDocument();
    expect(screen.queryByTestId('filter-widget-date-range-panel')).not.toBeInTheDocument();
  });

  it('clicking either field opens the shared panel, activated on that end', async () => {
    const user = userEvent.setup();
    setup();

    await openPanel(user, 'to');
    await user.type(toInput(), '12252026');
    // The keystrokes landed on the clicked end (To), not the default (From).
    expect(toInput()).toHaveValue('12/25/2026');
    // The other end is still closed and untouched — its own idle word stays up.
    expect(fromInput()).toHaveValue('');
  });

  describe('typed hand-off (CodeRabbit review finding)', () => {
    it('hands off to To once a full, valid date is typed into From — caret follows', async () => {
      const user = userEvent.setup();
      setup();

      await openPanel(user, 'from');
      await user.type(fromInput(), '01142026');

      expect(fromInput()).toHaveValue('01/14/2026');
      // CodeRabbit review finding: the hand-off's `.focus()` call fires in the same tick as
      // the draft write, blurring From — which must not read a stale, pre-write `draft` and
      // flag the just-completed, valid date as malformed.
      expect(fromInput()).not.toHaveAttribute('aria-invalid');
      // The hand-off moved the caret, not just the internal `activeEnd` — the next
      // keystrokes (typed with no click on To) land in To.
      expect(toInput()).toHaveFocus();
      await user.keyboard('04102026');
      expect(toInput()).toHaveValue('04/10/2026');
    });

    // A full part hops the caret over the separator on its own, so the `/` a reader types
    // next must not jump again — `03/06/2026` used to land as `03/DD/0620`.
    it('keeps both ends intact when the dates are typed with separators', async () => {
      const user = userEvent.setup();
      setup();

      await openPanel(user, 'from');
      await user.type(fromInput(), '03/06/2026');

      expect(fromInput()).toHaveValue('03/06/2026');
      expect(toInput()).toHaveFocus();
      await user.keyboard('04/10/2026');
      expect(toInput()).toHaveValue('04/10/2026');
    });

    it('does not hand back to From once a full, valid date is typed into To (one-directional)', async () => {
      const user = userEvent.setup();
      setup();

      await openPanel(user, 'to');
      await user.type(toInput(), '04102026');

      expect(toInput()).toHaveValue('04/10/2026');
      expect(toInput()).toHaveFocus();
    });

    it('does not hand off completing From when To already holds a value', async () => {
      const user = userEvent.setup();
      const filter = filterFactory.dateRange(years, undefined, '2026-04-10');
      setup({ filter });

      await openPanel(user, 'from');
      await user.type(fromInput(), '01142026');

      expect(fromInput()).toHaveValue('01/14/2026');
      expect(fromInput()).toHaveFocus();
    });
  });

  describe('typing follows the calendar into view (review nit, prototype parity)', () => {
    // TODAY is September 2026, so the grid opens on Sep/Oct — matches the prototype's own
    // CalendarPicker follow logic: a date arriving from outside (typed, not clicked) brings
    // its own month into view once the mask is full, so the grid and the field never
    // disagree about which month is being talked about.
    it('scrolls the two-month grid to a typed date outside the current window', async () => {
      const user = userEvent.setup();
      setup();

      await openPanel(user, 'from');
      expect(screen.getByTestId('filter-widget-date-range-label-left')).toHaveTextContent(
        'Sep 2026',
      );

      await user.type(fromInput(), '12252026');

      expect(screen.getByTestId('filter-widget-date-range-label-left')).toHaveTextContent(
        'Dec 2026',
      );
      expect(screen.getByTestId('filter-widget-date-range-label-right')).toHaveTextContent(
        'Jan 2027',
      );
    });

    it('does not move the window for a typed date already inside it', async () => {
      const user = userEvent.setup();
      setup();

      await openPanel(user, 'from');
      await user.type(fromInput(), '09202026'); // still September — already the left grid

      expect(screen.getByTestId('filter-widget-date-range-label-left')).toHaveTextContent(
        'Sep 2026',
      );
    });
  });

  it('is purely controlled: the closed fields read whatever the owner feeds back as `filter`', () => {
    const { rerender } = setup();
    expect(fromInput()).toHaveValue('');

    rerender(
      <DateRangePickerFilter
        attribute={years}
        today={TODAY}
        filter={filterFactory.dateRange(years, '2026-01-14', '2026-04-10')}
      />,
    );

    expect(fromInput()).toHaveValue('01/14/2026');
    expect(toInput()).toHaveValue('04/10/2026');
  });
});

describe('DateRangePickerFilter — Apply / Cancel', () => {
  it('publishes an inclusive both-bounds range on Apply and does not publish on Cancel', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = setup();

    await openPanel(user);
    await user.type(fromInput(), '01142026');
    await user.type(toInput(), '04102026');
    await user.click(screen.getByTestId('filter-widget-panel-cancel'));
    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(fromInput()).toHaveValue('');
    expect(screen.queryByTestId('filter-widget-date-range-panel')).not.toBeInTheDocument();

    await openPanel(user);
    await user.type(fromInput(), '01142026');
    await user.type(toInput(), '04102026');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    expect(onFilterUpdate.mock.calls[0][0].filterJaql()).toEqual({
      from: '2026-01-14',
      to: '2026-04-10',
    });
  });

  it('applies an open-ended From-only range', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = setup();

    await openPanel(user);
    await user.type(fromInput(), '03012026');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate.mock.calls[0][0].filterJaql()).toEqual({ from: '2026-03-01' });
  });

  it('clears to include-all when both ends are empty on Apply', async () => {
    const user = userEvent.setup();
    const filter = filterFactory.dateRange(years, '2026-01-14', '2026-04-10');
    const { onFilterUpdate } = setup({ filter });

    await openPanel(user);
    await user.click(screen.getByTestId('filter-widget-panel-clear'));
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).toHaveBeenCalledWith(null);
  });
});

describe('DateRangePickerFilter — typed inversion is refused, not applied', () => {
  it('closes on Apply without publishing, and keeps the rejected pair under the closed fields', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = setup();

    await openPanel(user);
    await user.type(fromInput(), '04102026');
    await user.type(toInput(), '01142026');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(screen.queryByTestId('filter-widget-date-range-panel')).not.toBeInTheDocument();
    expect(fromInput()).toHaveValue('04/10/2026');
    expect(toInput()).toHaveValue('01/14/2026');
    // The inverted flag attaches only to the field just edited — To, typed into last
    // before Apply — never both at once for the one cross-end fault. From's own date is
    // perfectly valid on its own; it is not itself at fault.
    expect(toInput()).toHaveAttribute('aria-invalid', 'true');
    expect(fromInput()).not.toHaveAttribute('aria-invalid');
  });

  it('attaches the inverted flag to From instead when From is the field just edited', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = setup();

    await openPanel(user, 'to');
    await user.type(toInput(), '01142026');
    await openPanel(user, 'from');
    await user.type(fromInput(), '04102026');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(fromInput()).toHaveAttribute('aria-invalid', 'true');
    expect(toInput()).not.toHaveAttribute('aria-invalid');
  });

  it('reopening reseeds the draft from the rejected pair, not the last-applied value', async () => {
    const user = userEvent.setup();
    setup();

    await openPanel(user);
    await user.type(fromInput(), '04102026');
    await user.type(toInput(), '01142026');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    await openPanel(user);
    expect(fromInput()).toHaveValue('04/10/2026');
    expect(toInput()).toHaveValue('01/14/2026');
  });
});

describe('DateRangePickerFilter — panel Clear', () => {
  it('empties both fields and keeps the panel open, without applying', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = setup();

    await openPanel(user);
    await user.type(fromInput(), '03012026');
    await user.click(screen.getByTestId('filter-widget-panel-clear'));

    expect(screen.getByTestId('filter-widget-date-range-panel')).toBeInTheDocument();
    expect(fromInput()).toHaveValue('');
    expect(onFilterUpdate).not.toHaveBeenCalled();
  });
});

describe('DateRangePickerFilter — per-field ✕ (review finding: closed ✕ must not publish)', () => {
  /* CodeRabbit review finding: the closed ✕ used to call onFilterUpdate directly — the only
     path in the whole control that published without Apply/Enter, contradicting the rule that
     only Apply/Enter commits. It now opens the panel instead, seeded with this end
     already blanked — the same "open, don't publish" rule a keystroke into a closed field
     already follows (changeEnd) — so the reader still has to Apply to actually clear the
     committed filter. */
  it('opens the panel with the clicked end blanked, rather than publishing directly, when the fields are closed', async () => {
    const user = userEvent.setup();
    const filter = filterFactory.dateRange(years, '2026-01-14', '2026-04-10');
    const { onFilterUpdate } = setup({ filter });

    await user.click(screen.getByTestId('filter-widget-date-range-from-clear'));

    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(screen.getByTestId('filter-widget-date-range-panel')).toBeInTheDocument();
    expect(fromInput()).toHaveValue('MM/DD/YYYY');
    expect(toInput()).toHaveValue('04/10/2026');
    expect(fromInput()).toHaveFocus();

    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    expect(onFilterUpdate.mock.calls[0][0].filterJaql()).toEqual({ to: '2026-04-10' });
  });

  it('clears just the active draft end while the panel stays open', async () => {
    const user = userEvent.setup();
    const filter = filterFactory.dateRange(years, '2026-01-14', '2026-04-10');
    const { onFilterUpdate } = setup({ filter });

    await openPanel(user);
    await user.click(screen.getByTestId('filter-widget-date-range-from-clear'));

    expect(screen.getByTestId('filter-widget-date-range-panel')).toBeInTheDocument();
    expect(fromInput()).toHaveValue('MM/DD/YYYY');
    expect(toInput()).toHaveValue('04/10/2026');
    expect(onFilterUpdate).not.toHaveBeenCalled();
  });

  it("opens the panel preserving the other end's fault when clearing one end of a rejected pair", async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = setup();

    await openPanel(user);
    await user.type(fromInput(), '13452026'); // 13/45/2026 — nonexistent
    await user.type(toInput(), '04102026'); // 04/10/2026 — valid
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).not.toHaveBeenCalled();

    await user.click(screen.getByTestId('filter-widget-date-range-to-clear'));

    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(screen.getByTestId('filter-widget-date-range-panel')).toBeInTheDocument();
    expect(fromInput()).toHaveValue('13/45/2026');
    // Focused (this is the just-cleared, just-opened end) shows the mask guide, not blank.
    expect(toInput()).toHaveValue('MM/DD/YYYY');
    expect(fromInput()).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('DateRangePickerFilter — idle empty-state word (prototype parity)', () => {
  it('shows the idle From/To word for an empty, unfocused end, and the mask guide once it is focused', async () => {
    const user = userEvent.setup();
    setup({ earliestData: EARLIEST, latestData: LATEST });

    expect(screen.getByText('filterWidget.dateRange.from')).toBeInTheDocument();
    expect(screen.getByText('filterWidget.dateRange.to')).toBeInTheDocument();
    expect(fromInput()).toHaveValue('');
    expect(toInput()).toHaveValue('');

    await openPanel(user, 'from');

    // Focused: the idle word gives way to the MM/DD/YYYY format guide.
    expect(screen.queryByText('filterWidget.dateRange.from')).not.toBeInTheDocument();
    expect(fromInput()).toHaveValue('MM/DD/YYYY');
    // The other end is still closed and untouched — its own idle word stays up.
    expect(screen.getByText('filterWidget.dateRange.to')).toBeInTheDocument();
    expect(toInput()).toHaveValue('');
  });
});

describe('DateRangePickerFilter — panel readout falls back once typed text stops parsing', () => {
  /* The readout (DateRangeCalendarGrid) is driven by `gridValue` — `parseDateInput` on the
     CURRENT draft text, not the raw characters — so the instant a complete, valid date is
     edited back down to something that no longer parses, the readout drops the formatted
     date and falls back to the data bound, exactly as it does for a still-empty end. */
  it('shows the bound fallback the moment a complete, valid From stops parsing', async () => {
    const user = userEvent.setup();
    setup({ earliestData: EARLIEST, latestData: LATEST });

    await openPanel(user, 'from');
    await user.type(fromInput(), '01142026');

    const readout = screen.getByTestId('filter-widget-date-range-readout');
    expect(within(readout).getByText('01/14/2026')).not.toHaveAttribute('data-missing');

    // One Backspace leaves an incomplete, unparseable From — typed hand-off already
    // moved focus to To, so re-focus From explicitly.
    await user.type(fromInput(), '{Backspace}');
    expect(fromInput()).toHaveValue('01/14/202Y');

    expect(within(readout).queryByText('01/14/2026')).not.toBeInTheDocument();
    expect(within(readout).getByText('01/01/2026')).toHaveAttribute('data-missing');
  });
});

describe('DateRangePickerFilter — disabled', () => {
  // CodeRabbit review finding: the trailing calendar glyph already guarded `disabled`, but
  // a click on a field's own box padding (not on the masked input, which is natively
  // disabled and never dispatches its own click) reached that field's Box onClick
  // unguarded and opened the panel anyway.
  it('does not open the panel on a click that lands on a field box padding, not either input', async () => {
    const user = userEvent.setup();
    setup({ disabled: true });

    await user.click(screen.getByTestId('filter-widget-date-range-from-trigger'));

    expect(screen.queryByTestId('filter-widget-date-range-panel')).not.toBeInTheDocument();
  });
});

describe('DateRangePickerFilter — forced external error reaches the input, not just the border', () => {
  // CodeRabbit review finding: `MaskedDateInput` read `invalid` off the per-end typed
  // `problem` alone, so a caller-forced `error` (with neither end mid-typing a fault of its
  // own) painted the Field's border invalid but left the `<input>`'s own `aria-invalid`
  // false — assistive tech never learned the field was invalid at all.
  it('sets aria-invalid on both ends for a forced boolean error, with no message to describe', () => {
    setup({ error: true });

    expect(fromInput()).toHaveAttribute('aria-invalid', 'true');
    expect(toInput()).toHaveAttribute('aria-invalid', 'true');
    expect(fromInput()).not.toHaveAttribute('aria-describedby');
    expect(toInput()).not.toHaveAttribute('aria-describedby');
  });

  it('points aria-describedby at the rendered message for a forced string error (shown under To)', () => {
    setup({ error: 'No data in the selected range' });

    // Matches the component's own rule: a forced error with no live per-end problem shows
    // its message once, under To — From takes the invalid border only.
    expect(toInput()).toHaveAttribute('aria-invalid', 'true');
    expect(toInput()).toHaveAccessibleDescription('No data in the selected range');

    expect(fromInput()).toHaveAttribute('aria-invalid', 'true');
    expect(fromInput()).not.toHaveAttribute('aria-describedby');
  });
});
