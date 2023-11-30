import { MetadataItem } from '@sisense/sdk-query-client';
import merge from 'ts-deepmerge';
import {
  getDataOptionTitle,
  translateColumnToCategoryOrValue,
} from '../../chart-data-options/utils';
import { ChartSubtype } from '../../chart-options-processor/subtype-to-design-options';
import {
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  ChartType,
  StyleOptions,
} from '../../types';
import { AxesMapping, ChartRecommendations } from '../api/types';
import { createJaqlElement } from './jaql-element';

export const getTableOptions = (jaql: MetadataItem[]) => {
  const columns = jaql.map(createJaqlElement);

  return {
    dataOptions: { columns },
  };
};

const DEFAULT_STYLE_OPTIONS = Object.freeze<StyleOptions>({
  convolution: {
    enabled: true,
    selectedConvolutionType: 'bySlicesCount',
    independentSlicesCount: 7,
  },
  markers: {
    enabled: false,
  },
  legend: {
    enabled: false,
  },
  yAxis: {
    gridLines: false,
  },
  xAxis: {
    gridLines: false,
  },
});

const DEFAULT_SUBTYPE_FOR = Object.freeze<Partial<Record<ChartType, ChartSubtype>>>({
  line: 'line/spline',
  pie: 'pie/donut',
});

const mapToCartesianDataOptions = (
  metadataItems: MetadataItem[],
  axesMapping: AxesMapping,
): CartesianChartDataOptions => {
  const metadataItemByTitle = metadataItems.reduce((acc, item) => {
    acc[item.jaql.title!] = item;
    return acc;
  }, {} as Record<string, MetadataItem>);

  return {
    category:
      axesMapping.category?.map((item) => createJaqlElement(metadataItemByTitle[item.name])) ?? [],
    value:
      axesMapping.value?.map((item) => ({
        column: createJaqlElement(metadataItemByTitle[item.name]),
        sortType: 'sortNone',
      })) ?? [],
    breakBy:
      axesMapping.breakBy?.map((item) => createJaqlElement(metadataItemByTitle[item.name])) ?? [],
  };
};

// TODO: this should be removed once the backend is giving us data in the
// "category" field instead of "breakBy" for categorical charts.
const mapToCategoricalDataOptions = (
  metadataItems: MetadataItem[],
  axesMapping: AxesMapping,
): CategoricalChartDataOptions => {
  const metadataItemByTitle = metadataItems.reduce((acc, item) => {
    acc[item.jaql.title!] = item;
    return acc;
  }, {} as Record<string, MetadataItem>);

  return {
    category:
      axesMapping.breakBy?.map((item) => createJaqlElement(metadataItemByTitle[item.name])) ?? [],
    value:
      axesMapping.value?.map((item) => ({
        column: createJaqlElement(metadataItemByTitle[item.name]),
        sortType: 'sortNone',
      })) ?? [],
  };
};

export const getChartOptions = (jaql: MetadataItem[], chartRecs: ChartRecommendations) => {
  let dataOptions: CategoricalChartDataOptions | CartesianChartDataOptions;
  if (chartRecs.chartFamily === 'categorical') {
    dataOptions = mapToCategoricalDataOptions(jaql, chartRecs.axesMapping);
  } else {
    dataOptions = mapToCartesianDataOptions(jaql, chartRecs.axesMapping);
  }

  const styleOptions = merge(DEFAULT_STYLE_OPTIONS, {
    subtype: DEFAULT_SUBTYPE_FOR[chartRecs.chartType],
  }) as StyleOptions;
  const expandedStyleOptions = merge(styleOptions, {
    legend: {
      enabled: true,
      position: 'right',
    },
    yAxis: {
      title: {
        enabled: true,
        text: getDataOptionTitle(translateColumnToCategoryOrValue(dataOptions.value[0] ?? {})),
      },
    },
    xAxis: {
      title: {
        enabled: true,
        text: getDataOptionTitle(translateColumnToCategoryOrValue(dataOptions.category[0] ?? {})),
      },
    },
  }) as StyleOptions;

  return {
    dataOptions,
    styleOptions,
    expandedStyleOptions,
  };
};
