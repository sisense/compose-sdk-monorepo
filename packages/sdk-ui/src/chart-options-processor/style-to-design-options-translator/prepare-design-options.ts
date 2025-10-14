import pick from 'lodash-es/pick';
import merge from 'ts-deepmerge';

import {
  CartesianChartDataOptionsInternal,
  ChartDataOptionsInternal,
  SeriesStyleOptions,
  StyledMeasureColumn,
} from '@/chart-data-options/types';
import { getChartBuilder } from '@/chart/restructured-charts/chart-builder-factory';
import { isRestructuredChartType } from '@/chart/restructured-charts/utils';
import { TranslatableError } from '@/translation/translatable-error';
import { ChartStyleOptions, ChartType } from '@/types';
import { WithRequiredProp } from '@/utils/utility-types';

import { getDefaultStyleOptions } from '../chart-options-service';
import { CartesianChartType, DesignOptions, SeriesDesignOptions } from '../translations/types';
import { translateStyleOptionsToDesignOptions as legacyTranslateStyleOptionsToDesignOptions } from './translate-style-to-design-options';
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
  if (isRestructuredChartType(chartType)) {
    const chartBuilder = getChartBuilder(chartType);
    if (!chartBuilder.designOptions.isCorrectStyleOptions(styleOptionsWithDefaults)) {
      throw new TranslatableError('errors.optionsTranslation.invalidStyleOptions', { chartType });
    }
    if (!chartBuilder.dataOptions.isCorrectDataOptionsInternal(dataOptionsInternal)) {
      throw new TranslatableError('errors.optionsTranslation.invalidInternalDataOptions', {
        chartType,
      });
    }
    return chartBuilder.designOptions.translateStyleOptionsToDesignOptions(
      styleOptionsWithDefaults,
      dataOptionsInternal,
    );
  } else {
    return legacyTranslateStyleOptionsToDesignOptions(
      chartType,
      styleOptionsWithDefaults,
      dataOptionsInternal,
    );
  }
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

/**
 * Get design options per series for cartesian charts
 */
export function getDesignOptionsPerSeries(
  dataOptionsInternal: CartesianChartDataOptionsInternal,
  chartType: CartesianChartType,
  styleOptions: ChartStyleOptions,
): Record<string, SeriesDesignOptions> {
  const seriesDesignOptions = getStyleOptionsPerSeries(dataOptionsInternal).map(
    (styleOptionsForSpecificSeries) => {
      const seriesId = styleOptionsForSpecificSeries.seriesId;
      const seriesStyleOptions = styleOptionsForSpecificSeries.seriesStyleOptions;
      const completeDesignOptions = getSeriesChartDesignOptions(
        chartType,
        extendStyleOptionsWithDefaults(seriesStyleOptions, styleOptions),
      );
      return {
        seriesId,
        designOptions: pick(completeDesignOptions, ['line', 'marker']),
      };
    },
  );
  return seriesDesignOptions.reduce(
    (acc, { seriesId, designOptions }) => ({ ...acc, [seriesId]: designOptions }),
    {},
  );
}

type StyleOptionsForSpecificSeries = {
  seriesId: string;
  seriesStyleOptions: SeriesStyleOptions;
};

function getStyleOptionsPerSeries(
  dataOptions: CartesianChartDataOptionsInternal,
): StyleOptionsForSpecificSeries[] {
  return dataOptions.y
    .filter(hasDefinedStyleOptionsForSeries)
    .map(({ column: { name }, seriesStyleOptions }) => ({
      seriesId: name,
      seriesStyleOptions: seriesStyleOptions,
    }));
}

function hasDefinedStyleOptionsForSeries(
  dataOption: StyledMeasureColumn,
): dataOption is WithRequiredProp<StyledMeasureColumn, 'seriesStyleOptions'> {
  return dataOption.seriesStyleOptions !== undefined;
}
