/* eslint-disable sonarjs/no-identical-functions */
import { Column, normalizeName } from '@sisense/sdk-data';

import { isPivotRowsSort } from '@/domains/visualizations/components/pivot-table/sorting-utils.js';
import { getTableAttributesAndMeasures } from '@/domains/visualizations/components/table/hooks/use-table-data.js';
import {
  AreamapChartDataOptions,
  BoxplotChartDataOptions,
  CalendarHeatmapChartDataOptions,
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  IndicatorChartDataOptions,
  PivotTableDataOptions,
  ScatterChartDataOptions,
  ScattermapChartDataOptions,
  StyledColumn,
  TableDataOptionsInternal,
} from '@/domains/visualizations/core/chart-data-options/types.js';
import {
  normalizeAnyColumn,
  normalizeColumn,
  normalizeMeasureColumn,
} from '@/domains/visualizations/core/chart-data-options/utils.js';
import { createPanelItem } from '@/domains/widgets/components/widget-by-id/translate-widget-data-options.js';
import { Panel, PanelItem } from '@/domains/widgets/components/widget-by-id/types.js';
import { isMeasurePanelItem } from '@/domains/widgets/components/widget-by-id/utils.js';
import type { GenericDataOptions, PivotRowsSort } from '@/types.js';
import { MultiColumnValueToColorMap, ScattermapStyleOptions, ValueToColorMap } from '@/types.js';

type MembersFormat = Record<
  string,
  { color: string; colored: boolean; isHandPickedColor: boolean }
>;

/**
 * Converts a flat {@link ValueToColorMap} into the Fusion panel-item `format.members` shape.
 * Every entry is marked `colored: true` and `isHandPickedColor: true` so Fusion treats the
 * mapping as user-supplied and renders the exact colors on round-trip.
 *
 * @param valueToColorMap - Map from category/series value to color string
 * @returns Fusion members format; empty object when the map is undefined
 */
function toMembersFormat(valueToColorMap: ValueToColorMap | undefined): MembersFormat {
  return valueToColorMap
    ? Object.entries(valueToColorMap).reduce<MembersFormat>(
        (acc, [member, color]) => ({
          ...acc,
          [member]: { color, colored: true, isHandPickedColor: true },
        }),
        {},
      )
    : {};
}

/**
 * Type guard that distinguishes a flat {@link ValueToColorMap} (value → color string) from
 * a {@link MultiColumnValueToColorMap} (column → nested map). Used to pick the right
 * members-format shape for sunburst vs. pie/funnel.
 *
 * @param seriesToColorMap - Either a flat or multi-column color map
 * @returns True when every value is a string (i.e. flat map)
 */
function isValueToColorMap(
  seriesToColorMap: ValueToColorMap | MultiColumnValueToColorMap,
): seriesToColorMap is ValueToColorMap {
  return Object.values(seriesToColorMap).every((value) => typeof value === 'string');
}

/**
 * Shared builder for the three panels a cartesian widget emits: a category-like panel
 * (named differently per chart type), `values`, and `break by`. When a `seriesToColorMap`
 * is present, the first break-by item carries the members format so Fusion can render
 * the per-series colors.
 *
 * @param dataOptions - Cartesian chart data options from the WidgetModel
 * @param categoryPanelName - `x-axis` for line/area, `categories` for bar/column/polar
 * @returns Three Fusion panels in the order expected by the DTO
 */
function toCartesianPanels(
  dataOptions: CartesianChartDataOptions,
  categoryPanelName: 'x-axis' | 'categories',
): Panel[] {
  const categoryItems: PanelItem[] = dataOptions.category.map((column) =>
    createPanelItem(normalizeColumn(column)),
  );
  const valueItems: PanelItem[] = dataOptions.value.map((column) =>
    createPanelItem(normalizeMeasureColumn(column)),
  );
  const { seriesToColorMap } = dataOptions;
  const breakByItems: PanelItem[] = dataOptions.breakBy.map((column, index) => {
    const item = createPanelItem(normalizeColumn(column));
    if (index === 0 && seriesToColorMap) {
      return { ...item, format: { ...item.format, members: toMembersFormat(seriesToColorMap) } };
    }
    return item;
  });
  return [
    { name: categoryPanelName, items: categoryItems },
    { name: 'values', items: valueItems },
    { name: 'break by', items: breakByItems },
  ];
}

