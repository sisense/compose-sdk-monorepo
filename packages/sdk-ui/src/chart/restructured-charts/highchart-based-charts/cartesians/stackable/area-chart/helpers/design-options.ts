import { CartesianChartDataOptionsInternal } from '@/chart-data-options/types';
import { getDefaultStyleOptions } from '@/chart-options-processor/chart-options-service';
import {
  extendStyleOptionsWithDefaults,
  getDesignOptionsPerSeries,
} from '@/chart-options-processor/style-to-design-options-translator/prepare-design-options';
import { getCartesianChartStyle } from '@/chart-options-processor/style-to-design-options-translator/translate-to-highcharts-options';
import { AreaChartDesignOptions } from '@/chart-options-processor/translations/design-options';
import {
  LineType,
  StackType,
} from '@/chart-options-processor/translations/translations-to-highcharts';
import { AreaStyleOptions, AreaSubtype, ChartStyleOptions, LineWidth, Markers } from '@/types';
import { Marker } from '@/chart-options-processor/translations/marker-section';
import { shouldHaveY2Axis } from '../../../helpers/data-options';
import flow from 'lodash-es/flow';

/**
 * Area subtype to lineType and stackType mapping (from legacy chartSubtypeToDesignOptions)
 */
const areaSubtypeToDesignOptions: Record<
  AreaSubtype,
  { lineType: LineType; stackType: StackType }
> = {
  'area/basic': { lineType: 'straight', stackType: 'classic' },
  'area/stacked': { lineType: 'straight', stackType: 'stacked' },
  'area/stacked100': { lineType: 'straight', stackType: 'stack100' },
  'area/spline': { lineType: 'smooth', stackType: 'classic' },
  'area/stackedspline': { lineType: 'smooth', stackType: 'stacked' },
  'area/stackedspline100': { lineType: 'smooth', stackType: 'stack100' },
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
  styleOptions: AreaStyleOptions,
  dataOptionsInternal: CartesianChartDataOptionsInternal,
): Partial<AreaChartDesignOptions> =>
  getCartesianChartStyle(styleOptions, shouldHaveY2Axis(dataOptionsInternal));

/**
 * Creates transformer to apply area-specific styles (width and markers)
 */
const withAreaSpecificStyles =
  (styleOptions: AreaStyleOptions) =>
  (options: Partial<AreaChartDesignOptions>): Partial<AreaChartDesignOptions> => ({
    ...options,
    line: {
      width:
        styleOptions.line?.width ??
        convertLineWidthToNumber(styleOptions.lineWidth || { width: 'thin' }),
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
  (styleOptions: AreaStyleOptions, dataOptionsInternal: CartesianChartDataOptionsInternal) =>
  (options: Partial<AreaChartDesignOptions>): Partial<AreaChartDesignOptions> => {
    const styleOptionsWithDefaults = extendStyleOptionsWithDefaults(
      styleOptions ?? {},
      getDefaultStyleOptions(),
    );
    const designPerSeries = getDesignOptionsPerSeries(
      dataOptionsInternal,
      'area',
      styleOptionsWithDefaults,
    );
    return {
      ...options,
      designPerSeries,
    };
  };

/**
 * Creates transformer to apply subtype-specific line type and stack type
 */
const withSubtypeBasedDesignOptions =
  (styleOptions: AreaStyleOptions) =>
  (options: Partial<AreaChartDesignOptions>): Partial<AreaChartDesignOptions> => {
    const subtype = styleOptions.subtype || 'area/basic';
    const subtypeOptions = areaSubtypeToDesignOptions[subtype];

    return subtypeOptions
      ? {
          ...options,
          lineType: subtypeOptions.lineType,
          stackType: subtypeOptions.stackType,
        }
      : options;
  };

/**
 * Creates transformer to apply stacking-specific options
 */
const withStackingOptions =
  (styleOptions: AreaStyleOptions) =>
  (options: Partial<AreaChartDesignOptions>): Partial<AreaChartDesignOptions> => ({
    ...options,
    showTotal: styleOptions.totalLabels?.enabled ?? false,
    totalLabelRotation: styleOptions.totalLabels?.rotation ?? 0,
  });

/**
 * Translates AreaStyleOptions to AreaChartDesignOptions using functional composition
 */
export function translateAreaStyleOptionsToDesignOptions(
  styleOptions: AreaStyleOptions,
  dataOptionsInternal: CartesianChartDataOptionsInternal,
): AreaChartDesignOptions {
  const baseOptions = getBasicCartesianDesignOptions(styleOptions, dataOptionsInternal);

  return flow(
    withAreaSpecificStyles(styleOptions),
    withDesignPerSeries(styleOptions, dataOptionsInternal),
    withSubtypeBasedDesignOptions(styleOptions),
    withStackingOptions(styleOptions),
  )(baseOptions) as AreaChartDesignOptions;
}

/**
 * Valid area chart subtypes
 */
const VALID_AREA_SUBTYPES: readonly string[] = [
  'area/basic',
  'area/stacked',
  'area/stacked100',
  'area/spline',
  'area/stackedspline',
  'area/stackedspline100',
] as const;

/**
 * Type guard to check if chart style options are valid for area charts
 * Uses functional approach without mutations
 */
export function isAreaStyleOptions(
  styleOptions: ChartStyleOptions,
): styleOptions is AreaStyleOptions {
  const hasSubtype = 'subtype' in styleOptions && styleOptions.subtype;
  return hasSubtype ? VALID_AREA_SUBTYPES.includes(styleOptions.subtype!) : true;
}
