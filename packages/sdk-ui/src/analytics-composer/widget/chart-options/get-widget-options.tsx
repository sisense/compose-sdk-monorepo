import merge from 'ts-deepmerge';
import { ChartSubtype } from '../../../chart-options-processor/subtype-to-design-options';
import {
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  ChartDataOptions,
  ChartType,
  ChartStyleOptions,
  ScatterChartDataOptions,
} from '../../../types';
import { ScattermapChartDataOptions } from '../../../chart-data-options/types';
import { getDefaultStyleOptions } from '@/chart-options-processor/chart-options-service';
import { DatetimeMask, MetadataItem, createJaqlElement, isDatetime } from '@sisense/sdk-data';
import { ChartRecommendations, ExpandedQueryModel } from '@/analytics-composer/types';

export const getChartRecommendationsOrDefault = (
  response: ExpandedQueryModel,
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
  const { axesMapping = {}, chartFamily } = chartRecommendations;
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

          if (isDatetime(column.type)) {
            const dateFormat: string | undefined = (m.format?.mask as DatetimeMask)?.[
              m.jaql.level!
            ];
            if (dateFormat) {
              return {
                column,
                dateFormat,
              };
            }
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
    case 'table':
      if (Object.keys(intermediateOptions).length === 0) {
        return getTableOptions(metadataItems).dataOptions;
      }
      return intermediateOptions;
    case 'boxplot':
    case 'areamap':
    case 'indicator':
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

  let chartStyleOptions;

  if (useCustomizedStyleOptions && chartRecommendations.chartType in DEFAULT_SUBTYPE_FOR) {
    chartStyleOptions = merge(
      merge(DEFAULT_STYLE_OPTIONS, {
        subtype: DEFAULT_SUBTYPE_FOR[chartRecommendations.chartType],
      }),
      {
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
      },
    ) as ChartStyleOptions;
  } else {
    chartStyleOptions = getDefaultStyleOptions();
  }

  return {
    dataOptions,
    chartStyleOptions,
  };
};
