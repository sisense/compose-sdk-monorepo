import {
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

/**
 * Props of the {@link CascadingLevelFilterTile} component
 *
 * @internal
 */
export type CascadingLevelFilterTileProps = {
  /** Filter to display */
  filter: Filter;
  parentFilters: Filter[];
  /** Callback to handle filter change */
  onChange: (filter: Filter | null) => void;

  /** Whether the filter is the last in the list */
  isLast?: boolean;
};

const cascadingLevelTileDesign: CompleteFilterTileDesignOptions = {
  header: {
    shouldBeShown: true,
    isCollapsible: false,
    hasBorder: false,
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
  parentFilters,
  onChange,
  isLast,
}: CascadingLevelFilterTileProps) => {
  const { t } = useTranslation();

  const attribute = filter.attribute;
  const title = attribute.name;
  const props = {
    attribute,
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
    ) : (
      <FilterTile
        title={t('unsupportedFilter.title')}
        renderContent={() => (
          <p className="csdk-text-center csdk-text-[13px]">{t('unsupportedFilter.message')}</p>
        )}
        design={cascadingLevelTileDesign}
      />
    );

  return (
    <div
      className={
        !isLast ? 'csdk-border-0 csdk-border-b csdk-border-solid csdk-border-b-[#dadada]' : ''
      }
    >
      {filterTile}
    </div>
  );
};
