import {
  CartesianChartDataOptionsInternal,
  ChartDataOptionsInternal,
  SeriesStyleOptions,
  Value,
} from '@/chart-data-options/types';
import { ChartStyleOptions, ChartType } from '@/types';
import { WithRequiredProp } from '@/utils/utility-types';
import pick from 'lodash-es/pick';
import merge from 'ts-deepmerge';
import { getDefaultStyleOptions } from '../chart-options-service';
import { DesignOptions, isCartesian, SeriesDesignOptions } from '../translations/types';
import { translateStyleOptionsToDesignOptions } from './translate-style-to-design-options';
import { getSeriesChartDesignOptions } from './translate-to-highcharts-options';

export function prepareChartDesignOptions(
  chartType: ChartType,
  dataOptionsInternal: ChartDataOptionsInternal,
  styleOptions?: ChartStyleOptions,
): DesignOptions {
  const styleOptionsWithDefaults = extendStyleOptionsWithDefaults(
    styleOptions ?? {},
    getDefaultStyleOptions(),
  );
  return translateStyleOptionsToDesignOptions(
    chartType,
    styleOptionsWithDefaults,
    dataOptionsInternal,
  );
}

export function extendStyleOptionsWithDefaults(
  styleOptions: ChartStyleOptions,
  defaults: ChartStyleOptions,
): ChartStyleOptions {
  return merge.withOptions(
    {
      mergeArrays: false,
    },
    defaults,
    styleOptions,
  ) as ChartStyleOptions;
}

export function getDesignOptionsPerSeries(
  dataOptionsInternal: ChartDataOptionsInternal,
  chartType: ChartType,
  styleOptions: ChartStyleOptions,
): Record<string, SeriesDesignOptions> {
  const seriesDesignOptions = getAllSeriesStyleOptions(dataOptionsInternal, chartType).map(
    (styleOptionsForSpecificSeries) => {
      const seriesId = styleOptionsForSpecificSeries.seriesId;
      const seriesStyleOptions = styleOptionsForSpecificSeries.seriesStyleOptions;
      const completeDesignOptions = getSeriesChartDesignOptions(
        chartType,
        extendStyleOptionsWithDefaults(seriesStyleOptions, styleOptions),
      );
      return {
        seriesId,
        designOptions: pick(completeDesignOptions, ['lineWidth', 'marker']),
      };
    },
  );
  return seriesDesignOptions.reduce(
    (acc, { seriesId, designOptions }) => ({ ...acc, [seriesId]: designOptions }),
    {},
  );
}

function getAllSeriesStyleOptions(
  dataOptions: ChartDataOptionsInternal,
  chartType: ChartType,
): StyleOptionsForSpecificSeries[] {
  if (isCartesian(chartType)) {
    return getStyleOptionsPerSeriesFromCartesianDataOptions(
      dataOptions as CartesianChartDataOptionsInternal,
    );
  }
  return [];
}

type StyleOptionsForSpecificSeries = {
  seriesId: string;
  seriesStyleOptions: SeriesStyleOptions;
};

function getStyleOptionsPerSeriesFromCartesianDataOptions(
  dataOptions: CartesianChartDataOptionsInternal,
): StyleOptionsForSpecificSeries[] {
  return dataOptions.y.filter(hasDefinedStyleOptionsForSeries).map((y) => ({
    seriesId: y.name,
    seriesStyleOptions: y.seriesStyleOptions,
  }));
}

function hasDefinedStyleOptionsForSeries(
  value: Value,
): value is WithRequiredProp<Value, 'seriesStyleOptions'> {
  return value.seriesStyleOptions !== undefined;
}
