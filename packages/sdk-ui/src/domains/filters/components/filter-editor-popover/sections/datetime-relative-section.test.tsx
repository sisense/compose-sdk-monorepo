/** @vitest-environment jsdom */
import type { Filter } from '@sisense/sdk-data';
import { DateLevels, DateOperators, filterFactory } from '@sisense/sdk-data';
import { fireEvent, screen, within } from '@testing-library/react';

import { setup, setupI18nMock } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';

import { DatetimeRelativeSection } from './datetime-relative-section.js';

setupI18nMock();

describe('DatetimeRelativeSection', () => {
  const filterChangeHandlerMock = vi.fn();

  const renderSection = (filter: Filter, selected = true) =>
    setup(
      <DatetimeRelativeSection
        filter={filter}
        selected={selected}
        onChange={filterChangeHandlerMock}
      />,
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

  const relativeFilter = (operator: string, offset: number, count: number, granularity: string) =>
    expect.objectContaining({
      operator,
      offset,
      count,
      anchor: undefined,
      attribute: expect.objectContaining({ granularity }),
    });

  beforeEach(() => {
    filterChangeHandlerMock.mockClear();
  });

  describe('with a non-relative filter', () => {
    const membersFilter = filterFactory.members(DM.Commerce.Date.Years, []);

    it('should render the default "last 1 month" state', () => {
      renderSection(membersFilter);

      expect(within(screen.getByLabelText('Type')).getByText('Last')).toBeInTheDocument();
      expect(screen.getByLabelText('Count')).toHaveValue(1);
      expect(within(screen.getByLabelText('Granularity')).getByText('Month')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('should emit the default filter when the section is selected', async () => {
      const { user } = renderSection(membersFilter, false);

      await user.click(screen.getByLabelText('Select button'));

      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        relativeFilter(DateOperators.Last, 1, 1, DateLevels.Months),
      );
    });

    it('should keep the original filter config', async () => {
      const { user } = renderSection(membersFilter, false);

      await user.click(screen.getByLabelText('Select button'));

      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({ guid: membersFilter.config.guid }),
        }),
      );
    });
  });

  describe('with an existing relative filter', () => {
    it('should render a "this" filter without count and include-current controls', () => {
      renderSection(filterFactory.dateRelativeTo(DM.Commerce.Date.Years, 0, 1));

      expect(within(screen.getByLabelText('Type')).getByText('This')).toBeInTheDocument();
      expect(within(screen.getByLabelText('Granularity')).getByText('Year')).toBeInTheDocument();
      expect(screen.queryByLabelText('Count')).not.toBeInTheDocument();
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('should render a "next" filter with offset 0 as including current', () => {
      renderSection(filterFactory.dateRelative(DM.Commerce.Date.Quarters, 0, 3));

      expect(within(screen.getByLabelText('Type')).getByText('Next')).toBeInTheDocument();
      expect(screen.getByLabelText('Count')).toHaveValue(3);
      expect(within(screen.getByLabelText('Granularity')).getByText('Quarter')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('should render a "last" filter with offset 1 as not including current', () => {
      renderSection(filterFactory.dateRelativeTo(DM.Commerce.Date.Months, 1, 6));

      expect(within(screen.getByLabelText('Type')).getByText('Last')).toBeInTheDocument();
      expect(screen.getByLabelText('Count')).toHaveValue(6);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });
  });

  describe('when editing', () => {
    const lastSixMonths = filterFactory.dateRelativeTo(DM.Commerce.Date.Months, 1, 6);

    it('should emit a "next" filter when the type changes to "Next"', async () => {
      const { user } = renderSection(lastSixMonths);

      await selectOption(user, 'Type', 'Next');

      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        relativeFilter(DateOperators.Next, 1, 6, DateLevels.Months),
      );
    });

    it('should emit a single current period and hide the extra controls for "This"', async () => {
      const { user } = renderSection(lastSixMonths);

      await selectOption(user, 'Type', 'This');

      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        relativeFilter(DateOperators.Last, 0, 1, DateLevels.Months),
      );
      expect(screen.queryByLabelText('Count')).not.toBeInTheDocument();
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('should emit offset 0 when "Including current" is checked, and 1 when unchecked', async () => {
      const { user } = renderSection(lastSixMonths);

      await user.click(screen.getByRole('checkbox'));
      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        relativeFilter(DateOperators.Last, 0, 6, DateLevels.Months),
      );

      await user.click(screen.getByRole('checkbox'));
      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        relativeFilter(DateOperators.Last, 1, 6, DateLevels.Months),
      );
    });

    it('should emit a new level attribute when the granularity changes', async () => {
      const { user } = renderSection(lastSixMonths);

      await selectOption(user, 'Granularity', 'Week');

      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        relativeFilter(DateOperators.Last, 1, 6, DateLevels.Weeks),
      );
      expect(within(screen.getByLabelText('Granularity')).getByText('Week')).toBeInTheDocument();
    });

    it('should emit the typed count', () => {
      renderSection(lastSixMonths);

      fireEvent.change(screen.getByLabelText('Count'), { target: { value: '12' } });

      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        relativeFilter(DateOperators.Last, 1, 12, DateLevels.Months),
      );
      expect(screen.getByLabelText('Count')).toHaveValue(12);
    });

    it.each(['', '0'])('should fall back to a count of 1 for "%s"', (value) => {
      renderSection(lastSixMonths);

      fireEvent.change(screen.getByLabelText('Count'), { target: { value } });

      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        relativeFilter(DateOperators.Last, 1, 1, DateLevels.Months),
      );
    });

    it('should keep the previous count for a non-integer value', () => {
      renderSection(lastSixMonths);

      fireEvent.change(screen.getByLabelText('Count'), { target: { value: '-3' } });

      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        relativeFilter(DateOperators.Last, 1, 6, DateLevels.Months),
      );
      expect(screen.getByLabelText('Count')).toHaveValue(6);
    });
  });
});
