/** @vitest-environment jsdom */
import { Filter, filterFactory, isDateRangeFilter } from '@sisense/sdk-data';
import { screen, within } from '@testing-library/react';

import { setup, setupI18nMock } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';

import { DatetimeRangeSection } from './datetime-range-section.js';

setupI18nMock();

const LIMITS = { minDate: '2024-01-01T00:00:00', maxDate: '2024-12-31T00:00:00' };

/** Reads the two range trigger fields in render order: `[from, to]`. */
const getRangeFields = () => screen.getAllByTestId('csdk-select-field');

/**
 * Clicks a day inside the open calendar.
 *
 * `fixedHeight` pads the grid to six weeks, so the neighbouring months contribute duplicate day
 * numbers — those cells are skipped to keep the lookup unambiguous.
 */
const getDayCell = (day: string) =>
  Array.from(document.querySelectorAll('.react-datepicker__day')).find(
    (cell) => cell.textContent === day && !cell.className.includes('outside-month'),
  ) as HTMLElement;

describe('DatetimeRangeSection', () => {
  const filterChangeHandlerMock = vi.fn();
  const dateFilter = filterFactory.members(DM.Commerce.Date.Years, []);

  const renderSection = () =>
    setup(
      <DatetimeRangeSection
        filter={dateFilter}
        selected={true}
        limits={LIMITS}
        onChange={filterChangeHandlerMock}
      />,
      true,
    );

  beforeEach(() => {
    filterChangeHandlerMock.mockClear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // Places "today" inside the limits, so both calendars open on March 2024.
    vi.setSystemTime(new Date('2024-03-15T10:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render both range fields empty', () => {
    renderSection();
    const [fromField, toField] = getRangeFields();

    expect(within(fromField).getByText('Select')).toBeInTheDocument();
    expect(within(toField).getByText('Select')).toBeInTheDocument();
  });

  it('should fill only the "from" field when a "from" date is picked', async () => {
    const { user } = renderSection();
    const [fromField, toField] = getRangeFields();

    await user.click(fromField);
    await user.click(getDayCell('5'));

    expect(within(fromField).queryByText('Select')).not.toBeInTheDocument();
    expect(within(toField).getByText('Select')).toBeInTheDocument();
  });

  it('should report an incomplete range as no filter', async () => {
    const { user } = renderSection();
    const [fromField] = getRangeFields();

    await user.click(fromField);
    await user.click(getDayCell('5'));

    expect(filterChangeHandlerMock).toHaveBeenCalledWith(null);
  });

  it('should build a date range filter once both ends are picked', async () => {
    const { user } = renderSection();
    const [fromField, toField] = getRangeFields();

    await user.click(fromField);
    await user.click(getDayCell('5'));

    await user.click(toField);
    await user.click(getDayCell('20'));

    const lastFilter = filterChangeHandlerMock.mock.lastCall?.[0] as Filter;
    expect(isDateRangeFilter(lastFilter)).toBe(true);
    expect(lastFilter).toMatchObject({ valueA: '2024-03-05', valueB: '2024-03-20' });
  });

  it('should hand the calendar over to the "to" end once "from" is picked', async () => {
    const { user } = renderSection();
    const [fromField] = getRangeFields();

    await user.click(fromField);
    await user.click(getDayCell('5'));
    // Deliberately no click on the "to" field: the shared calendar should already be editing it.
    await user.click(getDayCell('20'));

    const lastFilter = filterChangeHandlerMock.mock.lastCall?.[0] as Filter;
    expect(lastFilter).toMatchObject({ valueA: '2024-03-05', valueB: '2024-03-20' });
  });

  it('should serve both fields from a single calendar', async () => {
    const { user } = renderSection();
    const [fromField] = getRangeFields();

    await user.click(fromField);
    await user.click(getDayCell('5'));

    expect(screen.getAllByLabelText('date range filter calendar container')).toHaveLength(1);
  });

  it('should keep the calendar open after the range is complete', async () => {
    const { user } = renderSection();
    const [fromField] = getRangeFields();

    await user.click(fromField);
    await user.click(getDayCell('5'));
    await user.click(getDayCell('20'));

    // Dismissing the calendar is the user's call, so a complete range must not close it.
    expect(screen.getByLabelText('date range filter calendar container')).toBeInTheDocument();
  });

  it('should close the calendar when the user clicks away', async () => {
    const { user } = renderSection();
    const [fromField] = getRangeFields();

    await user.click(fromField);
    expect(screen.getByLabelText('date range filter calendar container')).toBeInTheDocument();

    await user.click(document.body);

    expect(screen.queryByLabelText('date range filter calendar container')).not.toBeInTheDocument();
  });

  it('should fill only the "to" field when the range is started from its end', async () => {
    const { user } = renderSection();
    const [fromField, toField] = getRangeFields();

    await user.click(toField);
    await user.click(getDayCell('20'));

    expect(within(toField).queryByText('Select')).not.toBeInTheDocument();
    expect(within(fromField).getByText('Select')).toBeInTheDocument();
    expect(filterChangeHandlerMock).toHaveBeenCalledWith(null);
  });
});
