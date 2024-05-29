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
import { MemberFilterTile } from '../member-filter-tile';
import { CriteriaFilterTile } from '../criteria-filter-tile';
import { DateRangeFilterTile, RelativeDateFilterTile } from '../date-filter';
import { FilterTile } from '../filter-tile';
import { useTranslation } from 'react-i18next';

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
};

/**
 * Filter tile component that renders a filter based on its type
 *
 * @internal
 */
export const FiltersPanelTile = ({ filter, onChange }: FiltersPanelTileProps) => {
  const { t } = useTranslation();

  const attribute = filter.attribute;
  const title = attribute.name;
  const props = {
    attribute,
    title,
    onChange,
    onUpdate: onChange,
  };

  if (filter instanceof MembersFilter) {
    return <MemberFilterTile {...props} filter={filter} />;
  }

  if (filter instanceof DateRangeFilter) {
    return (
      <DateRangeFilterTile {...props} filter={filter} attribute={attribute as LevelAttribute} />
    );
  }

  if (filter instanceof RelativeDateFilter) {
    return <RelativeDateFilterTile {...props} filter={filter} arrangement="vertical" />;
  }

  if (
    filter instanceof MeasureFilter ||
    filter instanceof NumericFilter ||
    filter instanceof TextFilter ||
    filter instanceof RankingFilter
  ) {
    return <CriteriaFilterTile {...props} filter={filter} />;
  }

  return (
    <FilterTile
      title={t('unsupportedFilter.title')}
      renderContent={() => (
        <p className="csdk-text-center csdk-text-[13px]">{t('unsupportedFilter.message')}</p>
      )}
    />
  );
};
