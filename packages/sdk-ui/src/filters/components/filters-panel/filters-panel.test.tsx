import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MockedSisenseContextProvider } from '@/__test-helpers__';
import { Attribute, Filter, filterFactory } from '@sisense/sdk-data';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { FiltersPanel } from './filters-panel';

vi.mock('@/filters/components/filter-tile', () => {
  const FilterTile = ({
    filter,
    onChange,
    onEdit,
  }: {
    filter: Filter;
    onChange: (filter: Filter) => void;
    onEdit: (filter: Filter) => void;
  }) => {
    return (
      <div data-testid="filter-tile">
        FilterTile
        {/* Button to trigger inline editing */}
        <button data-testid="inline-edit-filter-tile-button" onClick={() => onChange(filter)} />
        <button data-testid="edit-filter-button" onClick={() => onEdit(filter)} />
      </div>
    );
  };
  return { FilterTile };
});

vi.mock('@/data-browser/add-filter-popover/add-filter-data-browser', () => {
  const AddFilterDataBrowserMock = ({
    onAttributeClick,
  }: {
    onAttributeClick: (attribute: Attribute) => void;
  }) => {
    return (
      <div data-testid="add-filter-data-browser-mock">
        AddFilterDataBrowser
        <button
          data-testid="select-some-attribute-button"
          onClick={() => onAttributeClick(DM.Commerce.AgeRange)}
        >
          Select some attribute
        </button>
      </div>
    );
  };
  return { AddFilterDataBrowser: AddFilterDataBrowserMock };
});

vi.mock('@/filters/components/filter-editor-popover/filter-editor-popover', () => {
  const FilterEditorPopoverMock = ({
    filter,
    onChange,
  }: {
    filter?: Filter | null;
    onChange?: (filter: Filter) => void;
  }) => {
    return (
      <div data-testid="filter-editor-popover">
        FilterEditorPopover
        <button
          data-testid="apply-button"
          onClick={() => {
            if (filter && onChange) {
              onChange(filter);
            }
          }}
        >
          Apply
        </button>
      </div>
    );
  };
  return { FilterEditorPopover: FilterEditorPopoverMock };
});

describe('FiltersPanel', () => {
  describe('FiltersPanel — basic', () => {
    it('renders filters and triggers onFiltersChange', async () => {
      const filters = [
        filterFactory.members(DM.Brand.BrandID, ['1', '2']),
        filterFactory.greaterThan(DM.Commerce.Cost, 100),
      ];
      const onFiltersChange = vi.fn();

      render(
        <MockedSisenseContextProvider>
          <FiltersPanel
            filters={filters}
            onFiltersChange={onFiltersChange}
            dataSources={[DM.DataSource]}
          />
        </MockedSisenseContextProvider>,
      );

      await waitFor(() => expect(screen.getAllByTestId('filter-tile')).toHaveLength(2));
      fireEvent.click(screen.getAllByTestId('inline-edit-filter-tile-button')[0]);
      expect(onFiltersChange).toHaveBeenCalledOnce();
      expect(onFiltersChange.mock.calls[0][0]).toMatchSnapshot();
    });
  });

  describe('adding new filter', () => {
    it('opens and closes the "Add filter" popover', async () => {
      render(
        <MockedSisenseContextProvider>
          <FiltersPanel
            filters={[filterFactory.members(DM.Brand.BrandID, ['1', '2'])]}
            onFiltersChange={vi.fn()}
            dataSources={[DM.DataSource]}
            config={{
              actions: {
                addFilter: {
                  enabled: true,
                },
              },
            }}
          />
        </MockedSisenseContextProvider>,
      );

      const addFilterButton = await screen.findByTestId('add-filter-button');
      fireEvent.click(addFilterButton);

      await waitFor(() => {
        expect(screen.getByTestId('add-filter-popover')).toBeInTheDocument();
        expect(screen.getByTestId('add-filter-data-browser-mock')).toBeInTheDocument();
      });

      const popoverCloseButton = screen.getByTestId('popover-close-button');
      fireEvent.click(popoverCloseButton);
      await waitFor(() => {
        expect(screen.queryByTestId('add-filter-popover')).not.toBeInTheDocument();
      });
    });
    it('creates empty filter on attribute selection, opens filter editor, and after applying updates the filters list', async () => {
      const onFiltersChange = vi.fn();
      render(
        <MockedSisenseContextProvider>
          <FiltersPanel
            filters={[filterFactory.members(DM.Brand.BrandID, ['1', '2'])]}
            onFiltersChange={onFiltersChange}
            dataSources={[DM.DataSource]}
            config={{
              actions: {
                addFilter: {
                  enabled: true,
                },
                editFilter: {
                  enabled: true,
                },
              },
            }}
          />
        </MockedSisenseContextProvider>,
      );

      const addFilterButton = await screen.findByTestId('add-filter-button');
      fireEvent.click(addFilterButton);

      const selectAttributeButton = await screen.findByTestId('select-some-attribute-button');
      fireEvent.click(selectAttributeButton);

      await waitFor(() => {
        expect(screen.getByTestId('filter-editor-popover')).toBeInTheDocument();
      });

      const applyButton = screen.getByTestId('apply-button');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenCalledOnce();
        expect(onFiltersChange.mock.calls[0][0]).toMatchSnapshot();
      });
    });
    it('shows error when no data sources are available', async () => {
      render(
        <MockedSisenseContextProvider>
          <FiltersPanel
            filters={[filterFactory.members(DM.Brand.BrandID, ['1', '2'])]}
            onFiltersChange={vi.fn()}
            dataSources={undefined}
            config={{
              actions: {
                addFilter: {
                  enabled: true,
                },
              },
            }}
          />
        </MockedSisenseContextProvider>,
      );

      const addFilterButton = await screen.findByTestId('add-filter-button');
      fireEvent.click(addFilterButton);

      await waitFor(() => {
        expect(screen.getByLabelText('error-box')).toBeInTheDocument();
      });
    });
  });
  describe('editing existing filter', () => {
    it('opens filter editor, and after applying updates the filters list', async () => {
      const filters = [filterFactory.members(DM.Brand.BrandID, ['1', '2'])];
      const onFiltersChange = vi.fn();
      render(
        <MockedSisenseContextProvider>
          <FiltersPanel
            filters={filters}
            onFiltersChange={onFiltersChange}
            config={{
              actions: {
                editFilter: {
                  enabled: true,
                },
              },
            }}
          />
        </MockedSisenseContextProvider>,
      );

      const editFilterButton = await screen.findByTestId('edit-filter-button');
      fireEvent.click(editFilterButton);

      await waitFor(() => {
        expect(screen.getByTestId('filter-editor-popover')).toBeInTheDocument();
      });

      const applyButton = screen.getByTestId('apply-button');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenCalledOnce();
        expect(onFiltersChange.mock.calls[0][0]).toMatchSnapshot();
      });
    });
  });
});
