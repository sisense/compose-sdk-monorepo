import {
  AreamapChartDataOptions,
  AreamapChartDataOptionsInternal,
  ChartDataOptions,
  ChartDataOptionsInternal,
} from '@/chart-data-options/types';
import {
  isMeasureColumn,
  normalizeColumn,
  normalizeMeasureColumn,
} from '@/chart-data-options/utils';
import { Attribute, Measure } from '@ethings-os/sdk-data';
import isArray from 'lodash-es/isArray.js';
import { ChartBuilder } from '../../types.js';

export const dataOptionsTranslators: ChartBuilder<'areamap'>['dataOptions'] = {
  translateDataOptionsToInternal: function (
    dataOptions: AreamapChartDataOptions,
  ): AreamapChartDataOptionsInternal {
    return {
      geo: dataOptions.geo && normalizeColumn(dataOptions.geo[0]),
      color: dataOptions.color && normalizeMeasureColumn(dataOptions.color[0]),
    };
  },

  getAttributes: function (internalDataOptions: AreamapChartDataOptionsInternal): Attribute[] {
    return [internalDataOptions.geo.column as Attribute].filter(
      (attribute) => !isMeasureColumn(attribute),
    );
  },

  getMeasures: function (internalDataOptions: AreamapChartDataOptionsInternal): Measure[] {
    const color = internalDataOptions.color?.column;
    return color && isMeasureColumn(color) ? [color as Measure] : [];
  },

  isCorrectDataOptions: function (
    dataOptions: ChartDataOptions,
  ): dataOptions is AreamapChartDataOptions {
    return 'geo' in dataOptions && isArray(dataOptions.geo);
  },

  isCorrectDataOptionsInternal: function (
    dataOptions: ChartDataOptionsInternal,
  ): dataOptions is AreamapChartDataOptionsInternal {
    return 'geo' in dataOptions && !!dataOptions.geo.column;
  },
};
