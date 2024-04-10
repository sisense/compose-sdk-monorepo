import { MetadataItem } from '@sisense/sdk-query-client';
import merge from 'ts-deepmerge';
import { ChartSubtype } from '../../chart-options-processor/subtype-to-design-options';
import {
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  ChartDataOptions,
  ChartType,
  ChartStyleOptions,
} from '../../types';
import { ChartRecommendations, NlqResponseData } from '../api/types';
import { createJaqlElement } from './jaql-element';

export const getChartRecommendationsOrDefault = (
  response: NlqResponseData,
): ChartRecommendations => {
  if ('chartType' in response.chartRecommendations) {
    return response.chartRecommendations;
  }

  return {
    chartType: 'table',
    chartFamily: 'table',
    axesMapping: {},
  };
};

export const getTableOptions = (jaql: MetadataItem[]) => {
  const columns = jaql.map(createJaqlElement);

  return {
    dataOptions: { columns },
  };
};

const DEFAULT_STYLE_OPTIONS = Object.freeze<ChartStyleOptions>({
  convolution: {
    enabled: true,
    selectedConvolutionType: 'bySlicesCount',
    independentSlicesCount: 7,
  },
  lineWidth: { width: 'bold' },
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
  bar: 'bar/stacked',
  column: 'column/stackedcolumn',
});

const mapToDataOptions = (
  metadataItems: MetadataItem[],
  chartRecommendations: ChartRecommendations,
): ChartDataOptions => {
  const { axesMapping, chartFamily } = chartRecommendations;
  const metadataItemByTitle = metadataItems.reduce((acc, item) => {
    acc[item.jaql.title!] = item;
    return acc;
  }, {} as Record<string, MetadataItem>);

  const intermediateOptions = Object.entries(axesMapping).reduce((acc, item) => {
    const [key, value] = item;

    acc[key] = value.map((v) => {
      const m = metadataItemByTitle[v.name];
      // this will generate an error in the chart instead of failing
      // error will contain the name of the problematic item
      // TODO: remove when proper validation is introduced
      if (!m) return { column: { type: '', name: v.name } };
      const column = createJaqlElement(m);

      if (m.panel === 'measures') {
        return {
          column,
          sortType: 'sortNone',
        };
      }

      return column;
    });

    return acc;
  }, {});

  if (chartFamily === 'cartesian') {
    return {
      category: [],
      value: [],
      breakBy: [],
      ...intermediateOptions,
    } as CartesianChartDataOptions;
  } else if (chartFamily === 'categorical') {
    return {
      category: [],
      value: [],
      ...intermediateOptions,
    } as CategoricalChartDataOptions;
  } else if (chartFamily === 'scatter') {
    Object.keys(intermediateOptions).forEach((key) => {
      intermediateOptions[key] = intermediateOptions[key][0];
    });
  }

  return intermediateOptions;
};

const getAxisTitle = (chartRecommendations: ChartRecommendations, axis: 'x' | 'y') => {
  if (axis === 'x') {
    return (chartRecommendations.axesMapping.category ?? chartRecommendations.axesMapping.x)
      ?.map((item) => item.name)
      .join(', ');
  }

  return (chartRecommendations.axesMapping.value ?? chartRecommendations.axesMapping.y)
    ?.map((item) => item.name)
    .join(', ');
};

export const getChartOptions = (
  jaql: MetadataItem[],
  chartRecommendations: ChartRecommendations,
) => {
  const dataOptions = mapToDataOptions(jaql, chartRecommendations);

  const chartStyleOptions = merge(DEFAULT_STYLE_OPTIONS, {
    subtype: DEFAULT_SUBTYPE_FOR[chartRecommendations.chartType],
  }) as ChartStyleOptions;
  const expandedChartStyleOptions = merge(chartStyleOptions, {
    legend: {
      enabled: true,
      position: 'right',
    },
    yAxis: {
      title: {
        enabled: true,
        text: getAxisTitle(chartRecommendations, 'y'),
      },
    },
    xAxis: {
      title: {
        enabled: true,
        text: getAxisTitle(chartRecommendations, 'x'),
      },
    },
  }) as ChartStyleOptions;

  return {
    dataOptions,
    chartStyleOptions,
    expandedChartStyleOptions,
  };
};
