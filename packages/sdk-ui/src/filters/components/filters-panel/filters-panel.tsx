import { useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import { DataSource, Filter, FilterRelations, mergeFilters } from '@sisense/sdk-data';
import { FilterTile } from '@/filters/components/filter-tile';
import { Themable } from '@/theme-provider/types';
import { useThemeContext } from '@/theme-provider';
import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';
import { DASHBOARD_HEADER_HEIGHT } from '@/dashboard/components/dashboard-header';
import {
  calculateNewRelations,
  combineFiltersAndRelations,
  splitFiltersAndRelations,
} from '@/utils/filter-relations';
import { FilterRelationsTile } from './filter-relations-tile';
import { FiltersPanelHeader } from './filters-panel-header';
import { useNewFilterCreation } from './hooks/use-new-filter-adding';
import {
  isFilterSupportEditing,
  useExistingFilterEditing,
} from './hooks/use-existing-filter-editing';
import { FiltersPanelConfig } from './types';
import { useDefaults } from '@/common/hooks/use-defaults';
import { DEFAULT_FILTERS_PANEL_CONFIG } from './constants';

const PanelWrapper = styled.div<Themable>`
  background-color: ${({ theme }) => theme.filter.panel.backgroundColor};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  border: 1px solid #dadada;
  width: fit-content;
  min-width: 238px;
  max-height: 100%;
  overflow: hidden;
`;

const PanelBody = styled.div`
  background-color: transparent;
  max-height: calc(100% - ${DASHBOARD_HEADER_HEIGHT}px);
  overflow-y: auto;
`;

const PanelBodyInner = styled.div`
  padding: 0px 12px 12px;
`;

/**
 * Props of the {@link FiltersPanel} component
 *
 */
export type FiltersPanelProps = {
  /** Array of filters to display */
  filters: Filter[] | FilterRelations;
  /** Callback to handle changes in filters */
  onFiltersChange: (filters: Filter[] | FilterRelations) => void;
  /** Default data source used for filter tiles */
  defaultDataSource?: DataSource;
  /** All data sources available for filter tiles @internal */
  dataSources?: DataSource[];
  /** The configuration for the filters panel */
  config?: FiltersPanelConfig;
};

/**
 * Filters panel component that renders a list of filter tiles
 *
 * @group Filter Tiles
 * @alpha
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
      config: config.actions.editFilter,
    });

    const { NewFilterCreator, startFilterCreation } = useNewFilterCreation({
      dataSources: dataSources ? dataSources : defaultDataSource ? [defaultDataSource] : [],
      onFilterCreated: handleFilterAdd,
      defaultDataSource: defaultDataSource,
      config: config.actions.addFilter,
    });

    return (
      <PanelWrapper theme={themeSettings} ref={filtersPanelRef}>
        <FiltersPanelHeader
          onAddFilterButtonClick={useCallback(
            () => startFilterCreation(filtersPanelRef.current!),
            [startFilterCreation],
          )}
          shouldShowAddFilterButton={config.actions.addFilter.enabled}
        />
        <PanelBody>
          <PanelBodyInner>
            {relations && <FilterRelationsTile relations={relations} filters={filters} />}
            {filters?.map((filter, index) => (
              <div
                className="csdk-mt-[6px]"
                key={filter.config.guid}
                ref={(el) => (filterTilesRef.current[index] = el!)}
              >
                <FilterTile
                  onDelete={
                    config.actions.deleteFilter.enabled
                      ? () => handleFilterDelete(filter)
                      : undefined
                  }
                  key={filter.config.guid}
                  filter={filter}
                  onChange={(newFilter) => handleFilterChange(newFilter!)}
                  defaultDataSource={defaultDataSource}
                  onEdit={
                    config.actions.editFilter.enabled && isFilterSupportEditing(filter)
                      ? () => startEditingFilter(filterTilesRef.current[index], filter)
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
