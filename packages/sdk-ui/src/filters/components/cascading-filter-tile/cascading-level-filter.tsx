import {
  DataSource,
  CustomFilter,
  DateRangeFilter,
  Filter,
  LevelAttribute,
  MeasureFilter,
  MembersFilter,
  NumericFilter,
  RankingFilter,
  RelativeDateFilter,
  TextFilter,
} from '@sisense/sdk-data';
import { MemberFilterTile } from '../member-filter-tile/index.js';
import { CriteriaFilterTile } from '../criteria-filter-tile/index.js';
import { DateRangeFilterTile, RelativeDateFilterTile } from '../date-filter/index.js';
import { CompleteFilterTileDesignOptions, FilterTile } from '../filter-tile.js';
import { useTranslation } from 'react-i18next';
import { useThemeContext } from '@/theme-provider';
import { TRIANGLE_COLOR_ADJUSTMENT, getSlightlyDifferentColor } from '@/utils/color';
import { CustomFilterTile } from '@/filters';

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
  const { t } = useTranslation();
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

  const filterTile =
    filter instanceof MembersFilter ? (
      <MemberFilterTile {...props} filter={filter} parentFilters={parentFilters} />
    ) : filter instanceof DateRangeFilter ? (
      <DateRangeFilterTile
        {...props}
        filter={filter}
        attribute={attribute as LevelAttribute}
        tiled
      />
    ) : filter instanceof RelativeDateFilter ? (
      <RelativeDateFilterTile {...props} filter={filter} arrangement="vertical" />
    ) : filter instanceof MeasureFilter ||
      filter instanceof NumericFilter ||
      filter instanceof TextFilter ||
      filter instanceof RankingFilter ? (
      <CriteriaFilterTile {...props} filter={filter} />
    ) : filter instanceof CustomFilter ? (
      <CustomFilterTile {...props} filter={filter} />
    ) : (
      <FilterTile
        title={t('unsupportedFilter.title')}
        renderContent={() => (
          <p className="csdk-text-center csdk-text-[13px]">{t('unsupportedFilter.message')}</p>
        )}
        design={cascadingLevelTileDesign}
        locked={filter.locked}
      />
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
