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
 * @param filtersOrFilterRelations - The filters or filter relations to translate
 * @returns The translated filters and relations DTOs for Fusion
 *
 * @sisenseInternal
 */
export function translateFiltersAndRelationsToDto(
  filtersOrFilterRelations: Filter[] | FilterRelations,
) {
  const { filters, relations } = splitFiltersAndRelations(filtersOrFilterRelations);
  const filterDtos = filters.map(filterToFilterDto);
  const filterRelationsModel = filterRelationRulesToFilterRelationsModel(relations, filters);
  const stringDataSource = getDataSourceStringFromFilters(filters);
  return {
    filters: filterDtos,
    filterRelations: filterRelationsModel
      ? [
          {
            datasource: stringDataSource,
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

function getDataSourceStringFromFilters(filters: Filter[]): string {
  const allUniqueDatasources = new Set(filters.map((filter) => filter.dataSource?.title));
  if (allUniqueDatasources.size > 1) {
    throw new Error('Persisting filters from multiple datasources is not supported now');
  }
  return allUniqueDatasources.values().next().value;
}
