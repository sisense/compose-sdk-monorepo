import {
  createDimensionalElementFromMetadataItem,
  DatetimeMask,
  isDatetime,
  MetadataItem,
} from '@sisense/sdk-data';
import merge from 'ts-deepmerge';

import { ScattermapChartDataOptions } from '@/domains/visualizations/core/chart-data-options/types';
import { normalizeAnyColumn } from '@/domains/visualizations/core/chart-data-options/utils';
import { getDefaultStyleOptions } from '@/domains/visualizations/core/chart-options-processor/chart-options-service';
import { ChartSubtype } from '@/domains/visualizations/core/chart-options-processor/subtype-to-design-options';
import {
  AxesMapping,
  ChartRecommendations,
  ExpandedQueryModel,
} from '@/modules/analytics-composer/types';
import {
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  ChartDataOptions,
  ChartStyleOptions,
  ChartType,
  IndicatorStyleOptions,
  ScatterChartDataOptions,
} from '@/types';

/**
 * @internal
 */
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

const getTableDataOptions = (jaql: MetadataItem[]) => {
  const columns = jaql.map(createDimensionalElementFromMetadataItem);

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

/**
 * Maps the metadata items to the chart data options.
 *
 * @param metadataItems - metadata items
 * @param chartFamily - chart family
 * @param axesMapping - axes mapping
 * @returns chart data options
 * @internal
 */
export const getChartDataOptions = (
  metadataItems: MetadataItem[],
  chartFamily: string,
  axesMapping: AxesMapping,
): ChartDataOptions => {
  const metadataItemByTitle = metadataItems.reduce((acc, item) => {
    acc[item.jaql.title!] = item;
    return acc;
  }, {} as Record<string, MetadataItem>);

  const intermediateOptions = Object.entries(axesMapping).reduce((acc, item) => {
    const [key, value] = item;

    acc[`${key}`] = Array.isArray(value)
      ? value.map((v) => {
          const nColumn = normalizeAnyColumn(v);
          // enabled is an internal property that should not be excluded in the generated widget code
          delete nColumn.enabled;
          const m = metadataItemByTitle[nColumn.column.name];
          // this will generate an error in the chart instead of failing
          // error will contain the name of the problematic item
          // TODO: remove when proper validation is introduced
          if (!m) return { column: { type: '', name: nColumn.column.name } };
          const column = createDimensionalElementFromMetadataItem(m);

          if (m.panel === 'measures') {
            return {
              ...nColumn,
              column,
            };
          }

          if (isDatetime(column.type)) {
            const dateFormat: string | undefined = (m.format?.mask as DatetimeMask)?.[
              m.jaql.level!
            ];
            if (dateFormat) {
              return {
                ...nColumn,
                column,
                dateFormat,
              };
            }
          }

          return { ...nColumn, column };
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
        return getTableDataOptions(metadataItems).dataOptions;
      }
      return intermediateOptions;
    case 'boxplot':
    case 'areamap':
    case 'indicator':
    default:
      return intermediateOptions;
  }
};

const getAxisTitle = (axesMapping: AxesMapping, axis: 'x' | 'y') => {
  if (axis === 'x') {
    return (axesMapping.category ?? axesMapping.x)
      ?.map((item) => normalizeAnyColumn(item).column.name)
      .join(', ');
  }

  return (axesMapping.value ?? axesMapping.y)
    ?.map((item) => normalizeAnyColumn(item).column.name)
    .join(', ');
};

const getIndicatorValueTitle = (axesMapping: AxesMapping, valueType: 'value' | 'secondary') => {
  return axesMapping[valueType]?.map((item) => normalizeAnyColumn(item).column.name).join(', ');
};

/**
 * Get chart style options for the chart widget.
 *
 * @param chartType - chart type
 * @param axesMapping - axes mapping
 * @param initialStyleOptions - initial style options
 * @param useCustomizedStyleOptions - whether to use customized style. Charts as inline response messages use customized style. Charts for Query Composer use default style.
 * @returns chart style options
 * @internal
 */
export const getChartStyleOptions = (
  chartType: ChartType,
  axesMapping: AxesMapping,
  initialStyleOptions: ChartStyleOptions,
  useCustomizedStyleOptions: boolean,
) => {
  let chartStyleOptions;

  if (useCustomizedStyleOptions && chartType in DEFAULT_SUBTYPE_FOR) {
    chartStyleOptions = merge(
      merge(DEFAULT_STYLE_OPTIONS, {
        subtype: DEFAULT_SUBTYPE_FOR[`${chartType}`],
      }),
      {
        legend: {
          enabled: true,
          position: 'right',
        },
        yAxis: {
          title: {
            enabled: true,
            text: getAxisTitle(axesMapping, 'y'),
          },
        },
        xAxis: {
          title: {
            enabled: true,
            text: getAxisTitle(axesMapping, 'x'),
          },
        },
      },
      initialStyleOptions,
    ) as ChartStyleOptions;
  } else if (useCustomizedStyleOptions && chartType === 'indicator') {
    const indicatorOptions: Partial<IndicatorStyleOptions> = {
      indicatorComponents: {
        title: {
          shouldBeShown: true,
          text: getIndicatorValueTitle(axesMapping, 'value'),
        },
      },
    };

    const secondaryTitle = getIndicatorValueTitle(axesMapping, 'secondary');
    if (secondaryTitle && indicatorOptions?.indicatorComponents) {
      indicatorOptions.indicatorComponents.secondaryTitle = {
        text: secondaryTitle,
      };
    }

    chartStyleOptions = merge(
      getDefaultStyleOptions(),
      indicatorOptions,
      initialStyleOptions,
    ) as ChartStyleOptions;
  } else {
    chartStyleOptions = merge(getDefaultStyleOptions(), initialStyleOptions);
  }

  return chartStyleOptions;
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
  const {
    chartFamily,
    chartType,
    axesMapping = {},
    styleOptions: initialStyleOptions = {},
  } = chartRecommendations;
  const dataOptions = getChartDataOptions(jaql, chartFamily, axesMapping);

  const chartStyleOptions = getChartStyleOptions(
    chartType as ChartType,
    axesMapping,
    initialStyleOptions,
    useCustomizedStyleOptions,
  );

  return {
    dataOptions,
    chartStyleOptions,
  };
};
