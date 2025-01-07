import { IndicatorLegacyChartDataOptions } from './indicator-legacy-chart-data-options';
import { IndicatorLegacyChartOptions } from '@/indicator-canvas';
import { overrideWithCustomSettings } from '@/utils/override-with-custom-settings';
import set from 'lodash-es/set';
import get from 'lodash-es/get';
import flow from 'lodash-es/flow';
import { LegacyIndicatorChartOptions } from './types';

/**
 * Indicator render options.
 */
export type IndicatorRenderOptions = {
  /** The primary value options. */
  value: {
    /** The primary value data. */
    data: number;
    /** The primary value text. */
    text: string;
    /** The primary value color. */
    color: string;
  };
  /** The secondary value options. */
  secondary: {
    /** The secondary value data. */
    data: number;
    /** The secondary value text. */
    text: string;
    /** The secondary value color. */
    color: string;
    /** The secondary value font weight. */
    fontWeight: string;
  };
  /** The title options. */
  title: {
    /** The title text. */
    text: string;
    /** The title color. */
    color: string;
  };
  /** The secondary title options. */
  secondaryTitle: {
    /** The secondary title text. */
    text: string;
    /** The secondary title color. */
    color: string;
  };
};

/**
 * Dictionary of how to map legacy data options to render options
 * [PATH_IN_LEGACY_CHART_OPTIONS]: [PATH_IN_RENDER_OPTIONS]
 */
const legacyDataOptionsToRenderOptionsDictionary = {
  'value.data': 'value.data',
  'value.text': 'value.text',
  'secondary.data': 'secondary.data',
  'secondary.text': 'secondary.text',
  'title.text': 'title.text',
  'secondaryTitle.text': 'secondaryTitle.text',
} as const;

/**
 * Dictionary of how to map legacy chart options to render options
 * [PATH_IN_LEGACY_CHART_OPTIONS]: [PATH_IN_RENDER_OPTIONS]
 */
const legacyChartOptionsToRenderOptionsDictionary = {
  'value.color': 'value.color',
  'secondaryValue.color': 'secondary.color',
  'secondaryValue.fontWeight': 'secondary.fontWeight',
  'title.color': 'title.color',
  'secondaryTitle.color': 'secondaryTitle.color',
} as const;

/**
 * Builds the render options from the legacy data and chart options.
 */
export function buildRenderOptionsFromLegacyOptions(
  legacyDataOptions: IndicatorLegacyChartDataOptions,
  legacyChartOptions: IndicatorLegacyChartOptions,
): IndicatorRenderOptions {
  const renderOptions: Partial<IndicatorRenderOptions> = {};

  return flow(
    withLegacyOptions(legacyDataOptions, legacyDataOptionsToRenderOptionsDictionary),
    withLegacyOptions(legacyChartOptions, legacyChartOptionsToRenderOptionsDictionary),
  )(renderOptions) as IndicatorRenderOptions;
}

/**
 * Applies the legacy data or chart options to the render options.
 */
function withLegacyOptions<
  LO extends LegacyIndicatorChartOptions | IndicatorLegacyChartDataOptions,
>(
  legacyOptions: LO,
  legacyOptionsToRenderOptionsDictionary: Record<string, string>,
): (renderOptions: Partial<IndicatorRenderOptions>) => Partial<IndicatorRenderOptions> {
  return (renderOptions) => {
    const updatedRenderOptions = { ...renderOptions };
    for (const [legacyPath, renderPath] of Object.entries(legacyOptionsToRenderOptionsDictionary)) {
      set(updatedRenderOptions, renderPath, get(legacyOptions, legacyPath));
    }

    return updatedRenderOptions;
  };
}

/**
 * Applies the indicator render options to the legacy data and chart options.
 */
export const applyIndicatorRenderOptions = (
  indicatorRenderOptions: IndicatorRenderOptions,
  legacyDataOptions: IndicatorLegacyChartDataOptions,
  legacyChartOptions: IndicatorLegacyChartOptions,
): {
  legacyDataOptions: IndicatorLegacyChartDataOptions;
  legacyChartOptions: IndicatorLegacyChartOptions;
} => {
  const overriddenLegacyDataOptions = overrideWithCustomSettings(
    indicatorRenderOptions,
    legacyDataOptionsToRenderOptionsDictionary,
    legacyDataOptions,
  );

  const overriddenLegacyChartOptions = overrideWithCustomSettings(
    indicatorRenderOptions,
    legacyChartOptionsToRenderOptionsDictionary,
    legacyChartOptions,
  );

  return {
    legacyDataOptions: overriddenLegacyDataOptions,
    legacyChartOptions: overriddenLegacyChartOptions,
  };
};
