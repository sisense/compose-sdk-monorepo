import { useRef, useState } from 'react';
import { FilterTile } from '../filter-tile';
import { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';
import styled from '@emotion/styled';
import isNumber from 'lodash-es/isNumber';
import { Themable } from '@/theme-provider/types';
import { useThemeContext } from '@/theme-provider';
import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';
import { DASHBOARD_HEADER_HEIGHT } from '@/dashboard/components/dashboard-header';
import { useTranslation } from 'react-i18next';
import {
  calculateNewRelations,
  combineFiltersAndRelations,
  splitFiltersAndRelations,
} from '@/utils/filter-relations';
import { FilterRelationsTile } from './filter-relations-tile';
import { FilterEditorPopover } from '../filter-editor-popover/filter-editor-popover';

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

const PanelHeader = styled.div<Themable>`
  background-color: transparent;
  color: ${({ theme }) => theme.filter.panel.titleColor};
  margin: 0 9px;
  height: 48px;
  border-bottom: 1px solid #dadada;
  box-sizing: border-box;
`;
const PanelTitle = styled.div`
  font-size: 13px;
  font-weight: bold;
  display: flex;
  align-items: center;
  height: 100%;
  margin-left: 8px;
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
  /** @internal */
  enableFilterEditor?: boolean;
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
    enableFilterEditor = false,
  }: FiltersPanelProps) => {
    const { t } = useTranslation();
    const { themeSettings } = useThemeContext();
    const { filters, relations } = splitFiltersAndRelations(filtersOrFilterRelations);
    const filterList: (Filter | null)[] = [...filters];
    const [editedFilterIndex, setEditedFilterIndex] = useState<number | null>(null);
    const filterElementsRef = useRef<HTMLElement[]>([]);

    const handleFilterChange = (filter: Filter | null, index: number) => {
      if (!filters) return;
      filterList[`${index}`] = filter;
      const newFilters: Filter[] = filterList.filter((f) => f !== null) as Filter[];
      const newRelations = calculateNewRelations(filters, relations, newFilters);
      onFiltersChange(combineFiltersAndRelations(newFilters, newRelations));
    };

    const handleFilterDelete = (index: number) => {
      if (!filters) return;
      handleFilterChange(null, index);
    };

    return (
      <PanelWrapper theme={themeSettings}>
        <PanelHeader theme={themeSettings}>
          <PanelTitle>{t('filters')}</PanelTitle>
        </PanelHeader>
        <PanelBody>
          <PanelBodyInner>
            {relations && <FilterRelationsTile relations={relations} filters={filters} />}
            {filters?.map((filter, index) => (
              <div
                className="csdk-mt-[6px]"
                key={filter.config.guid}
                ref={(el) => (filterElementsRef.current[index] = el as HTMLElement)}
              >
                <FilterTile
                  onDelete={() => handleFilterDelete(index)}
                  key={filter.config.guid}
                  filter={filter}
                  onChange={(newFilter) => handleFilterChange(newFilter, index)}
                  defaultDataSource={defaultDataSource}
                  onEdit={enableFilterEditor ? () => setEditedFilterIndex(index) : undefined}
                />
              </div>
            ))}
            <FilterEditorPopover
              filter={isNumber(editedFilterIndex) ? filterList[editedFilterIndex] : null}
              position={
                isNumber(editedFilterIndex)
                  ? { anchorEl: filterElementsRef.current[editedFilterIndex] }
                  : undefined
              }
              onChange={(filter: Filter) => {
                handleFilterChange(filter, editedFilterIndex as number);
                setEditedFilterIndex(null);
              }}
              onClose={() => setEditedFilterIndex(null)}
            />
          </PanelBodyInner>
        </PanelBody>
      </PanelWrapper>
    );
  },
);
