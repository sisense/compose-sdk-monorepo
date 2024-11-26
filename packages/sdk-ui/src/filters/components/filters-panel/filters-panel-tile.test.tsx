/** @vitest-environment jsdom */
import { findByLabelText, findByText, render } from '@testing-library/react';
import {
  DateRangeFilter,
  RelativeDateFilter,
  createAttribute,
  LevelAttribute,
  filterFactory,
  measureFactory,
  Filter,
} from '@sisense/sdk-data';
import { vi } from 'vitest';
import { FiltersPanelTile } from './filters-panel-tile';
import { MockedSisenseContextProvider } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';

const mockOnChange = vi.fn();

const mockAttribute = createAttribute({
  name: 'Test Revenue',
  type: 'numeric-attribute',
  expression: '[Commerce.Revenue]',
});

describe('FiltersPanelTile', () => {
  // tries to execute query
  // TODO: mock the query execution or redesign the test
  it.skip('renders MemberFilterTile for MembersFilter', async () => {
    const mockFilter = filterFactory.members(mockAttribute, ['1', '2', '3']);
    const { container } = render(
      <MockedSisenseContextProvider>
        <FiltersPanelTile filter={mockFilter} onChange={mockOnChange} />
      </MockedSisenseContextProvider>,
    );
    const tile = await findByLabelText(container, mockAttribute.name);
    expect(tile).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  // tries to execute query
  // TODO: mock the query execution or redesign the test
  it.skip('renders DateRangeFilterTile for DateRangeFilter', async () => {
    const mockFilter = new DateRangeFilter(
      mockAttribute as LevelAttribute,
      '2021-01-01',
      '2021-12-31',
    );
    const { container } = render(
      <MockedSisenseContextProvider>
        <FiltersPanelTile filter={mockFilter} onChange={mockOnChange} />
      </MockedSisenseContextProvider>,
    );
    const tile = await findByText(container, mockAttribute.name);
    expect(tile).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('renders RelativeDateFilterTile for RelativeDateFilter', async () => {
    const mockFilter = new RelativeDateFilter(DM.Commerce.Date.Years, 0, 1);
    const { container } = render(
      <MockedSisenseContextProvider>
        <FiltersPanelTile filter={mockFilter} onChange={mockOnChange} />
      </MockedSisenseContextProvider>,
    );
    const tile = await findByText(container, DM.Commerce.Date.Years.name);
    expect(tile).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('renders locked RelativeDateFilter component', async () => {
    const mockFilter = new RelativeDateFilter(DM.Commerce.Date.Years, 0, 1) as Filter;
    mockFilter.locked = true;
    const { container } = render(
      <MockedSisenseContextProvider>
        <FiltersPanelTile filter={mockFilter} onChange={mockOnChange} />
      </MockedSisenseContextProvider>,
    );
    const tile = await findByText(container, DM.Commerce.Date.Years.name);
    expect(tile).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  // throws 'Cannot convert object to primitive value'
  // TODO: investigate the error and fix the test
  it.skip('renders CriteriaFilterTile for MeasureFilter', async () => {
    const mockFilter = filterFactory.measureEquals(measureFactory.sum(mockAttribute), 100);
    const { container } = render(
      <MockedSisenseContextProvider>
        <FiltersPanelTile filter={mockFilter} onChange={mockOnChange} />
      </MockedSisenseContextProvider>,
    );
    const tile = await findByLabelText(container, mockAttribute.name);
    expect(tile).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('renders CriteriaFilterTile for NumericFilter', async () => {
    const mockFilter = filterFactory.greaterThan(mockAttribute, 100);
    const { container } = render(
      <MockedSisenseContextProvider>
        <FiltersPanelTile filter={mockFilter} onChange={mockOnChange} />
      </MockedSisenseContextProvider>,
    );
    const tile = await findByText(container, mockAttribute.name);
    expect(tile).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('renders locked CriteriaFilterTile', async () => {
    const mockFilter = filterFactory.greaterThan(mockAttribute, 100);
    mockFilter.locked = true;
    const { container } = render(
      <MockedSisenseContextProvider>
        <FiltersPanelTile filter={mockFilter} onChange={mockOnChange} />
      </MockedSisenseContextProvider>,
    );
    const tile = await findByText(container, mockAttribute.name);
    expect(tile).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('renders CriteriaFilterTile for TextFilter', async () => {
    const mockFilter = filterFactory.doesntStartWith(mockAttribute, '100');
    const { container } = render(
      <MockedSisenseContextProvider>
        <FiltersPanelTile filter={mockFilter} onChange={mockOnChange} />
      </MockedSisenseContextProvider>,
    );
    const tile = await findByText(container, mockAttribute.name);
    expect(tile).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('renders CriteriaFilterTile for RankingFilter', async () => {
    const mockFilter = filterFactory.topRanking(
      mockAttribute,
      measureFactory.average(mockAttribute),
      10,
    );
    const { container } = render(
      <MockedSisenseContextProvider>
        <FiltersPanelTile filter={mockFilter} onChange={mockOnChange} />
      </MockedSisenseContextProvider>,
    );
    const tile = await findByText(container, mockAttribute.name);
    expect(tile).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('renders CustomFilterTile for advnced filter type', async () => {
    const mockFilter = filterFactory.customFilter(mockAttribute, {});
    const { container } = render(
      <MockedSisenseContextProvider>
        <FiltersPanelTile filter={mockFilter} onChange={mockOnChange} />
      </MockedSisenseContextProvider>,
    );
    const tile = await findByText(container, mockAttribute.name);
    expect(tile).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('renders FilterTile for unsupported filter type', async () => {
    const mockFilter = { attribute: { name: 'Unsupported Filter' } } as Filter;
    const { container } = render(
      <MockedSisenseContextProvider>
        <FiltersPanelTile filter={mockFilter} onChange={mockOnChange} />
      </MockedSisenseContextProvider>,
    );
    const tile = await findByText(container, 'unsupportedFilterMessage');
    expect(tile).toBeTruthy();
    expect(container).toMatchSnapshot();
  });
});
