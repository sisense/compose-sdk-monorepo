import type {
  BoxplotWidgetStyle,
  CalendarHeatmapWidgetStyle,
  CartesianWidgetStyle,
  IndicatorWidgetStyle,
  PieWidgetStyle,
  PivotWidgetStyle,
  PolarWidgetStyle,
  ScattermapWidgetStyle,
  ScatterWidgetStyle,
  SunburstWidgetStyle,
  TableWidgetStyle,
  WidgetDto,
  WidgetStyle,
} from '../types.js';

/**
 * Loose record of unsupported style fields preserved from the original
 * Fusion DTO. Returned by {@link extractUnsupportedStyleOptions}.
 *
 * Typed as `Record<string, unknown>` because the keys and shapes go beyond
 * what `WidgetStyle` declares — e.g. `'center/value'` on sunburst, or
 * `'borders/grid'` on table widgets. Stored on
 * `SpecificWidgetOptions.partialDtoOptions.style` and re-attached when
 * serializing back to a DTO via `applyPartialDtoStyle` so values survive
 * Fusion → CSDK → Fusion round-trips.
 *
 * @internal
 */
export type UnsupportedStyleOptions = Record<string, unknown>;

/** A loose record used while plucking unsupported subfields off the raw DTO. */
type Bag = Record<string, unknown>;

const isPlainObject = (v: unknown): v is Bag =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const hasKeys = (v: Bag): boolean => Object.keys(v).length > 0;

/**
 * Picks a subset of fields from `source`, returning `undefined` when none of the
 * requested keys are present (so callers can spread the result conditionally).
 *
 * Accepts `unknown` so callers don't need to cast typed widget styles whose
 * field shapes are narrower than the keys we want to read.
 */
function pickDefined<K extends string>(
  source: unknown,
  keys: readonly K[],
): Record<K, unknown> | undefined {
  if (!isPlainObject(source)) return undefined;
  const out: Bag = {};
  for (const key of keys) {
    if (source[key] !== undefined) out[key] = source[key];
  }
  return hasKeys(out) ? (out as Record<K, unknown>) : undefined;
}

/**
 * Extracts axis fields that the CSDK model does not capture: `inactive`,
 * `ticks`, `labels.rotation`, `labels.step`, `labels.stepInterval`. Used by
 * Cartesian (line/area/bar/column), polar (categories/axis), scatter, and
 * boxplot.
 *
 * `labels.step` and `labels.stepInterval` both originate from Fusion's editor:
 * the default style template seeds `labels.stepInterval: null`, while the
 * "every N items" input in `axisLabelsDirective.html` writes to `labels.step`
 * via two-way binding. Both are preserved so user-entered values survive a
 * Fusion → CSDK → Fusion round-trip.
 */
function pickUnsupportedAxisFields(axis: unknown): Bag | undefined {
  if (!isPlainObject(axis)) return undefined;
  const out: Bag = {};
  if (axis.inactive !== undefined) out.inactive = axis.inactive;
  if (axis.ticks !== undefined) out.ticks = axis.ticks;
  const labels = pickDefined(axis.labels, ['rotation', 'step', 'stepInterval'] as const);
  if (labels) out.labels = labels;
  return hasKeys(out) ? out : undefined;
}

const CARTESIAN_AXIS_KEYS = ['xAxis', 'yAxis', 'y2Axis'] as const;

function extractCartesianUnsupported(
  style: CartesianWidgetStyle | BoxplotWidgetStyle,
): UnsupportedStyleOptions {
  const out: Bag = {};
  for (const key of CARTESIAN_AXIS_KEYS) {
    const axis = pickUnsupportedAxisFields((style as unknown as Bag)[key]);
    if (axis) out[key] = axis;
  }
  return out;
}

function extractPolarUnsupported(style: PolarWidgetStyle): UnsupportedStyleOptions {
  const out: Bag = {};
  const categories = pickUnsupportedAxisFields(style.categories);
  if (categories) out.categories = categories;
  const axis = pickUnsupportedAxisFields(style.axis);
  if (axis) out.axis = axis;
  return out;
}

