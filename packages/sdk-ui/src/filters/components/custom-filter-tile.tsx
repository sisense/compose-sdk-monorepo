import { Filter } from '@sisense/sdk-data';
import { FilterTile, FilterTileDesignOptions } from './filter-tile';
import cloneDeep from 'lodash-es/cloneDeep';
import { useTranslation } from 'react-i18next';
import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';

/**
 * Props for {@link CustomFilterTile}
 *
 * @internal
 */
export interface CustomFilterTileProps {
  /** Custom filter. */
  filter: Filter;
  /**
   * Callback to handle changes in custom filter.
   *
   * @param filter - Custom filter
   */
  onUpdate: (filter: Filter | null) => void;
  /** Filter delete callback */
  onDelete?: () => void;
  /** Design options for the tile @internal */
  tileDesignOptions?: FilterTileDesignOptions;
}

/**
 * UI component for a custom filter defined with JAQL.
 *
 * @internal
 * @example
 * ```tsx
 * const filterJaql = { from: 10, to: 20000 };
 *
 * const [customFilter, setCustomFilter] = useState<Filter>(
 *   filterFactory.customFilter(DM.Commerce.Cost, filterJaql),
 * );
 *
 * return (
 *   <CustomFilterTile
 *     filter={customFilter}
 *     onChange={(filter: Filter) => {
 *       setCustomFilter(filter);
 *     }}
 *   />
 * );
 * ```
 * @param props - Custom filter tile props
 * @returns Custom filter tile component
 * @group Filter Tiles
 */
export const CustomFilterTile = asSisenseComponent({
  componentName: 'CustomFilterTile',
})((props: CustomFilterTileProps) => {
  const { t } = useTranslation();

  const { filter, onUpdate, onDelete, tileDesignOptions } = props;
  const filterJaql = filter.jaql().jaql.filter;
  // Remove internal properties from the filter jaql
  delete filterJaql.custom;
  delete filterJaql.isAdvanced;
  delete filterJaql.filterType;

  const getFilterWithToggledDisabled = (filter: Filter): Filter => {
    const newFilter = cloneDeep(filter);
    newFilter.disabled = !filter.disabled;
    Object.setPrototypeOf(newFilter, filter);
    return newFilter;
  };

  return (
    <FilterTile
      title={filter.attribute.name}
      renderContent={(collapsed) => {
        return collapsed ? (
          <p className="csdk-text-center csdk-text-[13px]">{t('customFilterTileMessage')}</p>
        ) : (
          <div className="csdk-text-[13px] csdk-m-3" style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(filterJaql, null, 4)}
          </div>
        );
      }}
      disabled={filter.disabled}
      onToggleDisabled={() => onUpdate(getFilterWithToggledDisabled(filter))}
      design={tileDesignOptions || { header: { isCollapsible: false } }}
      locked={filter.locked}
      onDelete={onDelete}
    />
  );
});
