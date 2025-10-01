/** @vitest-environment jsdom */
import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { filterFactory, DateLevels } from '@ethings-os/sdk-data';
import { setup } from '@/__test-helpers__';
import { DatetimeMembersSection } from './datetime-members-section';
import { SisenseContextProvider } from '@/sisense-context/sisense-context-provider';
import { SisenseContextProviderProps } from '@/props';
import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import { FilterEditorContextProvider } from '../filter-editor-context';
import * as jaqlDateYears from '@/__mocks__/data/mock-jaql-date-years.json';
import * as DM from '@/__test-helpers__/sample-ecommerce';

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
          value={{ defaultDataSource: null, parentFilters: [], membersOnlyMode: false }}
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
          value={{ defaultDataSource: null, parentFilters: [], membersOnlyMode: false }}
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
    } as any;

    const parentFilters = [filterFactory.members(differentDateAttribute, ['2023-01-01T00:00:00'])];

    const { user } = setup(
      <SisenseContextProvider {...contextProviderProps}>
        <FilterEditorContextProvider
          value={{ defaultDataSource: null, parentFilters, membersOnlyMode: false }}
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
          value={{ defaultDataSource: null, parentFilters: [], membersOnlyMode: false }}
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
          value={{ defaultDataSource: null, parentFilters: [], membersOnlyMode: false }}
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
          value={{ defaultDataSource: null, parentFilters: [], membersOnlyMode: false }}
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
});
