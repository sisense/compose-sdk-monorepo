import {
  DataSource,
  Filter,
  LevelAttribute,
  isMembersFilter,
  isDateRangeFilter,
  isRelativeDateFilter,
  isMeasureFilter,
  isTextFilter,
  isRankingFilter,
  isCustomFilter,
} from '@sisense/sdk-data';
import { MemberFilterTile } from '../member-filter-tile/index.js';
import { CriteriaFilterTile } from '../criteria-filter-tile/index.js';
import { DateRangeFilterTile, RelativeDateFilterTile } from '../date-filter/index.js';
import { CompleteFilterTileDesignOptions } from '../filter-tile-container.js';
import { useThemeContext } from '@/theme-provider';
import { TRIANGLE_COLOR_ADJUSTMENT, getSlightlyDifferentColor } from '@/utils/color';
import { CustomFilterTile } from '@/filters';
import { UnsupportedFilterTile } from '@/filters/components/unsupported-filter-tile';

/**
 * Props of the {@link CascadingLevelFilterTile} component
 *
 * @internal
 */
export type CascadingLevelFilterTileProps = {
  /** Filter to display */
  filter: Filter;
  /**
   * Data source the query is run against - e.g. `Sample ECommerce`
   *
   * If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.
   */
  dataSource?: DataSource;
  parentFilters: Filter[];
  /** Callback to handle filter change */
  onChange: (filter: Filter | null) => void;

  /** Whether the filter is the last in the list */
  isLast?: boolean;
};

const cascadingLevelTileDesign: CompleteFilterTileDesignOptions = {
  header: {
    shouldBeShown: true,
    isCollapsible: true,
    hasBorder: false,
    hasBackgroundFilterIcon: false,
  },
  border: {
    shouldBeShown: false,
  },
  footer: {
    shouldBeShown: false,
  },
} as const;

/**
 * Filter tile component that renders a level filter based on its type
 *
 * @internal
 */
export const CascadingLevelFilterTile = ({
  filter,
  dataSource,
  parentFilters,
  onChange,
  isLast,
}: CascadingLevelFilterTileProps) => {
  const { themeSettings } = useThemeContext();
  const { backgroundColor: bgColor } = themeSettings.general;
  const triangleColor = getSlightlyDifferentColor(bgColor, TRIANGLE_COLOR_ADJUSTMENT);

  const attribute = filter.attribute;
  const title = attribute.name;
  const props = {
    attribute,
    dataSource,
    title,
    onChange,
    onUpdate: onChange,
    tileDesignOptions: cascadingLevelTileDesign,
  };

  const filterTile = isMembersFilter(filter) ? (
    <MemberFilterTile {...props} filter={filter} parentFilters={parentFilters} />
  ) : isDateRangeFilter(filter) ? (
    <DateRangeFilterTile {...props} filter={filter} attribute={attribute as LevelAttribute} tiled />
  ) : isRelativeDateFilter(filter) ? (
    <RelativeDateFilterTile {...props} filter={filter} arrangement="vertical" />
  ) : isMeasureFilter(filter) ||
    isMembersFilter(filter) ||
    isTextFilter(filter) ||
    isRankingFilter(filter) ? (
    <CriteriaFilterTile {...props} filter={filter} />
  ) : isCustomFilter(filter) ? (
    <CustomFilterTile {...props} filter={filter} />
  ) : (
    <UnsupportedFilterTile filter={filter} design={cascadingLevelTileDesign} />
  );

  return (
    <div
      style={{ borderBottomColor: !isLast ? triangleColor : undefined }}
      className={!isLast ? `csdk-border-0 csdk-border-b csdk-border-solid` : ''}
    >
      {filterTile}
    </div>
  );
};
