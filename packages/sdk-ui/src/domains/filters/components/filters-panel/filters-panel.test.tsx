import type { Attribute, CascadingFilter, Filter } from '@sisense/sdk-data';
import { filterFactory, isMembersFilter } from '@sisense/sdk-data';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MockedSisenseContextProvider, setup } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';

import { FiltersPanel } from './filters-panel.js';

vi.mock('@/domains/filters/components/filter-tile', () => {
  const FilterTile = ({
    filter,
    onChange,
    onEdit,
  }: {
    filter: Filter;
    onChange: (filter: Filter) => void;
    onEdit: (levelIndex?: number) => void;
  }) => {
    return (
      <div data-testid="filter-tile">
        FilterTile
        {/* Button to trigger inline editing */}
        <button data-testid="inline-edit-filter-tile-button" onClick={() => onChange(filter)} />
        <button data-testid="edit-filter-button" onClick={() => onEdit()} />
        <button data-testid="edit-filter-level-button" onClick={() => onEdit(1)} />
      </div>
    );
  };
  return { FilterTile };
});

vi.mock('@/domains/data-browser/add-filter-popover/add-filter-data-browser', () => {
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

vi.mock('@/domains/filters/components/filter-editor-popover/filter-editor-popover', () => {
  const FilterEditorPopoverMock = ({
    filter,
    onChange,
  }: {
    filter?: Filter | null;
    onChange?: (filter: Filter) => void;
  }) => {
    return (
      <div data-testid="filter-editor-popover" data-edited-attribute={filter?.attribute.name}>
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
        filterFactory.members(DM.Brand.BrandID, ['1', '2'], { guid: 'test-id-1' }),
        filterFactory.greaterThan(DM.Commerce.Cost, 100, { guid: 'test-id-2' }),
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

    it('preserves hidden filters in the write-back when a visible filter changes', async () => {
      const hidden = filterFactory.members(DM.Brand.BrandID, ['1'], { guid: 'hidden-id' });
      const visible = filterFactory.greaterThan(DM.Commerce.Cost, 100, { guid: 'visible-id' });
      const onFiltersChange = vi.fn();

      render(
        <MockedSisenseContextProvider>
          <FiltersPanel
            filters={[hidden, visible]}
            hiddenFilterIds={['hidden-id']}
            onFiltersChange={onFiltersChange}
            dataSources={[DM.DataSource]}
          />
        </MockedSisenseContextProvider>,
      );

      // Only the non-hidden filter renders a tile.
      await waitFor(() => expect(screen.getAllByTestId('filter-tile')).toHaveLength(1));
      fireEvent.click(screen.getByTestId('inline-edit-filter-tile-button'));

      expect(onFiltersChange).toHaveBeenCalledOnce();
      const payload = onFiltersChange.mock.calls[0][0] as Filter[];
      // The hidden filter must survive the write-back, not be dropped.
      expect(payload.map((f) => f.config.guid)).toEqual(['hidden-id', 'visible-id']);
    });
  });

  describe('adding new filter', () => {
    it('opens and closes the "Add filter" popover', async () => {
      render(
        <MockedSisenseContextProvider>
          <FiltersPanel
            filters={[filterFactory.members(DM.Brand.BrandID, ['1', '2'], { guid: 'test-id' })]}
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
            filters={[filterFactory.members(DM.Brand.BrandID, ['1', '2'], { guid: 'test-id' })]}
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
        // cannot use snapshot due to random guid of the new filter
        // expect(onFiltersChange.mock.calls[0][0]).toMatchSnapshot();
        expect(onFiltersChange.mock.calls[0][0]).toHaveLength(2);
      });
    });
    it('shows error when no data sources are available', async () => {
      render(
        <MockedSisenseContextProvider>
          <FiltersPanel
            filters={[filterFactory.members(DM.Brand.BrandID, ['1', '2'], { guid: 'test-id' })]}
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
      const filters = [filterFactory.members(DM.Brand.BrandID, ['1', '2'], { guid: 'test-id' })];
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

    it('edits a single cascading filter level and writes back the whole cascading filter', async () => {
      const cascadingFilter = filterFactory.cascading(
        [
          filterFactory.members(DM.Commerce.Gender, ['Female'], { guid: 'gender' }),
          filterFactory.members(DM.Commerce.AgeRange, ['0-18'], { guid: 'age' }),
          filterFactory.members(DM.Commerce.Condition, ['New'], { guid: 'condition' }),
        ],
        { guid: 'cascading' },
      );
      const onFiltersChange = vi.fn();
      const { user } = setup(
        <MockedSisenseContextProvider>
          <FiltersPanel
            filters={[cascadingFilter]}
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

      await user.click(await screen.findByTestId('edit-filter-level-button'));

      const popover = await screen.findByTestId('filter-editor-popover');
      expect(popover).toHaveAttribute('data-edited-attribute', DM.Commerce.AgeRange.name);

      await user.click(screen.getByTestId('apply-button'));

      await waitFor(() => expect(onFiltersChange).toHaveBeenCalledOnce());
      const [newFilter] = onFiltersChange.mock.calls[0][0] as CascadingFilter[];
      expect(newFilter.config.guid).toBe('cascading');
      expect(newFilter.filters.map((filter) => filter.config.guid)).toEqual([
        'gender',
        'age',
        'condition',
      ]);
      const [, , bottom] = newFilter.filters;
      expect(isMembersFilter(bottom) && bottom.members).toEqual([]);
    });
  });
});