function extractScatterUnsupported(style: ScatterWidgetStyle): UnsupportedStyleOptions {
  const out: Bag = {};
  const xAxis = pickUnsupportedAxisFields(style.xAxis);
  if (xAxis) out.xAxis = xAxis;
  const yAxis = pickUnsupportedAxisFields(style.yAxis);
  if (yAxis) out.yAxis = yAxis;

  const markerSize = pickDefined(style.markerSize, [
    'isRange',
    'lowest',
    'highest',
    'step',
  ] as const);
  if (markerSize) out.markerSize = markerSize;

  const dataLimits = pickDefined((style as unknown as Bag).dataLimits, [
    'categoriesCapacityX',
    'categoriesCapacityY',
  ] as const);
  if (dataLimits) out.dataLimits = dataLimits;

  return out;
}

function extractBoxplotUnsupported(style: BoxplotWidgetStyle): UnsupportedStyleOptions {
  const out: Bag = { ...extractCartesianUnsupported(style) };

  // Fusion's boxplot editor (boxplot.html) binds the bottom-of-axis title to
  // `model.xAxis.x2Title.{enabled,text}` even though boxplot is single-axis.
  // The cartesian main extractor only emits `x2Title` in the dual-axis case
  // (handled inside `extractCartesianChartAxisOptions`), so a user-entered
  // value would otherwise be lost on round-trip — preserve it here.
  const xAxis = (style as unknown as Bag).xAxis;
  const x2Title = isPlainObject(xAxis)
    ? pickDefined(xAxis.x2Title, ['enabled', 'text'] as const)
    : undefined;
  if (x2Title) {
    out.xAxis = { ...(out.xAxis as Bag), x2Title };
  }

  const outliers = pickDefined(style.outliers, ['enabled'] as const);
  if (outliers) out.outliers = outliers;

  const whisker = pickDefined(style.whisker, [
    'whisker/iqr',
    'whisker/extremums',
    'whisker/deviation',
  ] as const);
  if (whisker) out.whisker = whisker;

  return out;
}

function extractPieUnsupported(style: PieWidgetStyle): UnsupportedStyleOptions {
  const labels = pickDefined(style.labels, ['fontFamily'] as const);
  return labels ? { labels } : {};
}

function extractSunburstUnsupported(style: SunburstWidgetStyle): UnsupportedStyleOptions {
  return (
    pickDefined(style, [
      'center/value',
      'center/contribution',
      'center/contributionToParent',
    ] as const) ?? {}
  );
}

const INDICATOR_VARIANT_KEYS = ['indicator/numeric', 'indicator/gauge'] as const;
const INDICATOR_COMPONENT_KEYS = ['title', 'icon', 'secondaryTitle', 'ticks', 'labels'] as const;
const INDICATOR_COMPONENT_FIELDS = ['inactive', 'enabled'] as const;

function pickIndicatorVariant(variant: unknown): Bag | undefined {
  if (!isPlainObject(variant) || !isPlainObject(variant.components)) return undefined;
  const components: Bag = {};
  for (const compKey of INDICATOR_COMPONENT_KEYS) {
    const picked = pickDefined(variant.components[compKey], INDICATOR_COMPONENT_FIELDS);
    if (picked) components[compKey] = picked;
  }
  return hasKeys(components) ? { components } : undefined;
}

function extractIndicatorUnsupported(style: IndicatorWidgetStyle): UnsupportedStyleOptions {
  const out: Bag = {};
  for (const key of INDICATOR_VARIANT_KEYS) {
    const variant = pickIndicatorVariant((style as unknown as Bag)[key]);
    if (variant) out[key] = variant;
  }
  return out;
}

function extractPivotUnsupported(style: PivotWidgetStyle): UnsupportedStyleOptions {
  // `scroll` is undeclared on the CSDK type but exists on pivot2 DTOs.
  return pickDefined(style, ['rowsGrandTotal', 'columnsGrandTotal', 'scroll'] as const) ?? {};
}