/**
 * Builds DTO panels for a line chart widget. The category panel is named `x-axis`,
 * matching the Fusion convention for line/area charts.
 *
 * @param dataOptions - Cartesian chart data options from the WidgetModel
 * @returns Fusion panels: x-axis, values, break by
 * @internal
 */
export function toLinePanels(dataOptions: CartesianChartDataOptions): Panel[] {
  return toCartesianPanels(dataOptions, 'x-axis');
}

/**
 * Builds DTO panels for an area chart widget. The category panel is named `x-axis`,
 * matching the Fusion convention for line/area charts.
 *
 * @param dataOptions - Cartesian chart data options from the WidgetModel
 * @returns Fusion panels: x-axis, values, break by
 * @internal
 */
export function toAreaPanels(dataOptions: CartesianChartDataOptions): Panel[] {
  return toCartesianPanels(dataOptions, 'x-axis');
}

/**
 * Builds DTO panels for a bar chart widget. The category panel is named `categories`.
 *
 * @param dataOptions - Cartesian chart data options from the WidgetModel
 * @returns Fusion panels: categories, values, break by
 * @internal
 */
export function toBarPanels(dataOptions: CartesianChartDataOptions): Panel[] {
  return toCartesianPanels(dataOptions, 'categories');
}

/**
 * Builds DTO panels for a column chart widget. The category panel is named `categories`.
 *
 * @param dataOptions - Cartesian chart data options from the WidgetModel
 * @returns Fusion panels: categories, values, break by
 * @internal
 */
export function toColumnPanels(dataOptions: CartesianChartDataOptions): Panel[] {
  return toCartesianPanels(dataOptions, 'categories');
}

/**
 * Builds DTO panels for a polar chart widget. The category panel is named `categories`.
 *
 * @param dataOptions - Cartesian chart data options from the WidgetModel
 * @returns Fusion panels: categories, values, break by
 * @internal
 */
export function toPolarPanels(dataOptions: CartesianChartDataOptions): Panel[] {
  return toCartesianPanels(dataOptions, 'categories');
}

/**
 * Builds the single `columns` panel for a table widget. Attributes are emitted first,
 * then measure columns, preserving the order produced by {@link getTableAttributesAndMeasures}.
 *
 * @param dataOptions - Internal table data options from the WidgetModel
 * @returns Single-element array with the `columns` panel
 * @internal
 */
export function toTablePanels(dataOptions: TableDataOptionsInternal): Panel[] {
  const { attributes, measures } = getTableAttributesAndMeasures(dataOptions);
  const items: PanelItem[] = [
    ...attributes.map((column) => createPanelItem(normalizeColumn(column))),
    ...measures.map((column) => createPanelItem(normalizeMeasureColumn(column))),
  ];
  return [{ name: 'columns', items }];
}

/**
 * Builds DTO panels for an indicator widget. Emits `value`, `min`, `max`, and `secondary`
 * panels in that order; a panel is emitted even when its backing list is empty so that
 * the DTO panel order is stable across widgets.
 *
 * @param dataOptions - Indicator chart data options from the WidgetModel
 * @returns Fusion panels: value, min, max, secondary
 * @internal
 */
export function toIndicatorPanels(dataOptions: IndicatorChartDataOptions): Panel[] {
  return (['value', 'min', 'max', 'secondary'] as const).map((panelName) => ({
    name: panelName,
    items: (dataOptions[panelName] ?? []).map((column) =>
      createPanelItem(normalizeMeasureColumn(column)),
    ),
  }));
}

/**
 * Builds the category panel items for pie/funnel charts. When a flat `seriesToColorMap`
 * is present, its entries are attached to each category item as `format.members` so
 * Fusion restores the per-slice colors.
 *
 * @param dataOptions - Categorical chart data options from the WidgetModel
 * @returns Panel items for the `categories` panel
 */
