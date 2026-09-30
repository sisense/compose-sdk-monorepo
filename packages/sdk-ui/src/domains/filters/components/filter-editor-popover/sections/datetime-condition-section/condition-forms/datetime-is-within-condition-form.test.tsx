/** @vitest-environment jsdom */
import type { Filter } from '@sisense/sdk-data';
import { DateLevels, DateOperators, filterFactory } from '@sisense/sdk-data';
import { fireEvent, screen, within } from '@testing-library/react';

import { setup, setupI18nMock } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';

import type { DatetimeLimits } from '../../types.js';
import { DatetimeIsWithinConditionForm } from './datetime-is-within-condition-form.js';

setupI18nMock();

const getCountInput = () => screen.getByRole('spinbutton');

/** The base date field renders after the granularity and position selects. */
const getCalendarField = () => screen.getAllByTestId('csdk-select-field')[2];

/**
 * Finds a day inside the open calendar, skipping the neighbouring months' duplicate day numbers.
 *
 * react-datepicker marks those neighbouring days only by class, so a DOM query is needed here.
 */
const getDayCell = (day: string): HTMLElement => {
  const cell = Array.from(document.querySelectorAll<HTMLElement>('.react-datepicker__day')).find(
    (dayCell) => dayCell.textContent === day && !dayCell.className.includes('outside-month'),
  );
  if (!cell) {
    throw new Error(`No in-month calendar day "${day}" is rendered`);
  }
  return cell;
};

describe('DatetimeIsWithinConditionForm', () => {
  const filterChangeHandlerMock = vi.fn();

  const renderForm = (filter: Filter, limits?: DatetimeLimits) =>
    setup(
      <DatetimeIsWithinConditionForm
        filter={filter}
        limits={limits}
        onChange={filterChangeHandlerMock}
      />,
      true,
    );

  const selectOption = async (
    user: ReturnType<typeof setup>['user'],
    selectLabel: string,
    optionLabel: string,
  ) => {
    await user.click(screen.getByLabelText(selectLabel));
    const content = await screen.findByLabelText('Single-select content');
    await user.click(within(content).getByText(optionLabel));
  };

  beforeEach(() => {
    filterChangeHandlerMock.mockClear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // Opens an empty calendar on March 2024.
    vi.setSystemTime(new Date('2024-03-15T10:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('without a base date', () => {
    const membersFilter = filterFactory.members(DM.Commerce.Date.Years, []);

    it('should render the default "1 year before" state with an empty date', () => {
      renderForm(membersFilter);

      expect(getCountInput()).toHaveValue(1);
      expect(
        within(screen.getByLabelText('Granularity select')).getByText('Year'),
      ).toBeInTheDocument();
      expect(
        within(screen.getByLabelText('Position select')).getByText('Before'),
      ).toBeInTheDocument();
      expect(within(getCalendarField()).getByText('Select')).toBeInTheDocument();
    });

    it('should emit no filter while the base date is missing', async () => {
      const { user } = renderForm(membersFilter);

      fireEvent.change(getCountInput(), { target: { value: '4' } });
      await selectOption(user, 'Position select', 'After');

      expect(filterChangeHandlerMock).toHaveBeenCalledTimes(2);
      expect(filterChangeHandlerMock).toHaveBeenNthCalledWith(1, null);
      expect(filterChangeHandlerMock).toHaveBeenNthCalledWith(2, null);
    });

    it('should emit a "before" filter anchored to the picked date', async () => {
      const { user } = renderForm(membersFilter);

      await user.click(getCalendarField());
      await user.click(getDayCell('5'));

      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          operator: DateOperators.Last,
          offset: 0,
          count: 1,
          anchor: new Date(Date.UTC(2024, 2, 5)),
          attribute: expect.objectContaining({ granularity: DateLevels.Years }),
        }),
      );
    });

    it('should not allow picking a base date outside the limits', async () => {
      const { user } = renderForm(membersFilter, {
        minDate: '2024-03-10T00:00:00',
        maxDate: '2024-03-20T00:00:00',
      });

      await user.click(getCalendarField());
      await user.click(getDayCell('5'));
      expect(filterChangeHandlerMock).not.toHaveBeenCalled();

      await user.click(getDayCell('12'));
      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ anchor: new Date(Date.UTC(2024, 2, 12)) }),
      );
    });

    it('should apply a limit that has only a max date', async () => {
      const { user } = renderForm(membersFilter, { maxDate: '2024-03-20T00:00:00' });

      await user.click(getCalendarField());
      await user.click(getDayCell('25'));
      expect(filterChangeHandlerMock).not.toHaveBeenCalled();

      await user.click(getDayCell('1'));
      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ anchor: new Date(Date.UTC(2024, 2, 1)) }),
      );
    });
  });

  describe('with an anchored relative filter', () => {
    const anchor = new Date(Date.UTC(2024, 2, 10));
    const threeMonthsAfter = filterFactory.dateRelativeFrom(
      DM.Commerce.Date.Months,
      0,
      3,
      '2024-03-10T00:00:00',
    );

    const anchoredFilter = (operator: string, count: number, granularity: string) =>
      expect.objectContaining({
        operator,
        offset: 0,
        count,
        anchor,
        attribute: expect.objectContaining({ granularity }),
        config: expect.objectContaining({ guid: threeMonthsAfter.config.guid }),
      });

    it('should render the values of the filter', () => {
      renderForm(threeMonthsAfter);

      expect(getCountInput()).toHaveValue(3);
      expect(
        within(screen.getByLabelText('Granularity select')).getByText('Month'),
      ).toBeInTheDocument();
      expect(
        within(screen.getByLabelText('Position select')).getByText('After'),
      ).toBeInTheDocument();
      expect(within(getCalendarField()).getByText('03/10/2024')).toBeInTheDocument();
    });

    it('should render a "last" filter as "Before"', () => {
      renderForm(filterFactory.dateRelativeTo(DM.Commerce.Date.Years, 0, 2, '2024-03-10'));

      expect(
        within(screen.getByLabelText('Position select')).getByText('Before'),
      ).toBeInTheDocument();
    });

    it('should emit a "before" filter when the position changes to "Before"', async () => {
      const { user } = renderForm(threeMonthsAfter);

      await selectOption(user, 'Position select', 'Before');

      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        anchoredFilter(DateOperators.Last, 3, DateLevels.Months),
      );
    });

    it('should emit a new level attribute when the granularity changes', async () => {
      const { user } = renderForm(threeMonthsAfter);

      await selectOption(user, 'Granularity select', 'Day');

      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        anchoredFilter(DateOperators.Next, 3, DateLevels.Days),
      );
    });

    it('should emit the typed count', () => {
      renderForm(threeMonthsAfter);

      fireEvent.change(getCountInput(), { target: { value: '7' } });

      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        anchoredFilter(DateOperators.Next, 7, DateLevels.Months),
      );
    });

    it.each(['', '0'])('should fall back to a count of 1 for "%s"', (value) => {
      renderForm(threeMonthsAfter);

      fireEvent.change(getCountInput(), { target: { value } });

      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        anchoredFilter(DateOperators.Next, 1, DateLevels.Months),
      );
    });

    it('should keep the previous count for a non-integer value', () => {
      renderForm(threeMonthsAfter);

      fireEvent.change(getCountInput(), { target: { value: '-2' } });

      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        anchoredFilter(DateOperators.Next, 3, DateLevels.Months),
      );
      expect(getCountInput()).toHaveValue(3);
    });
  });
});
