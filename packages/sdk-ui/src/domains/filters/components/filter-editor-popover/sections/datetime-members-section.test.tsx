/** @vitest-environment jsdom */
import { DateLevels, filterFactory } from '@sisense/sdk-data';
import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import * as jaqlDateYears from '@/__mocks__/data/mock-jaql-date-years.json';
import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { SisenseContextProvider } from '@/infra/contexts/sisense-context/sisense-context-provider';
import { SisenseContextProviderProps } from '@/props';

import { FilterEditorContextProvider } from '../filter-editor-context.js';
import { DatetimeMembersSection } from './datetime-members-section.js';

const contextProviderProps: SisenseContextProviderProps = {
  url: mockUrl,
  token: mockToken,
  defaultDataSource: 'Sample ECommerce',
};

describe('DatetimeMembersSection', () => {
  const filterChangeHandlerMock = vi.fn();
  const dateFilter = filterFactory.members(DM.Commerce.Date.Years, ['2023-01-01T00:00:00']);

  beforeEach(() => {
    filterChangeHandlerMock.mockClear();
    server.use(
      http.post('*/api/datasources/Sample%20ECommerce/jaql', () =>
        HttpResponse.json(jaqlDateYears),
      ),
    );
  });

  it('should render datetime members section', async () => {
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{
            defaultDataSource: null,
            dataSources: [],
            parentFilters: [],
            membersOnlyMode: false,
            rankingVisible: true,
          }}
        >
          <DatetimeMembersSection
            filter={dateFilter}
            selected={true}
            multiSelectEnabled={true}
            onChange={filterChangeHandlerMock}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>,
    );

    const membersSection = await screen.findByLabelText('Members section');
    expect(membersSection).toBeInTheDocument();
  });

  it('should display all granularities when no parent filters are present', async () => {
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{
            defaultDataSource: null,
            dataSources: [],
            parentFilters: [],
            membersOnlyMode: false,
            rankingVisible: true,
          }}
        >
          <DatetimeMembersSection
            filter={dateFilter}
            selected={true}
            multiSelectEnabled={true}
            onChange={filterChangeHandlerMock}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>,
    );

    const membersSection = await screen.findByLabelText('Members section');
    const granularitySelect = within(membersSection).getByLabelText('Condition select');

    // Click to open the dropdown
    await user.click(granularitySelect);

    // All granularities should be available
    const dropdownContent = await screen.findByLabelText('Single-select content');

    const availableGranularities = [
      'Year',
      'Quarter',
      'Month',
      'Week',
      'Day',
      'Hour (aggregated)',
      '15-min (aggregated)',
    ];
    availableGranularities.forEach((granularity) => {
      expect(within(dropdownContent).getByText(granularity)).toBeInTheDocument();
    });
  });

  it('should filter out restricted granularities when parent filters are present', async () => {
    // Parent filters with Years and Quarters granularities
    const yearsAttribute = DM.Commerce.Date.Years;
    const quartersAttribute = {
      ...DM.Commerce.Date.Years,
      granularity: DateLevels.Quarters,
    };

    const parentFilters = [
      filterFactory.members(yearsAttribute, ['2023-01-01T00:00:00']),
      filterFactory.members(quartersAttribute, ['2023-Q1']),
    ];

    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{
            defaultDataSource: null,
            dataSources: [],
            parentFilters,
            membersOnlyMode: false,
            rankingVisible: true,
          }}
        >
          <DatetimeMembersSection
            filter={dateFilter}
            selected={true}
            multiSelectEnabled={true}
            onChange={filterChangeHandlerMock}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>,
    );

    const membersSection = await screen.findByLabelText('Members section');
    const granularitySelect = within(membersSection).getByLabelText('Condition select');

    // Click to open the dropdown
    await user.click(granularitySelect);

    // Years and Quarters should be filtered out, but other granularities should be available
    const dropdownContent = await screen.findByLabelText('Single-select content');

    const restrictedGranularities = ['Year', 'Quarter'];
    restrictedGranularities.forEach((granularity) => {
      expect(within(dropdownContent).queryByText(granularity)).not.toBeInTheDocument();
    });

    const availableGranularities = [
      'Month',
      'Week',
      'Day',
      'Hour (aggregated)',
      '15-min (aggregated)',
    ];
    availableGranularities.forEach((granularity) => {
      expect(within(dropdownContent).getByText(granularity)).toBeInTheDocument();
    });
  });

  it('should not filter granularities when parent filters have different attribute expressions', async () => {
    // Parent filters with different attribute expression
    const differentDateAttribute = {
      ...DM.Commerce.Date.Years,
      expression: '[OrderDate]',
      name: 'OrderDate',
    };

    const parentFilters = [filterFactory.members(differentDateAttribute, ['2023-01-01T00:00:00'])];

    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{
            defaultDataSource: null,
            dataSources: [],
            parentFilters,
            membersOnlyMode: false,
            rankingVisible: true,
          }}
        >
          <DatetimeMembersSection
            filter={dateFilter}
            selected={true}
            multiSelectEnabled={true}
            onChange={filterChangeHandlerMock}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>,
    );

    const membersSection = await screen.findByLabelText('Members section');
    const granularitySelect = within(membersSection).getByLabelText('Condition select');

    // Click to open the dropdown
    await user.click(granularitySelect);

    // All granularities should be available since parent filter has different attribute
    const dropdownContent = await screen.findByLabelText('Single-select content');

    const availableGranularities = [
      'Year',
      'Quarter',
      'Month',
      'Week',
      'Day',
      'Hour (aggregated)',
      '15-min (aggregated)',
    ];
    availableGranularities.forEach((granularity) => {
      expect(within(dropdownContent).getByText(granularity)).toBeInTheDocument();
    });
  });

  it('should render with multi-select enabled', async () => {
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{
            defaultDataSource: null,
            dataSources: [],
            parentFilters: [],
            membersOnlyMode: false,
            rankingVisible: true,
          }}
        >
          <DatetimeMembersSection
            filter={dateFilter}
            selected={true}
            multiSelectEnabled={true}
            onChange={filterChangeHandlerMock}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>,
    );

    const membersSection = await screen.findByLabelText('Members section');
    const multiSelect = within(membersSection).getByLabelText('Searchable multi-select');
    expect(multiSelect).toBeInTheDocument();
  });

  it('should render with single-select when multi-select is disabled', async () => {
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{
            defaultDataSource: null,
            dataSources: [],
            parentFilters: [],
            membersOnlyMode: false,
            rankingVisible: true,
          }}
        >
          <DatetimeMembersSection
            filter={dateFilter}
            selected={true}
            multiSelectEnabled={false}
            onChange={filterChangeHandlerMock}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>,
    );

    const membersSection = await screen.findByLabelText('Members section');
    const singleSelect = within(membersSection).getByLabelText('Searchable single-select');
    expect(singleSelect).toBeInTheDocument();
  });

  it('should change granularity and update filter', async () => {
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{
            defaultDataSource: null,
            dataSources: [],
            parentFilters: [],
            membersOnlyMode: false,
            rankingVisible: true,
          }}
        >
          <DatetimeMembersSection
            filter={dateFilter}
            selected={true}
            multiSelectEnabled={true}
            onChange={filterChangeHandlerMock}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>,
    );

    const membersSection = await screen.findByLabelText('Members section');
    const granularitySelect = within(membersSection).getByLabelText('Condition select');
    await user.click(granularitySelect);

    const dropdownContent = await screen.findByLabelText('Single-select content');
    await user.click(within(dropdownContent).getByText('Month'));

    // Should call onChange with updated filter
    expect(filterChangeHandlerMock).toHaveBeenCalled();
  });
  describe('at Day granularity', () => {
    const daysFilter = filterFactory.members(DM.Commerce.Date.Days, ['2013-11-04T00:00:00']);

    const daysSectionTree = (multiSelectEnabled: boolean) => (
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{
            defaultDataSource: null,
            dataSources: [],
            parentFilters: [],
            membersOnlyMode: false,
            rankingVisible: true,
          }}
        >
          <DatetimeMembersSection
            filter={daysFilter}
            selected={true}
            multiSelectEnabled={multiSelectEnabled}
            onChange={filterChangeHandlerMock}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>
    );

    const renderDaysSection = (multiSelectEnabled: boolean) => {
      const { user, rerender } = setup(daysSectionTree(multiSelectEnabled));

      /**
       * Opens the calendar popover, which starts on the selected member's month. Days 8-30 are
       * unique within a Nov 2013 grid, unlike the adjacent-month days it also renders.
       */
      const openCalendar = async (label: string) => {
        const membersSection = await screen.findByLabelText('Members section');
        await user.click(within(membersSection).getByLabelText(label));

        return screen.findByLabelText('date range filter calendar container');
      };

      return { openCalendar, user, rerender };
    };

    it('should keep a single member when multi-select is disabled', async () => {
      const { openCalendar, user } = renderDaysSection(false);

      const calendar = await openCalendar('Calendar single-select');
      await user.click(within(calendar).getByText('8'));
      await user.click(within(calendar).getByText('12'));

      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ members: ['2013-11-12T00:00:00'] }),
      );
    });

    it('should accumulate members when multi-select is enabled', async () => {
      const { openCalendar, user } = renderDaysSection(true);

      const calendar = await openCalendar('Calendar multi-select');
      await user.click(within(calendar).getByText('8'));
      await user.click(within(calendar).getByText('12'));

      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          members: ['2013-11-04T00:00:00', '2013-11-08T00:00:00', '2013-11-12T00:00:00'],
        }),
      );
    });

    /**
     * The calendar owns its "popover open" state, so this also pins down that toggling multiselect
     * swaps the selection mode on the mounted control instead of remounting it.
     */
    it('should switch the mounted calendar to single-select when multiselect is turned off', async () => {
      const { openCalendar, user, rerender } = renderDaysSection(true);

      const calendar = await openCalendar('Calendar multi-select');
      await user.click(within(calendar).getByText('8'));

      rerender(daysSectionTree(false));

      const membersSection = await screen.findByLabelText('Members section');
      expect(within(membersSection).getByLabelText('Calendar single-select')).toBeInTheDocument();
      expect(within(membersSection).queryByLabelText('Calendar multi-select')).toBeNull();

      // The popover stayed open across the switch, so the same calendar is still on screen.
      const stillOpenCalendar = await screen.findByLabelText(
        'date range filter calendar container',
      );
      await user.click(within(stillOpenCalendar).getByText('12'));

      expect(filterChangeHandlerMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ members: ['2013-11-12T00:00:00'] }),
      );
    });
  });
});