function toFlatMembersCategoryItems(dataOptions: CategoricalChartDataOptions): PanelItem[] {
  const { seriesToColorMap } = dataOptions;
  return dataOptions.category.map((column) => {
    const item = createPanelItem(normalizeColumn(column));
    if (!seriesToColorMap) return item;
    const members = toMembersFormat(
      isValueToColorMap(seriesToColorMap) ? seriesToColorMap : undefined,
    );
    return { ...item, format: { ...item.format, members } };
  });
}

/**
 * Builds plain category panel items (no `format.members` attached). Used by treemap,
 * which carries its per-value colors on a dedicated `color` panel rather than on the
 * category items themselves.
 *
 * @param dataOptions - Categorical chart data options from the WidgetModel
 * @returns Panel items for the `categories` panel
 */
function toPlainCategoryItems(dataOptions: CategoricalChartDataOptions): PanelItem[] {
  return dataOptions.category.map((column) => createPanelItem(normalizeColumn(column)));
}

/**
 * Builds the category panel items for a sunburst chart. Sunburst uses a
 * {@link MultiColumnValueToColorMap} keyed by normalized column title, so each category
 * item receives the nested entry matching its own title.
 *
 * @param dataOptions - Categorical chart data options from the WidgetModel
 * @returns Panel items for the `categories` panel, each with per-column members format
 */
function toSunburstCategoryItems(dataOptions: CategoricalChartDataOptions): PanelItem[] {
  const { seriesToColorMap } = dataOptions;
  return dataOptions.category.map((column) => {
    const item = createPanelItem(normalizeColumn(column));
    if (!seriesToColorMap) return item;
    const sunburstKey = typeof item.jaql.title === 'string' ? normalizeName(item.jaql.title) : '';
    const members = toMembersFormat(
      !isValueToColorMap(seriesToColorMap) && sunburstKey
        ? seriesToColorMap[sunburstKey]
        : undefined,
    );
    return { ...item, format: { ...item.format, members } };
  });
}

/**
 * Builds the measure-side panel items for a categorical chart (pie/funnel/sunburst/treemap).
 * Uses {@link normalizeAnyColumn} so either measure-like or attribute-like values are
 * accepted — categorical widgets historically allow both in the `value` slot.
 *
 * @param dataOptions - Categorical chart data options from the WidgetModel
 * @returns Panel items to place in the `values` or `size` panel
 */
function toCategoricalValueItems(dataOptions: CategoricalChartDataOptions): PanelItem[] {
  return dataOptions.value.map((column) => createPanelItem(normalizeAnyColumn(column)));
}

/**
 * Builds the treemap-specific `color` panel. The colored column is the first category
 * flagged `isColored: true`; when no such column exists, an empty `color` panel is
 * emitted so the DTO shape stays consistent.
 *
 * @param dataOptions - Categorical chart data options from the WidgetModel
 * @returns The `color` panel (possibly empty)
 */
function toTreemapColorPanel(dataOptions: CategoricalChartDataOptions): Panel {
  const colorCategory = dataOptions.category.find((column) => (column as StyledColumn).isColored);
  if (!colorCategory) {
    return { name: 'color', items: [] };
  }

  const colorPanelItem = createPanelItem(normalizeAnyColumn(colorCategory));
  const membersFormat = toMembersFormat(
    dataOptions.seriesToColorMap && isValueToColorMap(dataOptions.seriesToColorMap)
      ? dataOptions.seriesToColorMap
      : undefined,
  );

  colorPanelItem.format = { ...colorPanelItem.format, members: membersFormat };

  return { name: 'color', items: [colorPanelItem] };
}

/**
 * Builds DTO panels for a pie chart widget. Category items carry `format.members` when
 * a flat `seriesToColorMap` is present so per-slice colors round-trip.
 *
 * @param dataOptions - Categorical chart data options from the WidgetModel
 * @returns Fusion panels: categories, values
 * @internal
 */
export function toPiePanels(dataOptions: CategoricalChartDataOptions): Panel[] {
  return [
    { name: 'categories', items: toFlatMembersCategoryItems(dataOptions) },
    { name: 'values', items: toCategoricalValueItems(dataOptions) },
  ];
}

/**
 * Builds DTO panels for a funnel chart widget. Category items carry `format.members` when
 * a flat `seriesToColorMap` is present so per-step colors round-trip.
 *
 * @param dataOptions - Categorical chart data options from the WidgetModel
 * @returns Fusion panels: categories, values
 * @internal
 */
