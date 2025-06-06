import {
  Attribute,
  Data,
  DataSource,
  Filter,
  FilterRelations,
  isDataSource,
  Measure,
} from '@sisense/sdk-data';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { ChartDataOptionsInternal } from '../../chart-data-options/types';
import { applyDateFormats } from '../../query/query-result-date-formatting';
import { ChartType } from '../../types';
import { useSisenseContext } from '../../sisense-context/sisense-context';
import {
  DataColumnNamesMapping,
  validateDataOptionsAgainstData,
} from '../../chart-data-options/validate-data-options';
import { useSetError } from '../../error-boundary/use-set-error';
import '../chart.css';
import { getFilterListAndRelationsJaql } from '@sisense/sdk-data';
import { deriveChartFamily } from './derive-chart-family';
import { LoadDataFunction } from './get-load-data-function';

type DataSet = DataSource | Data | undefined;

const chartDataOptionsFamily = (chartType: ChartType): string => {
  // funnel sorting makes it a special case of categorical
  if (chartType === 'funnel') return chartType;
  return deriveChartFamily(chartType);
};

type UseSyncedDataProps = {
  dataSet: DataSet;
  chartDataOptions: ChartDataOptionsInternal;
  chartType: ChartType;
  attributes: Attribute[];
  measures: Measure[];
  dataColumnNamesMapping: DataColumnNamesMapping;
  filters?: Filter[] | FilterRelations;
  highlights?: Filter[];
  refreshCounter?: number;
  setIsLoading?: Dispatch<SetStateAction<boolean>>;
  enabled?: boolean;
  loadData: LoadDataFunction;
};
export const useSyncedData = ({
  dataSet,
  chartDataOptions,
  chartType,
  attributes,
  measures,
  dataColumnNamesMapping,
  filters,
  highlights,
  refreshCounter,
  setIsLoading,
  enabled = true,
  loadData,
}: UseSyncedDataProps) => {
  const setError = useSetError();

  const chartFamily = useMemo(() => chartDataOptionsFamily(chartType), [chartType]);
  const undefinedSynchedData = useMemo(() => [undefined, chartDataOptions], [chartDataOptions]);
  const [synchedData, setSynchedData] = useState<{
    [key: string]: [Data, ChartDataOptionsInternal];
  }>({});
  const { app } = useSisenseContext();

  useEffect(() => {
    if (!enabled) {
      return;
    }
    let ignore = false;

    const { filters: filterList, relations: filterRelations } =
      getFilterListAndRelationsJaql(filters);
    if (isDataSource(dataSet)) {
      if (!app) {
        return;
      }

      const executeQueryPromise = loadData({
        app,
        chartDataOptionsInternal: chartDataOptions,
        queryDescription: {
          dataSource: dataSet,
          dimensions: attributes,
          measures,
          filters: filterList,
          filterRelations,
          highlights,
          count: app.settings.queryLimit,
        },
      });

      const loadingIndicatorConfig = app?.settings.loadingIndicatorConfig;

      const isLoadingTimeout = setTimeout(() => {
        if (loadingIndicatorConfig?.enabled) {
          setIsLoading?.(true);
        }
      }, loadingIndicatorConfig?.delay);
      // eslint-disable-next-line promise/catch-or-return
      executeQueryPromise
        .then((queryResultData) => {
          const dataWithDateFormatting = applyDateFormats(
            queryResultData,
            chartDataOptions,
            app?.settings.locale,
            app?.settings.dateConfig,
          );

          if (!ignore) {
            setSynchedData({ [chartFamily]: [dataWithDateFormatting, chartDataOptions] });
          }
        })
        .catch((asyncError: Error) => {
          // set error state to trigger rerender and throw synchronous error
          setError(asyncError);
        })
        .finally(() => {
          clearTimeout(isLoadingTimeout);
          if (loadingIndicatorConfig?.enabled) {
            setIsLoading?.(false);
          }
        });
    } else {
      // Issues related to queried data such as data access permission, non-existent data source,
      // mismatched or ill-formed attributes/measures should already be caught by JAQL API.
      // The following validates data options against user-provided data.
      validateDataOptionsAgainstData(
        dataSet,
        attributes,
        measures,
        dataColumnNamesMapping,
        filterList,
        highlights,
      );

      const dataWithDateFormatting = applyDateFormats(
        dataSet,
        chartDataOptions,
        app?.settings.locale,
        app?.settings.dateConfig,
      );

      setSynchedData({ [chartFamily]: [dataWithDateFormatting, chartDataOptions] });
    }

    // Set up cleanup function to ignore async fetch results of previous render
    // when the Effect is firing twice in Strict Mode
    // Reference: https://react.dev/learn/synchronizing-with-effects#fetching-data
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartType, chartDataOptions, dataSet, filters, highlights, app, refreshCounter, enabled]);

  return synchedData[chartFamily] || undefinedSynchedData;
};
