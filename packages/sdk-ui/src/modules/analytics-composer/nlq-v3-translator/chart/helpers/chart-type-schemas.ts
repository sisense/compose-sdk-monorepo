/**
 * Schema metadata for chart JSON translation.
 * Single source of truth for valid chart types, dataOptions axes, and per-chart-type metadata.
 * Designed to be auto-generatable when charts are extended or new charts are added.
 *
 * @internal
 */
import { ALL_CHART_TYPES } from '@/domains/visualizations/core/chart-options-processor/translations/types.js';
import { ChartType } from '@/types.js';

/** Module-private set of chart types valid for NLQ translation (excludes 'image') */
const validChartTypesSet = new Set(
  (ALL_CHART_TYPES as readonly string[]).filter((t) => t !== 'image'),
);

/** Returns a defensive copy of the set of valid chart types. */
export function getValidChartTypes(): Set<string> {
  return new Set(validChartTypesSet);
}

/** Frozen array of chart types valid for NLQ translation (excludes 'image') */
export const VALID_CHART_TYPES_ARRAY = Object.freeze([...validChartTypesSet]);

/** Top-level ChartJSON keys */
export const CHART_JSON_TOP_LEVEL_KEYS = [
  'chartType',
  'dataOptions',
  'styleOptions',
  'filters',
  'highlights',
] as const;

/** Valid dataOptions axis keys (union of all chart types) */
export const VALID_DATA_OPTIONS_KEYS = new Set([
  'category',
  'value',
  'breakBy',
  'breakByPoint',
  'x',
  'y',
  'breakByColor',
  'size',
  'boxType',
  'outliers',
  'geo',
  'colorBy',
  'details',
  'color',
  'date',
  'columns',
  'rows',
  'values',
  'secondary',
  'min',
  'max',
  'seriesToColorMap',
]);

/** Per-chart-type axes metadata: valid axes and required axes */
export const CHART_TYPE_AXES_METADATA: Record<
  string,
  { validAxes: Set<string>; requiredAxes: string[] }
> = {
  line: {
    validAxes: new Set(['category', 'value', 'breakBy', 'seriesToColorMap']),
    requiredAxes: ['category', 'value'],
  },
  area: {
    validAxes: new Set(['category', 'value', 'breakBy', 'seriesToColorMap']),
    requiredAxes: ['category', 'value'],
  },
  bar: {
    validAxes: new Set(['category', 'value', 'breakBy', 'seriesToColorMap']),
    requiredAxes: ['category', 'value'],
  },
  column: {
    validAxes: new Set(['category', 'value', 'breakBy', 'seriesToColorMap']),
    requiredAxes: ['category', 'value'],
  },
  streamgraph: {
    validAxes: new Set(['category', 'value', 'breakBy', 'seriesToColorMap']),
    requiredAxes: ['category', 'value'],
  },
  polar: {
    validAxes: new Set(['category', 'value', 'breakBy', 'seriesToColorMap']),
    requiredAxes: ['category', 'value'],
  },
  pie: {
    validAxes: new Set(['category', 'value', 'seriesToColorMap']),
    requiredAxes: ['category', 'value'],
  },
  funnel: {
    validAxes: new Set(['category', 'value', 'seriesToColorMap']),
    requiredAxes: ['category', 'value'],
  },
  treemap: {
    validAxes: new Set(['category', 'value', 'seriesToColorMap']),
    requiredAxes: ['category', 'value'],
  },
  sunburst: {
    validAxes: new Set(['category', 'value', 'seriesToColorMap']),
    requiredAxes: ['category', 'value'],
  },
  scatter: {
    validAxes: new Set(['x', 'y', 'breakByPoint', 'breakByColor', 'size', 'seriesToColorMap']),
    requiredAxes: [],
  },
  table: {
    validAxes: new Set(['columns']),
    requiredAxes: ['columns'],
  },
  indicator: {
    validAxes: new Set(['value', 'secondary', 'min', 'max']),
    requiredAxes: [],
  },
  boxplot: {
    validAxes: new Set(['category', 'value', 'boxType', 'outliers']),
    requiredAxes: ['value'],
  },
  areamap: {
    validAxes: new Set(['geo', 'color']),
    requiredAxes: ['geo'],
  },
  scattermap: {
    validAxes: new Set(['geo', 'size', 'colorBy', 'details']),
    requiredAxes: ['geo'],
  },
  'calendar-heatmap': {
    validAxes: new Set(['date', 'value']),
    requiredAxes: ['date', 'value'],
  },
  arearange: {
    validAxes: new Set(['category', 'value', 'breakBy', 'seriesToColorMap']),
    requiredAxes: ['category', 'value'],
  },
};

/** Known dimension axes (used for axis type detection) */
export const DIMENSION_AXES = new Set([
  'category',
  'breakBy',
  'breakByPoint',
  'rows',
  'geo',
  'details',
  'date',
]);

/** Known measure axes (used for axis type detection) */
export const MEASURE_AXES = new Set([
  'value',
  'size',
  'colorBy',
  'boxType',
  'outliers',
  'values',
  'secondary',
  'min',
  'max',
  'color',
]);

/**
 * Returns valid/required axes metadata for a chart type.
 * Returns defensive copies so callers cannot mutate shared structures.
 *
 * @param chartType - The chart type to look up
 * @returns Metadata (with new Set and array copies) or undefined if chart type is unknown
 */
export function getChartTypeMetadata(chartType: string):
  | {
      validAxes: Set<string>;
      requiredAxes: readonly string[];
    }
  | undefined {
  const meta = CHART_TYPE_AXES_METADATA[chartType];
  if (!meta) return undefined;
  return {
    validAxes: new Set(meta.validAxes),
    requiredAxes: Object.freeze([...meta.requiredAxes]),
  };
}

/**
 * Type guard: value is a valid ChartType for NLQ translation.
 */
export function isValidChartType(value: unknown): value is ChartType {
  return typeof value === 'string' && validChartTypesSet.has(value);
}

/**
 * Checks if a key is a valid dataOptions axis.
 */
export function isValidDataOptionsKey(key: string): boolean {
  return VALID_DATA_OPTIONS_KEYS.has(key);
}
