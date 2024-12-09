import { FilterTile, FilterTileDesignOptions } from '@/filters/components/filter-tile';
import { Filter } from '@sisense/sdk-data';
import { useTranslation } from 'react-i18next';

export type UnsupportedFilterTileProps = {
  filter: Filter;
  design?: FilterTileDesignOptions;
  /** Filter delete callback */
  onDelete?: () => void;
};

/**
 * Filter tile component that renders an unsupported filter (which is not recognized by the JAQL to Filter translation)
 *
 * @internal
 */
export const UnsupportedFilterTile = ({ filter, design, onDelete }: UnsupportedFilterTileProps) => {
  const { t } = useTranslation();
  return (
    <FilterTile
      title={filter.attribute.name ?? ''}
      renderContent={() => (
        <div className="csdk-p-[12px] csdk-text-[13px]">{t('unsupportedFilterMessage')}</div>
      )}
      design={design}
      locked={filter.config.locked}
      onDelete={onDelete}
    />
  );
};