export function toFunnelPanels(dataOptions: CategoricalChartDataOptions): Panel[] {
  return [
    { name: 'categories', items: toFlatMembersCategoryItems(dataOptions) },
    { name: 'values', items: toCategoricalValueItems(dataOptions) },
  ];
}

/**
 * Builds DTO panels for a sunburst chart widget. Each category item carries the nested
 * `format.members` entry matching its column title so per-level colors round-trip.
 *
 * @param dataOptions - Categorical chart data options from the WidgetModel
 * @returns Fusion panels: categories, values
 * @internal
 */
export function toSunburstPanels(dataOptions: CategoricalChartDataOptions): Panel[] {
  return [
    { name: 'categories', items: toSunburstCategoryItems(dataOptions) },
    { name: 'values', items: toCategoricalValueItems(dataOptions) },
  ];
}

/**
 * Builds DTO panels for a treemap chart widget. The measures panel is renamed to `size`
 * and an extra `color` panel is emitted (see {@link toTreemapColorPanel}) so Fusion can
 * restore the per-value color assignments.
 *
 * @param dataOptions - Categorical chart data options from the WidgetModel
 * @returns Fusion panels: categories, size, color
 * @internal
 */
export function toTreemapPanels(dataOptions: CategoricalChartDataOptions): Panel[] {
  return [
    { name: 'categories', items: toPlainCategoryItems(dataOptions) },
    { name: 'size', items: toCategoricalValueItems(dataOptions) },
    toTreemapColorPanel(dataOptions),
  ];
}

/**
 * Builds DTO panels for a scatter chart widget. All panels declared by the Fusion
 * scatter manifest are always emitted (in this exact order: x-axis, y-axis, point,
 * Break By / Color, size), even when no column is configured — Fusion's renderer
 * accesses panels by name and throws "the panel '<name>' was not found" when a
 * declared panel is missing. Slots without a column are emitted with `items: []`.
 *
 * Slot names are remapped to Fusion's conventions: `x`→`x-axis`, `y`→`y-axis`,
 * `breakByPoint`→`point`, `breakByColor`→`Break By / Color`, `size`→`size`.
 *
 * When a flat `seriesToColorMap` is present and `breakByColor` has a column, its
 * entries are attached to the `Break By / Color` item as `format.members` so
 * Fusion restores the per-series colors on round-trip.
 *
 * @param dataOptions - Scatter chart data options from the WidgetModel
 * @returns Fusion panels in fixed order; every declared panel is always present
 * @internal
 */
export function toScatterPanels(dataOptions: ScatterChartDataOptions): Panel[] {
  const { seriesToColorMap } = dataOptions;
  const xItem = dataOptions.x
    ? createPanelItem(normalizeAnyColumn(dataOptions.x as Column))
    : undefined;
  const yItem = dataOptions.y
    ? createPanelItem(normalizeAnyColumn(dataOptions.y as Column))
    : undefined;
  const sizeItem = dataOptions.size
    ? createPanelItem(normalizeAnyColumn(dataOptions.size as Column))
    : undefined;

  // Fusion's `point` panel requires both axes populated AND at least one axis to be
  // a measure. When the invariant is not met, emit the panel with empty items even if the WidgetModel
  // has `breakByPoint` set — matching the configuration Fusion's own wizard would produce.
  const canRenderBreakByPoint =
    !!xItem && !!yItem && (isMeasurePanelItem(xItem) || isMeasurePanelItem(yItem));
  const breakByPointItem =
    dataOptions.breakByPoint && canRenderBreakByPoint
      ? createPanelItem(normalizeAnyColumn(dataOptions.breakByPoint as Column))
      : undefined;

  const breakByColorBaseItem = dataOptions.breakByColor
    ? createPanelItem(normalizeAnyColumn(dataOptions.breakByColor as Column))
    : undefined;
  const breakByColorItem = breakByColorBaseItem
    ? seriesToColorMap
      ? {
          ...breakByColorBaseItem,
          format: { ...breakByColorBaseItem.format, members: toMembersFormat(seriesToColorMap) },
        }
      : breakByColorBaseItem
    : undefined;

  return [
    { name: 'x-axis', items: xItem ? [xItem] : [] },
    { name: 'y-axis', items: yItem ? [yItem] : [] },
    { name: 'point', items: breakByPointItem ? [breakByPointItem] : [] },
    { name: 'Break By / Color', items: breakByColorItem ? [breakByColorItem] : [] },
    { name: 'size', items: sizeItem ? [sizeItem] : [] },
  ];
}

