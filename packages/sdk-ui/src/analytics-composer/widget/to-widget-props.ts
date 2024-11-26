import { createFilterFromJaql, Filter, FilterJaql, MetadataItem } from '@sisense/sdk-data';
import { ChartType, WidgetStyleOptions, WidgetProps } from '../../index.js';
import { ChartRecommendations, ExpandedQueryModel, WidgetPropsConfig } from '../types.js';
import { isEmptyQueryModel } from '../common/utils.js';
import cloneDeep from 'lodash-es/cloneDeep.js';
import { getChartOptions } from './chart-options/get-widget-options.js';

/**
 * Gets chart recommendations or default to table.
 *
 * @param chart - chart recommendations
 * @returns chart recommendations or default to table
 */
const getChartRecommendationsOrDefault = (
  chart: {} | ChartRecommendations,
): ChartRecommendations => {
  if ('chartType' in chart) {
    return chart;
  }

  return {
    chartType: 'table',
    chartFamily: 'table',
    axesMapping: {},
  };
};

/**
 * Gets filters from metadata.
 *
 * @param metadata - metadata items
 * @return array of Filter objects
 */
const getFilters = (metadata: MetadataItem[]): Filter[] => {
  return metadata.map((item) => createFilterFromJaql(item.jaql as FilterJaql));
};

/**
 * Splits metadata into columns and filters.
 *
 * @param metadata - metadata items
 */
const splitMetadata = (
  metadata: MetadataItem[],
): { metadataColumns: MetadataItem[]; metadataFilters: MetadataItem[] } => {
  return metadata.reduce(
    (acc, item) => {
      // filter items may come from panel scope or from columns with inline filter conditions
      if (item.panel === 'scope' || item.jaql.filter) {
        acc.metadataFilters.push(cloneDeep(item));
      }

      if (item.panel !== 'scope') {
        const columnItem = cloneDeep(item);
        delete columnItem.jaql.filter;
        acc.metadataColumns.push(columnItem);
      }

      return acc;
    },
    { metadataColumns: [] as MetadataItem[], metadataFilters: [] as MetadataItem[] },
  );
};

export const toWidgetPropsFromQuery = (
  queryModel: ExpandedQueryModel,
  config?: WidgetPropsConfig,
): WidgetProps | undefined => {
  if (isEmptyQueryModel(queryModel)) {
    return;
  }

  try {
    const { useCustomizedStyleOptions = false } = config || {};
    const { jaql, chartRecommendations: chartRecommendationsOriginal, queryTitle } = queryModel;
    const {
      metadata,
      datasource: { title: dataSourceTitle, id: dataSourceId, type: dataSourceType = 'elasticube' },
    } = jaql;

    const chartRecommendations = getChartRecommendationsOrDefault(chartRecommendationsOriginal);
    const chartType = chartRecommendations.chartType.toLowerCase() as ChartType;

    const widgetStyleOptions: WidgetStyleOptions = {
      cornerRadius: 'Small',
      header: {
        // remove info button and render empty toolbar instead
        renderToolbar: () => null,
      },
    };

    const { metadataColumns, metadataFilters } = splitMetadata(metadata);
    const filters = getFilters(metadataFilters);
    // get chart options. Use default style for charts in Query Composer
    const { dataOptions, chartStyleOptions } = getChartOptions(
      metadataColumns,
      chartRecommendations,
      useCustomizedStyleOptions,
    );

    const styleOptions = { ...chartStyleOptions, ...widgetStyleOptions };

    return {
      widgetType: 'chart',
      id: queryTitle,
      title: queryTitle,
      chartType,
      dataSource: {
        title: dataSourceTitle,
        id: dataSourceId,
        type: dataSourceType,
      },
      dataOptions,
      filters,
      styleOptions,
    };
  } catch (error) {
    console.error(error);
    // swallow error
    return;
  }
};
