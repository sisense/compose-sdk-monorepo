import { useMemo } from 'react';

import { Attribute, Data, DataSource, isDataSource, Measure } from '@sisense/sdk-data';

import { ChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types.js';
import { DataColumnNamesMapping } from '@/domains/visualizations/core/chart-data-options/validate-data-options/index.js';
import { createDataTableFromData } from '@/domains/visualizations/core/chart-data-processor/table-creators.js';
import { DataTable } from '@/domains/visualizations/core/chart-data-processor/table-processor.js';
import { chartDataService as legacyChartDataService } from '@/domains/visualizations/core/chart-data/chart-data-service.js';
import { filterAndAggregateChartData } from '@/domains/visualizations/core/chart-data/filter-and-aggregate-chart-data.js';
import { ChartData } from '@/domains/visualizations/core/chart-data/types.js';
import { TranslatableError } from '@/infra/translation/translatable-error';
import { ChartType } from '@/types';

import { isData } from '../components/regular-chart/regular-chart.js';
import { getChartBuilder } from '../restructured-charts/chart-builder-factory.js';
import { isRestructuredChartType } from '../restructured-charts/utils.js';

type UseChartDataPreparationProps = {
  dataSet: DataSource | Data | undefined;
  data: Data;
  chartDataOptions: ChartDataOptionsInternal;
  chartType: ChartType;
  /** Indicates if the chart is a forecast or trend chart for temporal routing between legacy and restructured charts processing */
  isForecastOrTrendChart: boolean;
  attributes: Attribute[];
  measures: Measure[];
  dataColumnNamesMapping: DataColumnNamesMapping;
  onDataReady?: (data: Data) => Data;
};

export function useChartDataPreparation({
  dataSet,
  data,
  chartDataOptions,
  chartType,
  isForecastOrTrendChart,
  attributes,
  measures,
  dataColumnNamesMapping,
  onDataReady,
}: UseChartDataPreparationProps): ChartData | null {
  return useMemo((): ChartData | null => {
    if (!data || !chartDataOptions) {
      return null;
    }
    let customizedData: Data | undefined;
    if (onDataReady) {
      customizedData = onDataReady(data);
      if (!isData(customizedData)) {
        throw new TranslatableError('errors.incorrectOnDataReadyHandler');
      }
    }
    const dataToProcess = customizedData || data;
    let dataTable = createDataTableFromData(dataToProcess);

    if (!isDataSource(dataSet)) {
      dataTable = filterAndAggregateChartData(
        dataTable,
        attributes,
        measures,
        dataColumnNamesMapping,
      );
    }

    return getChartData(chartType, chartDataOptions, dataTable, isForecastOrTrendChart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, chartType, isForecastOrTrendChart]);
}

function getChartData(
  chartType: ChartType,
  chartDataOptions: ChartDataOptionsInternal,
  dataTable: DataTable,
  isForecastOrTrendChart = false,
): ChartData {
  if (isRestructuredChartType(chartType) && !isForecastOrTrendChart) {
    const chartBuilder = getChartBuilder(chartType);
    if (chartBuilder.dataOptions.isCorrectDataOptionsInternal(chartDataOptions)) {
      return chartBuilder.data.getChartData(chartDataOptions, dataTable);
    }
    throw new Error('Incorrect internal data options for restructured chart');
  }
  return legacyChartDataService(chartType, chartDataOptions, dataTable);
}