/**
 * Builds DTO panels for a pivot table widget: `rows`, `columns`, and `values` (in that
 * order). Rows and columns are treated as attributes; values as measures. Grand totals
 * live on the style in the DTO and are written separately by
 * {@link toPivotTableWidgetStyle}.
 *
 * @param dataOptions - Pivot table data options from the WidgetModel
 * @returns Fusion panels: rows, columns, values
 * @internal
 */
export function toPivotTablePanels(dataOptions: PivotTableDataOptions): Panel[] {
  const rowItems: PanelItem[] = (dataOptions.rows ?? []).map((column) =>
    createPanelItem(normalizeColumn(column)),
  );
  const columnItems: PanelItem[] = (dataOptions.columns ?? []).map((column) =>
    createPanelItem(normalizeColumn(column)),
  );
  // Emit stable `field.id`/`field.index` on value items so pivot sort-by-measure
  // can reference them via `jaql.sortDetails.field` (see extractPivotTableChartDataOptions
  // which round-trips this via `valuesFieldIndexesMapping`).
  const valueItems: PanelItem[] = (dataOptions.values ?? []).map((column, index) => {
    const item = createPanelItem(normalizeMeasureColumn(column));
    return { ...item, field: { id: `${index}`, index } };
  });

  applyPivotRowsSorting({
    rows: dataOptions.rows ?? [],
    rowItems,
    columnItems,
    valueItems,
  });

  return [
    { name: 'rows', items: rowItems },
    { name: 'columns', items: columnItems },
    { name: 'values', items: valueItems },
  ];
}

/**
 * Maps a CSDK `SortDirection` to the `jaql` sort token. `sortNone` returns undefined
 * so no sort is written — matching how `createPanelItem` treats it.
 */
function toJaqlSortDir(direction: PivotRowsSort['direction']): 'asc' | 'desc' | undefined {
  if (direction === 'sortAsc') return 'asc';
  if (direction === 'sortDesc') return 'desc';
  return undefined;
}

/**
 * Reconstructs `sortDetails.measurePath` from `columnsMembersPath`. Forward translation
 * loses the keys (via `Object.values`), so we re-pair each member value with the `dim`
 * of the column at the same position — the shape Fusion writes in practice.
 */
function buildMeasurePath(
  columnsMembersPath: (string | number)[] | undefined,
  columnItems: PanelItem[],
): Record<string, string> | undefined {
  if (!columnsMembersPath || columnsMembersPath.length === 0) return undefined;
  const measurePath: Record<string, string> = {};
  columnsMembersPath.forEach((member, i) => {
    const columnJaql = columnItems[i]?.jaql as { dim?: string; title?: string } | undefined;
    const key = columnJaql?.dim ?? columnJaql?.title;
    if (key !== undefined) measurePath[key] = String(member);
  });
  return Object.keys(measurePath).length > 0 ? measurePath : undefined;
}

/**
 * Writes pivot row sorting back to the DTO shape. For a row whose `sortType` is a
 * `PivotRowsSort` with `by`, sorting lives on the referenced value panel item as
 * `jaql.sortDetails` — matching the forward read in `extractPivotTableChartDataOptions`.
 * A bare `{direction}` (no `by`) is a row-self sort, emitted as `jaql.sort` on the row.
 * Simple `SortDirection` strings are already handled inside `createPanelItem`.
 */
