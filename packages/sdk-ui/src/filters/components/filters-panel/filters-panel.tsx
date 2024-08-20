import { FiltersPanelTile } from './filters-panel-tile';
import { DataSource, Filter } from '@sisense/sdk-data';
import styled from '@emotion/styled';
import { Themable } from '@/theme-provider/types';
import { useThemeContext } from '@/theme-provider';
import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';

const PanelWrapper = styled.div<Themable>`
  background-color: ${({ theme }) => theme.chart.backgroundColor};
  border: 1px solid #dadada;
  width: fit-content;
  min-width: 240px;
`;

const PanelBody = styled.div`
  margin: 12px;
  margin-top: 6px;
  background-color: transparent;
`;

const PanelHeader = styled.div<Themable>`
  background-color: transparent;
  color: ${({ theme }) => theme.typography.primaryTextColor};
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
 * @internal
 */
export type FiltersPanelProps = {
  /** Array of filters to display */
  filters: Filter[];
  /** Callback to handle changes in filters */
  onFiltersChange: (filters: Filter[]) => void;
  /** Default data source used for filter tiles */
  defaultDataSource?: DataSource;
};

/**
 * Filters panel component that renders a list of filter tiles
 *
 * @internal
 */
export const FiltersPanel = asSisenseComponent({
  componentName: 'FiltersPanel',
})(({ filters, onFiltersChange, defaultDataSource }: FiltersPanelProps) => {
  const { themeSettings } = useThemeContext();
  const filterList = [...filters] as (Filter | null)[];
  const handleFilterChange = (filter: Filter | null, index: number) => {
    if (!filters) return;
    filterList[`${index}`] = filter;
    onFiltersChange(filterList.filter((f) => f !== null) as Filter[]);
  };

  return (
    <PanelWrapper theme={themeSettings}>
      <PanelHeader theme={themeSettings}>
        <PanelTitle>Filters</PanelTitle>
      </PanelHeader>
      <PanelBody>
        {filters?.map((filter, index) => (
          <div className="csdk-mt-[6px]" key={filter.guid}>
            <FiltersPanelTile
              key={filter.guid}
              filter={filter}
              onChange={(newFilter) => handleFilterChange(newFilter, index)}
              defaultDataSource={defaultDataSource}
            />
          </div>
        ))}
      </PanelBody>
    </PanelWrapper>
  );
});
