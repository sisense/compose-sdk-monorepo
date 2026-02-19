import flow from 'lodash-es/flow';

import { CartesianChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types.js';
import { getDefaultStyleOptions } from '@/domains/visualizations/core/chart-options-processor/chart-options-service.js';
import {
  extendStyleOptionsWithDefaults,
  getDesignOptionsPerSeries,
} from '@/domains/visualizations/core/chart-options-processor/style-to-design-options-translator/prepare-design-options.js';
import { getCartesianChartStyle } from '@/domains/visualizations/core/chart-options-processor/style-to-design-options-translator/translate-to-highcharts-options.js';
import { LineChartDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/design-options.js';
import { Marker } from '@/domains/visualizations/core/chart-options-processor/translations/marker-section.js';
import { LineType } from '@/domains/visualizations/core/chart-options-processor/translations/translations-to-highcharts.js';
import { ChartStyleOptions, LineStyleOptions, LineSubtype, LineWidth, Markers } from '@/types';

import { shouldHaveY2Axis } from '../../helpers/data-options.js';

/**
 * Line subtype to lineType mapping (from legacy chartSubtypeToDesignOptions)
 */
const lineSubtypeToLineType: Record<LineSubtype, LineType> = {
  'line/basic': 'straight',
  'line/spline': 'smooth',
  'line/step': 'straight',
};

/**
 * Pure function to convert LineWidth to numeric value
 */
const convertLineWidthToNumber = (lineWidth: LineWidth): number => {
  const widthMap: Record<LineWidth['width'], number> = {
    thin: 1,
    bold: 3,
    thick: 5,
  };
  return widthMap[lineWidth.width];
};

/**
 * Pure function to convert Markers to internal Marker format
 */
const convertMarkersToInternal = (markers: Markers): Marker => ({
  enabled: markers.enabled,
  fill: markers.fill === 'filled' ? 'full' : 'hollow',
  size: markers.size === 'small' ? 'small' : 'large',
});

/**
 * Gets base cartesian design options
 */
const getBasicCartesianDesignOptions = (
  styleOptions: LineStyleOptions,
  dataOptionsInternal: CartesianChartDataOptionsInternal,
): Partial<LineChartDesignOptions> =>
  getCartesianChartStyle(styleOptions, shouldHaveY2Axis(dataOptionsInternal));

/**
 * Creates transformer to apply line-specific styles (width and markers)
 */
const withLineSpecificStyles =
  (styleOptions: LineStyleOptions) =>
  (options: Partial<LineChartDesignOptions>): Partial<LineChartDesignOptions> => ({
    ...options,
    line: {
      width:
        styleOptions.line?.width ??
        convertLineWidthToNumber(styleOptions.lineWidth || { width: 'bold' }),
      dashStyle: styleOptions.line?.dashStyle,
      endCap: styleOptions.line?.endCap,
      shadow: styleOptions.line?.shadow,
    },
    marker: convertMarkersToInternal(
      styleOptions?.markers ?? { enabled: true, fill: 'filled', size: 'small' },
    ),
  });

/**
 * Creates transformer to apply design per series configuration
 */
const withDesignPerSeries =
  (styleOptions: LineStyleOptions, dataOptionsInternal: CartesianChartDataOptionsInternal) =>
  (options: Partial<LineChartDesignOptions>): Partial<LineChartDesignOptions> => {
    const styleOptionsWithDefaults = extendStyleOptionsWithDefaults(
      styleOptions ?? {},
      getDefaultStyleOptions(),
    );
    const designPerSeries = getDesignOptionsPerSeries(
      dataOptionsInternal,
      'line',
      styleOptionsWithDefaults,
    );
    return {
      ...options,
      designPerSeries,
    };
  };

/**
 * Creates transformer to apply subtype-specific line type
 */
const withLineTypeFromSubtype =
  (styleOptions: LineStyleOptions) =>
  (options: Partial<LineChartDesignOptions>): Partial<LineChartDesignOptions> => {
    const subtype = styleOptions.subtype || 'line/basic';
    const lineType = lineSubtypeToLineType[subtype];
    return lineType ? { ...options, lineType } : options;
  };

/**
 * Creates transformer to apply step line configuration
 */
const withStepLineConfiguration =
  (styleOptions: LineStyleOptions) =>
  (options: Partial<LineChartDesignOptions>): Partial<LineChartDesignOptions> => {
    const stepConfiguration =
      styleOptions.subtype === 'line/step'
        ? { step: styleOptions.stepPosition || ('left' as const) }
        : {};

    return {
      ...options,
      ...stepConfiguration,
    };
  };

/**
 * Translates LineStyleOptions to LineChartDesignOptions using functional composition
 */
export function translateLineStyleOptionsToDesignOptions(
  styleOptions: LineStyleOptions,
  dataOptionsInternal: CartesianChartDataOptionsInternal,
): LineChartDesignOptions {
  const baseOptions = getBasicCartesianDesignOptions(styleOptions, dataOptionsInternal);

  return flow(
    withLineSpecificStyles(styleOptions),
    withDesignPerSeries(styleOptions, dataOptionsInternal),
    withLineTypeFromSubtype(styleOptions),
    withStepLineConfiguration(styleOptions),
  )(baseOptions) as LineChartDesignOptions;
}

/**
 * Valid line chart subtypes
 */
const VALID_LINE_SUBTYPES: readonly string[] = ['line/basic', 'line/spline', 'line/step'] as const;

/**
 * Type guard to check if chart style options are valid for line charts
 * Uses functional approach without mutations
 */
export function isLineStyleOptions(
  styleOptions: ChartStyleOptions,
): styleOptions is LineStyleOptions {
  const hasSubtype = 'subtype' in styleOptions && styleOptions.subtype;
  return hasSubtype ? VALID_LINE_SUBTYPES.includes(styleOptions.subtype!) : true;
}
