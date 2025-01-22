import {
  FilterTileContainer,
  FilterTileDesignOptions,
} from '@/filters/components/filter-tile-container';
import { Filter } from '@sisense/sdk-data';
import { useTranslation } from 'react-i18next';
import { FilterContentDisplay } from '@/filters/components/common';

export type UnsupportedFilterTileProps = {
  filter: Filter;
  design?: FilterTileDesignOptions;
  /** Filter delete callback */
  onDelete?: () => void;
  /** Filter edit callback */
  onEdit?: () => void;
};

/**
 * Filter tile component that renders an unsupported filter (which is not recognized by the JAQL to Filter translation)
 *
 * @internal
 */
export const UnsupportedFilterTile = ({
  filter,
  design,
  onDelete,
  onEdit,
}: UnsupportedFilterTileProps) => {
  const { t } = useTranslation();
  return (
    <FilterTileContainer
      title={filter.attribute.name ?? ''}
      renderContent={() => (
        <FilterContentDisplay>{t('unsupportedFilterMessage')}</FilterContentDisplay>
      )}
      design={design}
      locked={filter.config.locked}
      onDelete={onDelete}
      onEdit={onEdit}
    />
  );
};
