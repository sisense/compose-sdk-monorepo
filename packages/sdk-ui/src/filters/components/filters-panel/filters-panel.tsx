import { useCallback, useRef } from 'react';

import {
  DataSource,
  Filter,
  FilterRelations,
  isCascadingFilter,
  mergeFilters,
} from '@sisense/sdk-data';

import { useDefaults } from '@/common/hooks/use-defaults';
import { DASHBOARD_HEADER_HEIGHT } from '@/dashboard/components/dashboard-header';
import { getDividerStyle } from '@/dashboard/utils';
import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';
import { FilterTile } from '@/filters/components/filter-tile';
import styled from '@/styled';
import { useThemeContext } from '@/theme-provider';
import { Themable } from '@/theme-provider/types';
import {
  calculateNewRelations,
  combineFiltersAndRelations,
  splitFiltersAndRelations,
} from '@/utils/filter-relations';

import { DEFAULT_FILTERS_PANEL_CONFIG } from './constants';
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
`;

const PanelBody = styled.div`
  background-color: transparent;
  max-height: calc(100% - ${DASHBOARD_HEADER_HEIGHT}px);
  overflow-y: auto;
`;

const PanelBodyInner = styled.div`
  padding: 0px 12px 8px 10px;
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
            {filters?.map((filter, index) => (
              <div
                className="csdk-mt-[6px]"
                key={filter.config.guid}
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
                  key={filter.config.guid}
                  filter={filter}
                  onChange={(newFilter) => handleFilterChange(newFilter!)}
                  defaultDataSource={defaultDataSource}
                  onEdit={
                    config?.actions?.editFilter?.enabled && isFilterSupportEditing(filter)
                      ? (levelIndex) =>
                          startEditingFilter(filterTilesRef.current[index], filter, levelIndex)
                      : undefined
                  }
                />
              </div>
            ))}
            {<ExistingFilterEditor />}
            {<NewFilterCreator />}
          </PanelBodyInner>
        </PanelBody>
      </PanelWrapper>
    );
  },
);
