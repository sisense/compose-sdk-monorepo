/** @vitest-environment jsdom */
import { DateLevels, filterFactory } from '@sisense/sdk-data';
import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import * as jaqlDateYears from '@/__mocks__/data/mock-jaql-date-years.json';
import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { SisenseContextProviderProps } from '@/props';
import { SisenseContextProvider } from '@/sisense-context/sisense-context-provider';

import { FilterEditorContextProvider } from '../../../filter-editor-context';
import { DatetimeExcludeConditionForm } from './datetime-exclude-condition-form';

const contextProviderProps: SisenseContextProviderProps = {
  url: mockUrl,
  token: mockToken,
  defaultDataSource: 'Sample ECommerce',
};

describe('DatetimeExcludeConditionForm', () => {
  const filterChangeHandlerMock = vi.fn();
  const excludeFilter = filterFactory.members(DM.Commerce.Date.Years, ['2023-01-01T00:00:00'], {
    excludeMembers: true,
  });

  beforeEach(() => {
    filterChangeHandlerMock.mockClear();
    server.use(
      http.post('*/api/datasources/Sample%20ECommerce/jaql', () =>
        HttpResponse.json(jaqlDateYears),
      ),
    );
  });

  it('should render datetime exclude condition form', async () => {
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{ defaultDataSource: null, parentFilters: [], membersOnlyMode: false }}
        >
          <DatetimeExcludeConditionForm
            filter={excludeFilter}
            multiSelectEnabled={true}
            onChange={filterChangeHandlerMock}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>,
    );

    const granularitySelect = await screen.findByLabelText('Condition select');
    expect(granularitySelect).toBeInTheDocument();
  });

  it('should display all granularities when no parent filters are present', async () => {
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{ defaultDataSource: null, parentFilters: [], membersOnlyMode: false }}
        >
          <DatetimeExcludeConditionForm
            filter={excludeFilter}
            multiSelectEnabled={true}
            onChange={filterChangeHandlerMock}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>,
    );

    const granularitySelect = await screen.findByLabelText('Condition select');
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
    } as any;

    const parentFilters = [
      filterFactory.members(yearsAttribute, ['2023-01-01T00:00:00']),
      filterFactory.members(quartersAttribute, ['2023-Q1']),
    ];

    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{ defaultDataSource: null, parentFilters, membersOnlyMode: false }}
        >
          <DatetimeExcludeConditionForm
            filter={excludeFilter}
            multiSelectEnabled={true}
            onChange={filterChangeHandlerMock}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>,
    );

    const granularitySelect = await screen.findByLabelText('Condition select');
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
    } as any;

    const parentFilters = [filterFactory.members(differentDateAttribute, ['2023-01-01T00:00:00'])];

    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{ defaultDataSource: null, parentFilters, membersOnlyMode: false }}
        >
          <DatetimeExcludeConditionForm
            filter={excludeFilter}
            multiSelectEnabled={true}
            onChange={filterChangeHandlerMock}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>,
    );

    const granularitySelect = await screen.findByLabelText('Condition select');
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

  it('should use filter granularity when parent filters are present (shouldMatchFilterGranularity)', async () => {
    // Test that when parent filters exist, the form uses the filter's existing granularity
    // Create proper months-level filter
    const monthsFilter = filterFactory.members(DM.Commerce.Date.Months, ['2023-01'], {
      excludeMembers: true,
    });

    const parentFilters = [filterFactory.members(DM.Commerce.Date.Years, ['2023-01-01T00:00:00'])];

    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{ defaultDataSource: null, parentFilters, membersOnlyMode: false }}
        >
          <DatetimeExcludeConditionForm
            filter={monthsFilter}
            multiSelectEnabled={true}
            onChange={filterChangeHandlerMock}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>,
    );

    const granularitySelect = await screen.findByLabelText('Condition select');
    const selectedValue = within(granularitySelect).getByLabelText('Value').textContent;

    // Should display the filter's current granularity (Month)
    expect(selectedValue).toBe('Month');
  });

  it('should default to Years granularity when no parent filters are present', async () => {
    // Test that when no parent filters exist, the form defaults to Years granularity
    const basicFilter = filterFactory.members(DM.Commerce.Date.Years, ['2023-01-01T00:00:00'], {
      excludeMembers: true,
    });

    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{ defaultDataSource: null, parentFilters: [], membersOnlyMode: false }}
        >
          <DatetimeExcludeConditionForm
            filter={basicFilter}
            multiSelectEnabled={true}
            onChange={filterChangeHandlerMock}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>,
    );

    const granularitySelect = await screen.findByLabelText('Condition select');
    const selectedValue = within(granularitySelect).getByLabelText('Value').textContent;

    // Should default to Year when no parent filters
    expect(selectedValue).toBe('Year');
  });

  it('should render with multi-select enabled', async () => {
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{ defaultDataSource: null, parentFilters: [], membersOnlyMode: false }}
        >
          <DatetimeExcludeConditionForm
            filter={excludeFilter}
            multiSelectEnabled={true}
            onChange={filterChangeHandlerMock}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>,
    );

    const multiSelect = await screen.findByLabelText('Searchable multi-select');
    expect(multiSelect).toBeInTheDocument();
  });

  it('should render with single-select when multi-select is disabled', async () => {
    setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{ defaultDataSource: null, parentFilters: [], membersOnlyMode: false }}
        >
          <DatetimeExcludeConditionForm
            filter={excludeFilter}
            multiSelectEnabled={false}
            onChange={filterChangeHandlerMock}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>,
    );

    const singleSelect = await screen.findByLabelText('Searchable single-select');
    expect(singleSelect).toBeInTheDocument();
  });

  it('should change granularity and update filter', async () => {
    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{ defaultDataSource: null, parentFilters: [], membersOnlyMode: false }}
        >
          <DatetimeExcludeConditionForm
            filter={excludeFilter}
            multiSelectEnabled={true}
            onChange={filterChangeHandlerMock}
          />
        </FilterEditorContextProvider>
      </SisenseContextProvider>,
    );

    const granularitySelect = await screen.findByLabelText('Condition select');
    await user.click(granularitySelect);

    const dropdownContent = await screen.findByLabelText('Single-select content');
    await user.click(within(dropdownContent).getByText('Month'));

    // Should call onChange with updated filter
    expect(filterChangeHandlerMock).toHaveBeenCalled();
  });
});
