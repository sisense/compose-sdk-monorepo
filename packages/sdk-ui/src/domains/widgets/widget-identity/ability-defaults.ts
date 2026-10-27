import { DEFAULT_CHART_SIZE } from '@/shared/components/dynamic-size-container/default-sizes';

import type { WidgetAbilities, WidgetInteraction } from './types';

/**
 * Every value of {@link WidgetAbilities.data}, for validating untrusted input.
 *
 * @internal
 */
export const WIDGET_DATA_KINDS = Object.freeze([
  'none',
  'members',
  'query',
] as const satisfies readonly WidgetAbilities['data'][]);

/**
 * Every {@link WidgetInteraction}, for validating untrusted input.
 *
 * @internal
 */
export const WIDGET_INTERACTIONS = Object.freeze([
  'widgetClick',
  'dataPointClick',
  'dataPointContextMenu',
  'dataPointsSelect',
] as const satisfies readonly WidgetInteraction[]);

/**
 * Overrides of a base {@link WidgetAbilities} value. `layout` is merged field by field.
 *
 * @internal
 */
export type WidgetAbilityOverrides = Partial<Omit<WidgetAbilities, 'layout'>> & {
  readonly layout?: Partial<WidgetAbilities['layout']>;
};

/**
 * Returns a deep-frozen copy of an abilities value.
 *
 * @param abilities - The abilities to freeze.
 * @returns The frozen copy.
 * @internal
 */
export const freezeAbilities = (abilities: WidgetAbilities): WidgetAbilities =>
  Object.freeze({
    ...abilities,
    interactions: Object.freeze([...abilities.interactions]),
    layout: Object.freeze({
      ...abilities.layout,
      defaultSize: Object.freeze({ ...abilities.layout.defaultSize }),
    }),
  });

/**
 * Applies overrides to a base abilities value. Pure: returns a new, frozen value.
 *
 * @param base - The abilities to start from.
 * @param overrides - The fields that differ from `base`.
 * @returns The merged abilities.
 * @internal
 */
export const withAbilityOverrides = (
  base: WidgetAbilities,
  overrides: WidgetAbilityOverrides,
): WidgetAbilities =>
  freezeAbilities({
    ...base,
    ...overrides,
    layout: { ...base.layout, ...overrides.layout },
  });

/**
 * The data-point events of query-driven visualizations.
 *
 * @internal
 */
export const DATA_POINT_INTERACTIONS = Object.freeze([
  'dataPointClick',
  'dataPointContextMenu',
  'dataPointsSelect',
] as const satisfies readonly WidgetInteraction[]);

/**
 * Family default of the built-in chart types: a query, the data-point events of the shared chart
 * renderers, highlights, and the default chart size.
 *
 * @internal
 */
export const CHART_ABILITIES: WidgetAbilities = freezeAbilities({
  data: 'query',
  interactions: DATA_POINT_INTERACTIONS,
  highlights: true,
  drilldown: false,
  layout: { autoHeight: false, defaultSize: DEFAULT_CHART_SIZE },
});

/**
 * Family default of the chart types that accept drilled data options: cartesian (including
 * polar), categorical, scatter, boxplot, range and sankey charts, the chart types
 * `isDrilldownApplicableToChart` supports.
 *
 * @internal
 */
export const DRILLABLE_CHART_ABILITIES: WidgetAbilities = withAbilityOverrides(CHART_ABILITIES, {
  drilldown: true,
});

/**
 * The events of chart types whose renderer emits only `dataPointClick` (indicator and the maps).
 *
 * @internal
 */
export const CLICK_ONLY_INTERACTIONS: WidgetAbilities['interactions'] = Object.freeze([
  'dataPointClick',
] as const satisfies readonly WidgetInteraction[]);

/**
 * Family default of the non-chart widget types that run no query: no events, no highlights, and
 * the default chart size (layouts size them as charts).
 *
 * @internal
 */
export const NO_QUERY_ABILITIES: WidgetAbilities = withAbilityOverrides(CHART_ABILITIES, {
  data: 'none',
  interactions: [],
  highlights: false,
});

/**
 * Abilities every widget plugin gets unless its manifest declares otherwise: what plugins get
 * today.
 *
 * @sisenseInternal
 */
export const PLUGIN_ABILITY_DEFAULTS: WidgetAbilities = freezeAbilities({
  data: 'query',
  interactions: DATA_POINT_INTERACTIONS,
  highlights: true,
  drilldown: false,
  layout: { autoHeight: false, defaultSize: DEFAULT_CHART_SIZE },
});
