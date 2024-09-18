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
import { MemberFilterTile } from '../member-filter-tile';
import { CriteriaFilterTile } from '../criteria-filter-tile';
import { DateRangeFilterTile, RelativeDateFilterTile } from '../date-filter';
import { FilterTile } from '../filter-tile';
import { useTranslation } from 'react-i18next';
import { CascadingFilterTile } from '../cascading-filter-tile';
import { CustomFilterTile } from '../custom-filter-tile';

/**
 * Props of the {@link FiltersPanelTile} component
 *
 * @internal
 */
export type FiltersPanelTileProps = {
  /** Filter to display */
  filter: Filter;
  /** Callback to handle filter change */
  onChange: (filter: Filter | null) => void;
  /** Default data source used for filter tiles */
  defaultDataSource?: DataSource;
};

/**
 * Filter tile component that renders a filter based on its type
 *
 * @internal
 */
export const FiltersPanelTile = ({
  filter,
  onChange,
  defaultDataSource,
}: FiltersPanelTileProps) => {
  const { t } = useTranslation();

  const attribute = filter.attribute;
  const title = attribute.name;
  const props = {
    attribute,
    title,
    onChange,
    onUpdate: onChange,
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
    <FilterTile
      title={t('unsupportedFilter.title')}
      renderContent={() => (
        <div className="csdk-p-[8px] csdk-text-center csdk-text-[13px]">
          <span>{t('unsupportedFilter.message')}</span>
        </div>
      )}
      design={{ header: { isCollapsible: false } }}
      locked={filter.locked}
    />
  );
};
