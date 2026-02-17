import { useCallback, useRef } from 'react';

import { arrayMove } from '@dnd-kit/sortable';
import {
  DataSource,
  Filter,
  FilterRelations,
  isCascadingFilter,
  mergeFilters,
} from '@sisense/sdk-data';

import { DASHBOARD_HEADER_HEIGHT } from '@/domains/dashboarding/components/dashboard-header';
import { getDividerStyle } from '@/domains/dashboarding/utils';
import { FilterTile } from '@/domains/filters/components/filter-tile';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import styled from '@/infra/styled';
import { useDefaults } from '@/shared/hooks/use-defaults';
import {
  calculateNewRelations,
  combineFiltersAndRelations,
  splitFiltersAndRelations,
} from '@/shared/utils/filter-relations';

import { ReorderableList } from '../common/reorderable-list';
import { BORDER_COLOR, BORDER_THICKNESS, DEFAULT_FILTERS_PANEL_CONFIG } from './constants';
import { FilterRelationsTile } from './filter-relations-tile';
import { FiltersPanelHeader } from './filters-panel-header';
import {
  isFilterSupportEditing,
  useExistingFilterEditing,
} from './hooks/use-existing-filter-editing';
import { useNewFilterCreation } from './hooks/use-new-filter-adding';
import { FiltersPanelConfig } from './types';

const PanelWrapper = styled.div<Themable>`
  background-color: ${({ theme }) => theme.filter.panel.backgroundColor};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  ${({ theme }) =>
    (theme.filter.panel.borderWidth === 0 || theme.filter.panel.borderWidth === undefined) &&
    `border-left: ${getDividerStyle(
      theme.filter.panel.dividerLineColor,
      theme.filter.panel.dividerLineWidth,
    )};`}
  ${({ theme }) =>
    theme.filter.panel.borderWidth > 0 &&
    `border: ${getDividerStyle(theme.filter.panel.borderColor, theme.filter.panel.borderWidth)};`}
  width: fit-content;
  min-width: 240px;
  max-height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const PanelBody = styled.div`
  background-color: transparent;
  max-height: calc(100% - ${DASHBOARD_HEADER_HEIGHT}px);
  overflow-y: auto;
  flex-grow: 1;
`;

const PanelBodyInner = styled.div`
  padding: 0px 12px 8px 10px;
`;

const FilterDraggingElement = styled.div<Themable>`
  background-color: ${({ theme }) => theme.general.backgroundColor};
  border: ${BORDER_THICKNESS} solid ${BORDER_COLOR};
  color: ${({ theme }) => theme.typography.primaryTextColor};
  padding: 4px 4px 4px 27px;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/**
 * Props of the {@link FiltersPanel} component
 *
 */
export interface FiltersPanelProps {
  /** Array of filters to display */
  filters: Filter[] | FilterRelations;
  /** Callback to handle changes in filters */
  onFiltersChange: (filters: Filter[] | FilterRelations) => void;
  /** Default data source used for filter tiles */
  defaultDataSource?: DataSource;
  /**
   * All data sources available for filter tiles
   *
   * @internal
   */
  dataSources?: DataSource[];
  /** The configuration for the filters panel */
  config?: FiltersPanelConfig;
}

/**
 * Filters panel component that renders a list of filter tiles
 *
 * @example
 * Here's how to render a filters panel with a set of filters.
 * ```tsx
 * import { useState } from 'react';
 * import { FiltersPanel } from '@sisense/sdk-ui';
 * import { filterFactory, type Filter, type FilterRelations } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce-model';
 *
 * export function Example() {
 *   const [filters, setFilters] = useState<Filter[]>([
 *     filterFactory.members(DM.Commerce.Gender, ['Male', 'Female']),
 *     filterFactory.members(DM.Commerce.AgeRange, ['0-18', '19-24']),
 *   ]);
 *
 *   const handleFiltersChange = (updatedFilters: Filter[] | FilterRelations) => {
 *     console.log('Filters changed:', updatedFilters);
 *   };
 *
 *   return (
 *     <FiltersPanel
 *       filters={filters}
 *       defaultDataSource={DM.DataSource}
 *       onFiltersChange={handleFiltersChange}
 *     />
 *   );
 * }
 * ```
 *
 * @group Filter Tiles
 */
