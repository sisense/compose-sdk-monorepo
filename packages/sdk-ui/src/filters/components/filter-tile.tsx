import {
  DataSource,
  Filter,
  LevelAttribute,
  isCustomFilter,
  isMembersFilter,
  isMeasureFilter,
  isTextFilter,
  isRankingFilter,
  isRelativeDateFilter,
  isCascadingFilter,
  isDateRangeFilter,
  isNumericFilter,
} from '@sisense/sdk-data';
import { MemberFilterTile } from './member-filter-tile';
import { CriteriaFilterTile } from './criteria-filter-tile';
import { DateRangeFilterTile, RelativeDateFilterTile } from './date-filter';
import { CascadingFilterTile } from './cascading-filter-tile';
import { CustomFilterTile } from './custom-filter-tile';
import { UnsupportedFilterTile } from '@/filters/components/unsupported-filter-tile';

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
}: FilterTileProps) => {
  const attribute = filter.attribute;
  const title = attribute.name;
  const props = {
    attribute,
    title,
    onChange,
    onUpdate: onChange,
    onDelete,
    onEdit,
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
      design={{ header: { isCollapsible: false } }}
      onDelete={onDelete}
    />
  );
};
