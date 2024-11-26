import { MockedSisenseContextProvider } from '@/__test-helpers__';
import { FiltersPanel } from '@/filters';
import { fireEvent, render, screen } from '@testing-library/react';
import { Filter, filterFactory } from '@sisense/sdk-data';
import * as DM from '@/__test-helpers__/sample-ecommerce';

vi.mock('./filters-panel-tile', async () => {
  const FiltersPanelTile = ({
    filter,
    onChange,
  }: {
    filter: Filter;
    onChange: (filter: Filter) => void;
  }) => (
    <div data-testid={'filter-tile'}>
      FiltersPanelTile
      <button data-testid={'filter-tile-button'} onClick={() => onChange(filter)} />
    </div>
  );
  return {
    FiltersPanelTile,
  };
});

describe('FiltersPanel', () => {
  it('should render FiltersPanel with filters and trigger onFiltersChange', async () => {
    const filters = [
      filterFactory.members(DM.Brand.BrandID, ['1', '2', '3']),
      filterFactory.greaterThan(DM.Commerce.Cost, 100),
    ];
    const mockOnFiltersChange = vi.fn().mockImplementation((filters: Filter[]) => {
      // check that we receive the same filters as we passed to the FiltersPanel
      expect(filters).toEqual(filters);
    });

    render(
      <MockedSisenseContextProvider>
        <FiltersPanel filters={filters} onFiltersChange={mockOnFiltersChange} />
      </MockedSisenseContextProvider>,
    );

    // check that we render same amount of filters as we passed
    const filterTiles = screen.getAllByTestId('filter-tile');

    expect(filterTiles.length).toBe(2);

    // check that callback is called when filter is changed
    const filterTileOnChangeButtons = screen.getAllByTestId('filter-tile-button');
    fireEvent.click(filterTileOnChangeButtons[0]);

    expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);
  });
});