export const FiltersPanel = asSisenseComponent({
  componentName: 'FiltersPanel',
})(
  ({
    filters: filtersOrFilterRelations,
    onFiltersChange,
    defaultDataSource,
    dataSources,
    config: propConfig,
  }: FiltersPanelProps) => {
    const filtersPanelRef = useRef<HTMLDivElement>(null);
    const filterTilesRef = useRef<HTMLElement[]>([]);
    const { themeSettings } = useThemeContext();
    const { filters, relations } = splitFiltersAndRelations(filtersOrFilterRelations);
    const config = useDefaults(propConfig, DEFAULT_FILTERS_PANEL_CONFIG);

    const handleFilterChange = useCallback(
      (changedFilter: Filter) => {
        if (!filters) return;
        const newFilters: Filter[] = filters.map((originalFilter) =>
          originalFilter.config.guid === changedFilter.config.guid ? changedFilter : originalFilter,
        );
        const newRelations = calculateNewRelations(filters, relations, newFilters);
        onFiltersChange(combineFiltersAndRelations(newFilters, newRelations));
      },
      [filters, relations, onFiltersChange],
    );

    const handleFilterReorder = useCallback(
      (fromIndex: number, toIndex: number) => {
        const newFilters = arrayMove(filters, fromIndex, toIndex);
        const newRelations = calculateNewRelations(filters, relations, newFilters);
        onFiltersChange(combineFiltersAndRelations(newFilters, newRelations));
      },
      [onFiltersChange, filters, relations],
    );

    const handleFilterAdd = useCallback(
      (newFilter: Filter) => {
        if (!filters) return;
        const newFilters = mergeFilters(filters, [newFilter]);
        const newRelations = calculateNewRelations(filters, relations, newFilters);
        onFiltersChange(combineFiltersAndRelations(newFilters, newRelations));
      },
      [filters, relations, onFiltersChange],
    );

    const handleFilterDelete = useCallback(
      (filter: Filter) => {
        if (!filters) return;
        const newFilters = filters.filter((f) => f.config.guid !== filter.config.guid);
        const newRelations = calculateNewRelations(filters, relations, newFilters);
        onFiltersChange(combineFiltersAndRelations(newFilters, newRelations));
      },
      [filters, onFiltersChange, relations],
    );

    const { ExistingFilterEditor, startEditingFilter } = useExistingFilterEditing({
      onFilterChanged: handleFilterChange,
      defaultDataSource: defaultDataSource,
      config: config?.actions?.editFilter,
    });

    const { NewFilterCreator, startFilterCreation } = useNewFilterCreation({
      dataSources: dataSources ? dataSources : defaultDataSource ? [defaultDataSource] : [],
      onFilterCreated: handleFilterAdd,
      defaultDataSource: defaultDataSource,
      config: config?.actions?.addFilter,
      disabledAttributes: filters.flatMap((filter) =>
        isCascadingFilter(filter)
          ? filter.filters.map((levelFilter) => levelFilter.attribute)
          : [filter.attribute],
      ),
    });

    return (
      <PanelWrapper theme={themeSettings} ref={filtersPanelRef}>
        <FiltersPanelHeader
          onAddFilterButtonClick={useCallback(
            () => startFilterCreation(filtersPanelRef.current!),
            [startFilterCreation],
          )}
          shouldShowAddFilterButton={config?.actions?.addFilter?.enabled}
        />
        <PanelBody>
          <PanelBodyInner>
            {relations && <FilterRelationsTile relations={relations} filters={filters} />}
            {<ExistingFilterEditor />}
            {<NewFilterCreator />}
            <ReorderableList
              disabled={!config?.actions?.reorderFilters?.enabled}
              items={filters.map((filter) => filter.config.guid)}
              onReorder={handleFilterReorder}
              renderItem={({ index, withDragHandle, isDragging }) => {
                const filter = filters[index];

                if (filter && isDragging) {
                  return withDragHandle(
                    <FilterDraggingElement theme={themeSettings}>
                      {isCascadingFilter(filter)
                        ? filter.filters
                            .map((levelFilter) => levelFilter.attribute.title)
                            .join(', ')
                        : filter.attribute.title}
                    </FilterDraggingElement>,
                  );
                }

                return filter ? (
                  <div
                    className="csdk-mt-[6px]"
                    ref={(el) => {
                      filterTilesRef.current[index] = el!;
                    }}
                  >
                    <FilterTile
                      onDelete={
                        config?.actions?.deleteFilter?.enabled
                          ? () => handleFilterDelete(filter)
                          : undefined
                      }
                      filter={filter}
                      onChange={(newFilter) => handleFilterChange(newFilter!)}
                      defaultDataSource={defaultDataSource}
                      renderHeaderTitle={withDragHandle}
                      onEdit={
                        config?.actions?.editFilter?.enabled && isFilterSupportEditing(filter)
                          ? (levelIndex) =>
                              startEditingFilter(filterTilesRef.current[index], filter, levelIndex)
                          : undefined
                      }
                    />
                  </div>
                ) : null;
              }}
            />
          </PanelBodyInner>
        </PanelBody>
      </PanelWrapper>
    );
  },
);
