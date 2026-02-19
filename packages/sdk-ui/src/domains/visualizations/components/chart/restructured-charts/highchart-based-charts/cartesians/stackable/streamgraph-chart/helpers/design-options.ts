import flow from 'lodash-es/flow';
import merge from 'ts-deepmerge';

import { CartesianChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types.js';
import { getDefaultStyleOptions } from '@/domains/visualizations/core/chart-options-processor/chart-options-service.js';
import { getDesignOptionsPerSeries } from '@/domains/visualizations/core/chart-options-processor/style-to-design-options-translator/prepare-design-options.js';
import { getCartesianChartStyle } from '@/domains/visualizations/core/chart-options-processor/style-to-design-options-translator/translate-to-highcharts-options.js';
import { Marker } from '@/domains/visualizations/core/chart-options-processor/translations/marker-section.js';
import { ChartStyleOptions, LineWidth, Markers, StreamgraphStyleOptions } from '@/types';

import { shouldHaveY2Axis } from '../../../helpers/data-options.js';
import { StreamgraphChartDesignOptions } from '../types.js';

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
  styleOptions: StreamgraphStyleOptions,
  dataOptionsInternal: CartesianChartDataOptionsInternal,
): Partial<StreamgraphChartDesignOptions> =>
  getCartesianChartStyle(styleOptions, shouldHaveY2Axis(dataOptionsInternal));

/**
 * Creates transformer to apply streamgraph-specific styles (width and markers)
 */
const withStreamgraphSpecificStyles =
  (styleOptions: StreamgraphStyleOptions) =>
  (options: Partial<StreamgraphChartDesignOptions>): Partial<StreamgraphChartDesignOptions> => ({
    ...options,
    seriesTitles: {
      enabled: styleOptions.seriesTitles?.enabled ?? true,
      textStyle: styleOptions.seriesTitles?.textStyle,
    },
    line: {
      width:
        styleOptions.line?.width ??
        convertLineWidthToNumber(styleOptions.lineWidth || { width: 'thin' }),
      dashStyle: styleOptions.line?.dashStyle,
      endCap: styleOptions.line?.endCap,
      shadow: styleOptions.line?.shadow,
    },
    marker: convertMarkersToInternal(
      styleOptions?.markers ?? { enabled: false, fill: 'filled', size: 'small' },
    ),
  });

/**
 * Creates transformer to apply design per series configuration
 */
const withDesignPerSeries =
  (styleOptions: StreamgraphStyleOptions, dataOptionsInternal: CartesianChartDataOptionsInternal) =>
  (options: Partial<StreamgraphChartDesignOptions>): Partial<StreamgraphChartDesignOptions> => {
    const designPerSeries = getDesignOptionsPerSeries(
      dataOptionsInternal,
      'area', // Use area for now, similar rendering
      styleOptions,
    );
    return {
      ...options,
      designPerSeries,
    };
  };

/**
 * Creates transformer to apply series labels defaults
 */
const withSeriesLabelsDefaults =
  (styleOptions: StreamgraphStyleOptions) =>
  (options: Partial<StreamgraphChartDesignOptions>): Partial<StreamgraphChartDesignOptions> => {
    return {
      ...options,
      seriesLabels: {
        ...styleOptions.seriesLabels,
        enabled: styleOptions.seriesLabels?.enabled ?? false,
        rotation: styleOptions.seriesLabels?.rotation ?? 0,
        showValue:
          styleOptions.seriesLabels?.showValue ?? styleOptions.seriesLabels?.enabled ?? false,
        textStyle: {
          ...styleOptions.seriesLabels?.textStyle,
          color: styleOptions.seriesLabels?.textStyle?.color ?? '#000000',
        },
      },
    };
  };

/**
 * Translates StreamgraphStyleOptions to StreamgraphChartDesignOptions using functional composition
 */
export function translateStreamgraphStyleOptionsToDesignOptions(
  styleOptions: StreamgraphStyleOptions,
  dataOptionsInternal: CartesianChartDataOptionsInternal,
): StreamgraphChartDesignOptions {
  const baseOptions = getBasicCartesianDesignOptions(styleOptions, dataOptionsInternal);

  return flow(
    withStreamgraphSpecificStyles(styleOptions),
    withDesignPerSeries(styleOptions, dataOptionsInternal),
    withSeriesLabelsDefaults(styleOptions),
  )(baseOptions) as StreamgraphChartDesignOptions;
}

/**
 * Type guard to check if chart style options are valid for streamgraph charts.
 */
export function isStreamgraphStyleOptions(
  styleOptions: ChartStyleOptions,
): styleOptions is StreamgraphStyleOptions {
  return true;
}

export function getDefaultStreamgraphStyleOptions(): StreamgraphStyleOptions {
  const commonDefaults: StreamgraphStyleOptions =
    getDefaultStyleOptions() as StreamgraphStyleOptions;

  return merge(commonDefaults, {
    yAxis: {
      enabled: true,
      gridLines: true,
      labels: {
        enabled: false,
      },
      title: {
        enabled: false,
        text: '',
      },
    },
    xAxis: {
      gridLines: false,
    },
    legend: {
      enabled: false,
    },
  });
}
