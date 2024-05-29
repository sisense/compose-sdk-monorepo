import { MetadataItem } from '@sisense/sdk-query-client';
import merge from 'ts-deepmerge';
import { ChartSubtype } from '../../chart-options-processor/subtype-to-design-options';
import {
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  ChartDataOptions,
  ChartType,
  ChartStyleOptions,
  ScatterChartDataOptions,
} from '../../types';
import { ScattermapChartDataOptions } from '../../chart-data-options/types';
import { ChartRecommendations, NlqResponseData } from '../api/types';
import { createJaqlElement } from './jaql-element';
import {
  isCartesian,
  isCategorical,
  isScatter,
  isScattermap,
  isIndicator,
  isAreamap,
  isBoxplot,
} from '@/chart-options-processor/translations/types';
import { getDefaultStyleOptions } from '@/chart-options-processor/chart-options-service';

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

/**
 * @internal
 */
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

    acc[`${key}`] = Array.isArray(value)
      ? value.map((v) => {
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
        })
      : value;

    return acc;
  }, {});

  switch (chartFamily) {
    case 'cartesian':
      return {
        category: [],
        value: [],
        breakBy: [],
        ...intermediateOptions,
      } as CartesianChartDataOptions;
    case 'categorical':
      return {
        category: [],
        value: [],
        ...intermediateOptions,
      } as CategoricalChartDataOptions;
    case 'scatter':
      Object.keys(intermediateOptions).forEach((key) => {
        intermediateOptions[`${key}`] = intermediateOptions[`${key}`][0];
      });
      return intermediateOptions as ScatterChartDataOptions;
    case 'scattermap':
      Object.keys(intermediateOptions).forEach((key) => {
        if (key !== 'geo') {
          intermediateOptions[`${key}`] = intermediateOptions[`${key}`][0];
        }
      });
      return intermediateOptions as ScattermapChartDataOptions;
    case 'boxplot':
    case 'areamap':
    case 'indicator':
    case 'table':
    default:
      return intermediateOptions;
  }
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

/**
 * Get chart options for the chart widget.
 *
 * @param jaql - metadata items
 * @param chartRecommendations - chart recommendations
 * @param useCustomizedStyleOptions - whether to use customized style. Charts as inline response messages use customized style. Charts for Query Composer use default style.
 * @internal
 */
export const getChartOptions = (
  jaql: MetadataItem[],
  chartRecommendations: ChartRecommendations,
  useCustomizedStyleOptions = true,
) => {
  const dataOptions = mapToDataOptions(jaql, chartRecommendations);

  let chartStyleOptions, expandedChartStyleOptions;

  if (useCustomizedStyleOptions) {
    chartStyleOptions = merge(DEFAULT_STYLE_OPTIONS, {
      subtype: DEFAULT_SUBTYPE_FOR[chartRecommendations.chartType],
    }) as ChartStyleOptions;
    expandedChartStyleOptions = merge(chartStyleOptions, {
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
  } else {
    chartStyleOptions = getDefaultStyleOptions();
    expandedChartStyleOptions = chartStyleOptions;
  }

  return {
    dataOptions,
    chartStyleOptions,
    expandedChartStyleOptions,
  };
};

/**
 * Derives chart family from chart type.
 *
 * @param chartType - chart type
 * @returns chart family
 * @internal
 */
export const deriveChartFamily = (chartType: string): string => {
  if (isCartesian(chartType as ChartType)) {
    return 'cartesian';
  }
  if (isCategorical(chartType as ChartType)) {
    return 'categorical';
  }
  if (isScatter(chartType as ChartType)) {
    return 'scatter';
  }
  if (isScattermap(chartType as ChartType)) {
    return 'scattermap';
  }
  if (isIndicator(chartType as ChartType)) {
    return 'indicator';
  }
  if (isAreamap(chartType as ChartType)) {
    return 'areamap';
  }
  if (isBoxplot(chartType as ChartType)) {
    return 'boxplot';
  }

  return 'table';
};