const TABLE_UNSUPPORTED_KEYS = [
  'borders/all',
  'borders/grid',
  'borders/rows',
  'borders/columns',
  'wordwrap/headers',
  'wordwrap/rows',
  'scroll',
  'tableState',
] as const;

function extractTableUnsupported(style: TableWidgetStyle): UnsupportedStyleOptions {
  return pickDefined(style, TABLE_UNSUPPORTED_KEYS) ?? {};
}

function extractCalendarHeatmapUnsupported(
  style: CalendarHeatmapWidgetStyle,
): UnsupportedStyleOptions {
  return (
    pickDefined(style, ['orient/horizontal', 'orient/vertical', 'view/monthly'] as const) ?? {}
  );
}

function extractScattermapUnsupported(style: ScattermapWidgetStyle): UnsupportedStyleOptions {
  const size = pickDefined(style.markers?.size, ['inactive', 'lowest', 'highest', 'step'] as const);
  return size ? { markers: { size } } : {};
}

function extractAreamapUnsupported(style: WidgetStyle): UnsupportedStyleOptions {
  const legend = pickDefined((style as unknown as Bag).legend, ['enabled', 'position'] as const);
  return legend ? { legend } : {};
}

const EXTRACTORS: Partial<
  Record<WidgetDto['type'], (style: WidgetStyle) => UnsupportedStyleOptions>
> = {
  'chart/line': (s) => extractCartesianUnsupported(s as CartesianWidgetStyle),
  'chart/area': (s) => extractCartesianUnsupported(s as CartesianWidgetStyle),
  'chart/bar': (s) => extractCartesianUnsupported(s as CartesianWidgetStyle),
  'chart/column': (s) => extractCartesianUnsupported(s as CartesianWidgetStyle),
  'chart/polar': (s) => extractPolarUnsupported(s as PolarWidgetStyle),
  'chart/scatter': (s) => extractScatterUnsupported(s as ScatterWidgetStyle),
  'chart/boxplot': (s) => extractBoxplotUnsupported(s as BoxplotWidgetStyle),
  'chart/pie': (s) => extractPieUnsupported(s as PieWidgetStyle),
  sunburst: (s) => extractSunburstUnsupported(s as SunburstWidgetStyle),
  indicator: (s) => extractIndicatorUnsupported(s as IndicatorWidgetStyle),
  pivot: (s) => extractPivotUnsupported(s as PivotWidgetStyle),
  pivot2: (s) => extractPivotUnsupported(s as PivotWidgetStyle),
  tablewidget: (s) => extractTableUnsupported(s as TableWidgetStyle),
  tablewidgetagg: (s) => extractTableUnsupported(s as TableWidgetStyle),
  heatmap: (s) => extractCalendarHeatmapUnsupported(s as CalendarHeatmapWidgetStyle),
  'map/scatter': (s) => extractScattermapUnsupported(s as ScattermapWidgetStyle),
  'map/area': extractAreamapUnsupported,
};

/**
 * Extracts the style fields that the CSDK widget model does not currently
 * translate to first-class `WidgetStyleOptions` for the given widget type.
 *
 * The result is stored on `SpecificWidgetOptions.partialDtoOptions.style` and
 * re-attached during CSDK → Fusion serialization (see `applyPartialDtoStyle`).
 * Returns an empty object for widget types that have no known unsupported
 * style fields, or for unknown / plugin types whose raw style is opaque to
 * the CSDK.
 *
 * @param widgetType - Fusion widget type from `WidgetDto.type`
 * @param style - Raw `WidgetDto.style` from the server
 * @returns A partial style containing only known-unsupported fields
 * @internal
 */
export function extractUnsupportedStyleOptions(
  widgetType: WidgetDto['type'],
  style: WidgetStyle | undefined,
): UnsupportedStyleOptions {
  if (!style) return {};
  const extractor = EXTRACTORS[widgetType];
  return extractor ? extractor(style) : {};
}
