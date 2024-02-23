import {
  CartesianChartDataOptionsInternal,
  ChartDataOptionsInternal,
  SeriesStyleOptions,
  Value,
} from '@/chart-data-options/types';
import { ChartStyleOptions, ChartType } from '@/types';
import { WithRequiredProp } from '@/utils/utility-types';
import { pick } from 'lodash';
import merge from 'ts-deepmerge';
import { getDefaultStyleOptions } from '../chart-options-service';
import { ChartDesignOptions, isCartesian, SeriesDesignOptions } from '../translations/types';
import { translateStyleOptionsToDesignOptions } from './translate-style-to-design-options';

export function prepareChartDesignOptions(
  chartType: ChartType,
  dataOptionsInternal: ChartDataOptionsInternal,
  styleOptions?: ChartStyleOptions,
): ChartDesignOptions {
  const globalStyleOptions = extendStyleOptionsWithDefaults(
    styleOptions ?? {},
    getDefaultStyleOptions(),
  );
  const globalDesign = translateStyleOptionsToDesignOptions(
    chartType,
    globalStyleOptions,
    dataOptionsInternal,
  );

  return {
    globalDesign,
    designPerSeries: getDesignOptionsPerSeries(dataOptionsInternal, chartType, globalStyleOptions),
  };
}

function extendStyleOptionsWithDefaults(
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

function getDesignOptionsPerSeries(
  dataOptionsInternal: ChartDataOptionsInternal,
  chartType: ChartType,
  globalStyleOptions: ChartStyleOptions,
): Record<string, SeriesDesignOptions> {
  const seriesDesignOptions = getAllSeriesStyleOptions(dataOptionsInternal, chartType).map(
    (styleOptionsForSpecificSeries) => {
      const seriesId = styleOptionsForSpecificSeries.seriesId;
      const seriesStyleOptions = styleOptionsForSpecificSeries.seriesStyleOptions;
      const completeDesignOptions = translateStyleOptionsToDesignOptions(
        chartType,
        extendStyleOptionsWithDefaults(seriesStyleOptions, globalStyleOptions),
        dataOptionsInternal,
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
