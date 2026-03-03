import {
  DataSource,
  Filter,
  isCascadingFilter,
  isCustomFilter,
  isDateRangeFilter,
  isMeasureFilter,
  isMembersFilter,
  isNumericFilter,
  isRankingFilter,
  isRelativeDateFilter,
  isTextFilter,
  LevelAttribute,
} from '@sisense/sdk-data';

import { UnsupportedFilterTile } from '@/domains/filters/components/unsupported-filter-tile';

import { CascadingFilterTile } from '../cascading-filter-tile/index.js';
import { CriteriaFilterTile } from '../criteria-filter-tile/index.js';
import { CustomFilterTile } from '../custom-filter-tile.js';
import { DateRangeFilterTile, RelativeDateFilterTile } from '../date-filter/index.js';
import { MemberFilterTile } from '../member-filter-tile/index.js';
import { FilterTileConfig } from './types.js';

/**
 * Props of the {@link FilterTile} component
 *
 */
export interface FilterTileProps {
  /** Filter to display */
  filter: Filter;
  /** Callback to handle filter change */
  onChange: (filter: Filter | null) => void;
  /** Filter delete callback */
  onDelete?: () => void;
  /** Filter edit callback */
  onEdit?: (
    /** Index of the filter level that triggers the onEdit action (in the case of a CascadingFilter) */
    levelIndex?: number,
  ) => void;
  /** Default data source used for filter tiles */
  defaultDataSource?: DataSource;
  /**
   * Configurations for the filter tile
   *
   * @internal
   */
  config?: FilterTileConfig;
  /**
   * Render header title
   *
   * @internal
   */
  renderHeaderTitle?: (title: React.ReactNode) => React.ReactNode;
}

/**
 * Facade component that renders a filter tile based on filter type
 *
 * @group Filter Tiles
 * @shortDescription Facade component rendering a filter tile based on filter type
 */
export const FilterTile: React.FC<FilterTileProps> = ({
  filter,
  onChange,
  onDelete,
  onEdit,
  defaultDataSource,
  config,
  renderHeaderTitle,
}: FilterTileProps) => {
  const attribute = filter.attribute;
  const title = attribute.title;
  const props = {
    attribute,
    title,
    onChange,
    onUpdate: onChange,
    onDelete,
    onEdit,
    config,
    renderHeaderTitle,
    ...(defaultDataSource ? { dataSource: defaultDataSource } : null),
  };
  // checking for custom filters first to prevent conversion attempts
  if (isCustomFilter(filter)) {
    return <CustomFilterTile {...props} filter={filter} />;
  }

  if (isMembersFilter(filter)) {
    return <MemberFilterTile {...props} filter={filter} />;
  }

  if (isDateRangeFilter(filter)) {
    return (
      <DateRangeFilterTile
        {...props}
        filter={filter}
        attribute={attribute as LevelAttribute}
        tiled
      />
    );
  }

  if (isRelativeDateFilter(filter)) {
    return <RelativeDateFilterTile {...props} filter={filter} arrangement="vertical" />;
  }

  if (
    isMeasureFilter(filter) ||
    isNumericFilter(filter) ||
    isTextFilter(filter) ||
    isRankingFilter(filter)
  ) {
    return <CriteriaFilterTile {...props} filter={filter} />;
  }

  if (isCascadingFilter(filter)) {
    return <CascadingFilterTile {...props} filter={filter} onChange={onChange} />;
  }

  return (
    <UnsupportedFilterTile
      filter={filter}
      config={config}
      renderHeaderTitle={renderHeaderTitle}
      design={{ header: { isCollapsible: false } }}
      onDelete={onDelete}
      onChange={onChange}
    />
  );
};
