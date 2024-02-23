/* eslint-disable promise/catch-or-return */
/* eslint-disable max-lines-per-function */
import {
  Attribute,
  Data,
  DataSource,
  Filter,
  FilterRelations,
  isDataSource,
  Measure,
} from '@sisense/sdk-data';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  BoxplotChartDataOptionsInternal,
  ChartDataOptionsInternal,
} from '../../chart-data-options/types';
import { executeQuery } from '../../query/execute-query';
import { applyDateFormats } from '../../query/query-result-date-formatting';
import { ChartType } from '../../types';
import { useSisenseContext } from '../../sisense-context/sisense-context';
import {
  DataColumnNamesMapping,
  validateDataOptionsAgainstData,
} from '../../chart-data-options/validate-data-options';
import { useSetError } from '../../error-boundary/use-set-error';
import '../chart.css';
import { executeBoxplotQuery } from '../../boxplot-utils';
import { getFilterListAndRelations } from '@sisense/sdk-data';

type DataSet = DataSource | Data | undefined;

export const useSyncedData = (
  dataSet: DataSet,
  chartDataOptions: ChartDataOptionsInternal,
  chartType: ChartType,
  attributes: Attribute[],
  measures: Measure[],
  dataColumnNamesMapping: DataColumnNamesMapping,
  filters?: Filter[] | FilterRelations,
  highlights?: Filter[],
  refreshCounter?: number,
  setIsLoading?: Dispatch<SetStateAction<boolean>>,
) => {
  const setError = useSetError();

  const [data, setData] = useState<Data>();
  const { app } = useSisenseContext();

  useEffect(() => {
    let ignore = false;

    const { filters: filterList, relations: filterRelations } = getFilterListAndRelations(filters);
    if (dataSet === undefined || isDataSource(dataSet)) {
      let executeQueryPromise;

      if (chartType === 'boxplot') {
        executeQueryPromise = executeBoxplotQuery({
          app: app!,
          chartDataOptions: chartDataOptions as BoxplotChartDataOptionsInternal,
          dataSource: dataSet,
          attributes,
          measures,
          filters: filterList,
          highlights,
        });
      } else {
        executeQueryPromise = executeQuery(
          {
            dataSource: dataSet,
            dimensions: attributes,
            measures,
            filters: filterList,
            filterRelations,
            highlights,
          },
          app!,
        );
      }

      const loadingIndicatorConfig = app?.settings.loadingIndicatorConfig;

      const isLoadingTimeout = setTimeout(() => {
        if (loadingIndicatorConfig?.enabled) {
          setIsLoading?.(true);
        }
      }, loadingIndicatorConfig?.delay);
      executeQueryPromise
        .then((queryResultData) => {
          const dataWithDateFormatting = applyDateFormats(
            queryResultData,
            chartDataOptions,
            app?.settings.locale,
            app?.settings.dateConfig,
          );

          if (!ignore) {
            setData(dataWithDateFormatting);
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

      setData(dataWithDateFormatting);
    }

    // Set up cleanup function to ignore async fetch results of previous render
    // when the Effect is firing twice in Strict Mode
    // Reference: https://react.dev/learn/synchronizing-with-effects#fetching-data
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartType, chartDataOptions, dataSet, filters, highlights, app, refreshCounter]);

  return data;
};
