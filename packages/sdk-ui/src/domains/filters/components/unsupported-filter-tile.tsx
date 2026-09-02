import { useTranslation } from 'react-i18next';

import { Filter } from '@sisense/sdk-data';

import { FilterContentDisplay } from '@/domains/filters/components/common';
import {
  FilterTileContainer,
  FilterTileDesignOptions,
} from '@/domains/filters/components/filter-tile-container';
import type { FilterTileConfig } from '@/domains/filters/components/filter-tile/types';
import { useFilterTileMenuItems } from '@/domains/filters/shared/use-filter-tile-menu-items/use-filter-tile-menu-items';

export type UnsupportedFilterTileProps = {
  filter: Filter;
  design?: FilterTileDesignOptions;
  /** Filter delete callback */
  onDelete?: () => void;
  /** Filter edit callback */
  onEdit?: () => void;
  /** Callback to handle filter change (used for lock toggle) */
  onChange?: (filter: Filter) => void;
  /**
   * Configuration for the filter tile.
   */
  config?: FilterTileConfig;
  /**
   * Render header title
   *
   * @internal
   */
  renderHeaderTitle?: (title: React.ReactNode) => React.ReactNode;
  /**
   * When true, the tile is linked to a FilterWidget and rendered read-only.
   *
   * @internal
   */
  linked?: boolean;
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
  onChange,
  config,
  renderHeaderTitle,
  linked,
}: UnsupportedFilterTileProps) => {
  const { t } = useTranslation();
  const menuItems = useFilterTileMenuItems(filter, config, onChange);

  return (
    <FilterTileContainer
      title={filter.attribute.title ?? ''}
      renderHeaderTitle={renderHeaderTitle}
      renderContent={() => (
        <FilterContentDisplay>{t('unsupportedFilterMessage')}</FilterContentDisplay>
      )}
      design={design}
      locked={filter.config.locked}
      toggleVisible={config?.actions?.toggleFilter?.visible}
      expandVisible={config?.actions?.expandFilter?.visible}
      linked={linked}
      menuItems={menuItems}
      onDelete={onDelete}
      onEdit={onEdit}
    />
  );
};