function applyPivotRowsSorting(params: {
  rows: NonNullable<PivotTableDataOptions['rows']>;
  rowItems: PanelItem[];
  columnItems: PanelItem[];
  valueItems: PanelItem[];
}): void {
  const { rows, rowItems, columnItems, valueItems } = params;
  rows.forEach((row, rowIndex) => {
    const sortType = (row as { sortType?: unknown }).sortType;
    if (!isPivotRowsSort(sortType)) return;
    const jaqlSort = toJaqlSortDir(sortType.direction);
    if (!jaqlSort) return;

    const valuesIndex = sortType.by?.valuesIndex;
    if (valuesIndex === undefined) {
      const rowItem = rowItems[rowIndex];
      if (rowItem) rowItem.jaql = { ...rowItem.jaql, sort: jaqlSort } as PanelItem['jaql'];
      return;
    }

    const target = valueItems[valuesIndex];
    if (!target || !target.field) return;
    const measurePath = buildMeasurePath(sortType.by?.columnsMembersPath, columnItems);
    // Emit the same metadata under both `sort` (consumed by pivot query helpers) and
    // `sortDetails` (consumed by `extractPivotTableChartDataOptions`) so the two
    // read paths stay in sync.
    const sortMetadata = {
      dir: jaqlSort,
      field: target.field.index,
      ...(measurePath ? { measurePath } : {}),
    };
    target.jaql = {
      ...target.jaql,
      sort: sortMetadata,
      sortDetails: sortMetadata,
    } as unknown as PanelItem['jaql'];
  });
}

/**
 * Builds DTO panels for a scattermap chart widget. All panels declared by the
 * Fusion scattermap manifest are always emitted (in this exact order: `geo`,
 * `color`, `size`, `details`), even when a slot has no column — Fusion's
 * renderer accesses panels by name and throws "the panel '<name>' was not found"
 * when a declared panel is missing. Slots without a column are emitted with
 * `items: []`.
 *
 * Each geo item carries its `geoLevel` when the styled column supplies one so
 * the country/state/city level round-trips. `color` holds a single measure
 * (range-colored in Fusion), `size` holds a single measure, `details` holds a
 * single attribute or measure.
 *
 * The size panel item additionally carries `format.size = { min, max }` when
 * marker-size options are provided. Fusion reads `items[0].format.size.min/max` at widget load and overwrites
 * `style.markers.size.min/max`, so this item-level format is the source of truth
 * for rendered marker sizes — emitting the style alone is not enough.
 *
 * @param dataOptions - Scattermap chart data options from the WidgetModel
 * @param markerSize - Optional marker-size options from WidgetModel.styleOptions.markers.size
 * @returns Fusion panels in fixed order; every declared panel is always present
 * @internal
 */
export function toScattermapPanels(
  dataOptions: ScattermapChartDataOptions,
  markerSize?: NonNullable<ScattermapStyleOptions['markers']>['size'],
): Panel[] {
  const geoItems: PanelItem[] = (dataOptions.geo ?? []).map((column) =>
    createPanelItem(normalizeColumn(column)),
  );
  const colorItems: PanelItem[] = dataOptions.colorBy
    ? [createPanelItem(normalizeMeasureColumn(dataOptions.colorBy))]
    : [];
  const sizeBaseItem = dataOptions.size
    ? createPanelItem(normalizeMeasureColumn(dataOptions.size))
    : undefined;

  const min = markerSize?.minSize;
  const max = markerSize?.maxSize;
  let sizeItem = sizeBaseItem;
  if (sizeBaseItem && (min !== undefined || max !== undefined)) {
    sizeItem = {
      ...sizeBaseItem,
      format: {
        ...sizeBaseItem.format,
        size: {
          ...(min !== undefined && { min }),
          ...(max !== undefined && { max }),
        },
      },
    };
  }
  const sizeItems: PanelItem[] = sizeItem ? [sizeItem] : [];
  const detailsItems: PanelItem[] = dataOptions.details
    ? [createPanelItem(normalizeAnyColumn(dataOptions.details))]
    : [];
  return [
    { name: 'geo', items: geoItems },
    { name: 'color', items: colorItems },
    { name: 'size', items: sizeItems },
    { name: 'details', items: detailsItems },
  ];
}

/**
 * Builds DTO panels for an areamap chart widget. All panels declared by the
 * Fusion areamap manifest are always emitted (in this exact order: `geo`,
 * `color`), even when a slot has no column — Fusion's renderer accesses panels
 * by name and throws "the panel '<name>' was not found" when a declared panel
 * is missing. Slots without a column are emitted with `items: []`.
 *
 * The geo slot is a single attribute (country/state). The color slot is a
 * single measure; Fusion's manifest range-colors it at render time.
 *
 * @param dataOptions - Areamap chart data options from the WidgetModel
 * @returns Fusion panels in fixed order; every declared panel is always present
 * @internal
 */
