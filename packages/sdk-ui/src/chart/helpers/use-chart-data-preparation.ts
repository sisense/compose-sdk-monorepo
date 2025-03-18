import { Attribute, Data, DataSource, isDataSource, Measure } from '@sisense/sdk-data';
import { useMemo } from 'react';
import { ChartDataOptionsInternal } from '@/chart-data-options/types';
import { DataColumnNamesMapping } from '@/chart-data-options/validate-data-options';
import { createDataTableFromData } from '@/chart-data-processor/table-creators';
import { chartDataService as legacyChartDataService } from '@/chart-data/chart-data-service';
import { filterAndAggregateChartData } from '@/chart-data/filter-and-aggregate-chart-data';
import { ChartData } from '@/chart-data/types';
import { ChartType } from '@/types';
import { isData } from '../regular-chart';
import { TranslatableError } from '@/translation/translatable-error';
import { DataTable } from '@/chart-data-processor/table-processor';
import { isRestructuredChartType } from '../restructured-charts/utils';
import { getChartBuilder } from '../restructured-charts/chart-builder-factory';

type UseChartDataPreparationProps = {
  dataSet: DataSource | Data | undefined;
  data: Data;
  chartDataOptions: ChartDataOptionsInternal;
  chartType: ChartType;
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

    return getChartData(chartType, chartDataOptions, dataTable);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, chartType]);
}

function getChartData(
  chartType: ChartType,
  chartDataOptions: ChartDataOptionsInternal,
  dataTable: DataTable,
): ChartData {
  if (isRestructuredChartType(chartType)) {
    const chartBuilder = getChartBuilder(chartType);
    if (chartBuilder.dataOptions.isCorrectDataOptionsInternal(chartDataOptions)) {
      return chartBuilder.data.getChartData(chartDataOptions, dataTable);
    }
    throw new Error('Incorrect internal data options for restructured chart');
  }
  return legacyChartDataService(chartType, chartDataOptions, dataTable);
}
