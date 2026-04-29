import { Filter, FilterRelations } from '@sisense/sdk-data';

import {
  SpecificWidgetOptions,
  WidgetsPanelColumn,
  WidgetsPanelLayout,
  WidgetsPanelRow,
} from '@/domains/dashboarding/dashboard-model';
import { WidgetModel } from '@/domains/widgets/widget-model';
import {
  filterRelationRulesToFilterRelationsModel,
  splitFiltersAndRelations,
} from '@/shared/utils/filter-relations';

import { filterToFilterDto } from '../../translate-dashboard-dto-utils.js';
import { AddWidgetPayload } from './types.js';

/**
 * Translates filters and relations to DTOs.
 *
 * `filterRelations[].datasource` is always a **string** (never `undefined`), so Fusion validation
 * does not break. The value is derived from `filter.dataSource` / `filter.attribute.dataSource`
 * when present; otherwise `''`.
 *
 * @param filtersOrFilterRelations - Flat filters or a filter-relations tree
 *
 * @sisenseInternal
 */
export function translateFiltersAndRelationsToDto(
  filtersOrFilterRelations: Filter[] | FilterRelations,
) {
  const { filters, relations } = splitFiltersAndRelations(filtersOrFilterRelations);
  const filterDtos = filters.map(filterToFilterDto);
  const filterRelationsModel = filterRelationRulesToFilterRelationsModel(relations, filters);
  const datasource = getDataSourceStringFromFilters(filters) ?? '';
  return {
    filters: filterDtos,
    filterRelations: filterRelationsModel
      ? [
          {
            datasource,
            filterRelations: filterRelationsModel,
          },
        ]
      : undefined,
  };
}

export function parseAddWidgetPayload(payload: AddWidgetPayload): {
  widget: WidgetModel;
  widgetsPanelLayout?: WidgetsPanelLayout;
  widgetOptions?: SpecificWidgetOptions;
} {
  return 'widget' in payload
    ? {
        widget: payload.widget,
        widgetsPanelLayout: payload.widgetsPanelLayout,
        widgetOptions: payload.widgetOptions,
      }
    : { widget: payload };
}

/**
 * Appends a widget cell to the first column's first row. Creates row/cells if missing.
 * Returns a new layout (immutable) or the original when no columns exist.
 */
export function appendWidgetToFirstCell(
  layout: WidgetsPanelLayout | undefined,
  widgetId: string,
): WidgetsPanelLayout | undefined {
  const columns = layout?.columns ?? [];
  if (columns.length === 0) return layout;

  const [firstCol, ...restCols] = columns;
  const rows = firstCol.rows ?? [];
  const firstRow = rows[0];
  const cells = firstRow?.cells ?? [];
  const newCell = { widgetId, widthPercentage: 100 };
  const newFirstRow: WidgetsPanelRow = { ...firstRow, cells: [...cells, newCell] };
  const newFirstCol: WidgetsPanelColumn = {
    ...firstCol,
    rows: rows.length > 0 ? [newFirstRow, ...rows.slice(1)] : [newFirstRow],
  };

  return { ...layout, columns: [newFirstCol, ...restCols] };
}

/**
 * Datasource title from filter: `filter.dataSource` is usually unset; use `attribute.dataSource` (JAQL).
 */
function getDataSourceTitleFromFilter(filter: Filter): string | undefined {
  const fromFilter = filter.dataSource?.title;
  if (typeof fromFilter === 'string' && fromFilter.length > 0) {
    return fromFilter;
  }
  const fromAttribute = filter.attribute.dataSource?.title;
  if (typeof fromAttribute === 'string' && fromAttribute.length > 0) {
    return fromAttribute;
  }
  return undefined;
}

/**
 * Single unique datasource title from filters, or `undefined` if none of the filters expose a title.
 */
function getDataSourceStringFromFilters(filters: Filter[]): string | undefined {
  const titles = filters
    .map(getDataSourceTitleFromFilter)
    .filter((title) => typeof title === 'string' && title.length > 0);
  const unique = new Set(titles);
  if (unique.size > 1) {
    throw new Error('Persisting filters from multiple datasources is not supported now');
  }
  return unique.size === 1 ? titles[0] : undefined;
}