export function toAreamapPanels(dataOptions: AreamapChartDataOptions): Panel[] {
  const [geoColumn] = dataOptions.geo ?? [];
  const [colorColumn] = dataOptions.color ?? [];
  const geoItems: PanelItem[] = geoColumn ? [createPanelItem(normalizeColumn(geoColumn))] : [];
  const colorItems: PanelItem[] = colorColumn
    ? [createPanelItem(normalizeMeasureColumn(colorColumn))]
    : [];
  return [
    { name: 'geo', items: geoItems },
    { name: 'color', items: colorItems },
  ];
}

/**
 * Builds DTO panels for a boxplot chart widget. Emits `category` (0 or 1 attribute)
 * and `value` (the single target numeric attribute, treated as an attribute — not a
 * measure — to match the inverse read in `extractBoxplotChartDataOptions`). The
 * derived box/whisker measures live on `style.whisker` rather than on panels, so
 * they are written by {@link toBoxplotWidgetStyle} instead.
 *
 * @param dataOptions - Boxplot chart data options from the WidgetModel
 * @returns Fusion panels in fixed order: category, value
 * @internal
 */
export function toBoxplotPanels(dataOptions: BoxplotChartDataOptions): Panel[] {
  const [categoryColumn] = dataOptions.category ?? [];
  const [valueColumn] = dataOptions.value ?? [];
  const categoryItems: PanelItem[] = categoryColumn
    ? [createPanelItem(normalizeColumn(categoryColumn))]
    : [];
  const valueItems: PanelItem[] = valueColumn
    ? [createPanelItem(normalizeColumn(valueColumn))]
    : [];
  return [
    { name: 'category', items: categoryItems },
    { name: 'value', items: valueItems },
  ];
}

/**
 * Builds DTO panels for a calendar-heatmap widget. The Fusion `heatmap` manifest declares
 * `date` (single attribute) and `color` (single measure) panels — both are always emitted,
 * matching the inverse read in {@link extractCaledarHeatmapChartDataOptions}: an empty
 * `items: []` array is written when a slot has no column so Fusion's renderer can locate
 * each declared panel by name.
 *
 * Note: the DTO panel name for the measure slot is `color`, not `value` — the SDK's
 * {@link CalendarHeatmapChartDataOptions.value} is read from / written to the panel named
 * `color`.
 *
 * @param dataOptions - Calendar heatmap chart data options from the WidgetModel
 * @returns Fusion panels: date, color
 * @internal
 */
export function toCalendarHeatmapPanels(dataOptions: CalendarHeatmapChartDataOptions): Panel[] {
  const dateItems: PanelItem[] = dataOptions.date
    ? [createPanelItem(normalizeColumn(dataOptions.date))]
    : [];
  const colorItems: PanelItem[] = dataOptions.value
    ? [createPanelItem(normalizeMeasureColumn(dataOptions.value))]
    : [];
  return [
    { name: 'date', items: dateItems },
    { name: 'color', items: colorItems },
  ];
}

/**
 * Builds DTO panels for a plugin / custom widget. Each key in {@link GenericDataOptions}
 * becomes one panel; every Column is normalised then converted to a JAQL panel item via
 * the same helper chart widgets use, so the DTO round-trips through `fromWidgetDto`
 * without further translation. The `filters` key is reserved by the DTO schema and
 * emitted separately from `widgetModel.filters`, so it is skipped here.
 *
 * @param dataOptions - Generic data options keyed by the plugin's input names
 * @returns One Fusion panel per declared input
 * @internal
 */
export function toCustomWidgetPanels(dataOptions: GenericDataOptions | undefined): Panel[] {
  if (!dataOptions) return [];
  const panels: Panel[] = [];
  for (const [panelName, columns] of Object.entries(dataOptions)) {
    if (panelName === 'filters' || !Array.isArray(columns)) continue;
    panels.push({
      name: panelName,
      items: columns.map((column) => createPanelItem(normalizeAnyColumn(column))),
    });
  }
  return panels;
}
