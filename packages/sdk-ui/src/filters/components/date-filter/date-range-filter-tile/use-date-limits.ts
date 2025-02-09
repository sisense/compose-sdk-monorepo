import {
  DataSource,
  Filter,
  LevelAttribute,
  convertDataSource,
  measureFactory,
} from '@sisense/sdk-data';
import { useSisenseContext } from '../../../../sisense-context/sisense-context';
import { useEffect, useState } from 'react';
import { executeQuery } from '../../../../query/execute-query';
import { useSetError } from '../../../../error-boundary/use-set-error';

export type DateLimits = {
  minDate?: string;
  maxDate?: string;
};

export const useDateLimits = (
  userLimits: DateLimits,
  attribute: LevelAttribute,
  dataSource?: DataSource,
  parentFilters?: Filter[],
): Required<DateLimits> | null => {
  const [fetchedLimits, setFetchedLimits] = useState<Required<DateLimits> | null>(null);
  const { isInitialized: isAppInitialized, app } = useSisenseContext();
  const setError = useSetError();
  const shouldFetchLimits = !isLimitsDefinedByUser(userLimits) && isAppInitialized && app;
  useEffect(() => {
    if (!shouldFetchLimits) {
      return;
    }

    // prioritize attribute dataSource for the use case of multi-source dashboard
    const dataSourceInternal = attribute.dataSource
      ? convertDataSource(attribute.dataSource)
      : dataSource;

    void executeQuery(
      {
        dataSource: dataSourceInternal,
        measures: [measureFactory.min(attribute), measureFactory.max(attribute)],
        filters: parentFilters,
      },
      app,
    )
      .then((data) => {
        const queryMembers = data.rows[0];
        setFetchedLimits({
          minDate: queryMembers[0].data as string,
          maxDate: queryMembers[1].data as string,
        });
      })
      .catch((error) => setError(error));
  }, [app, attribute, dataSource, shouldFetchLimits, parentFilters, setError]);
  return mergeDateLimits(userLimits, fetchedLimits);
};

function isLimitsDefinedByUser(userLimits: DateLimits): userLimits is Required<DateLimits> {
  return userLimits.minDate !== undefined && userLimits.maxDate !== undefined;
}

function mergeDateLimits(
  userLimits: DateLimits,
  serverLimits: Required<DateLimits> | null,
): Required<DateLimits> | null {
  const minDate = userLimits.minDate ?? serverLimits?.minDate;
  const maxDate = userLimits.maxDate ?? serverLimits?.maxDate;
  return minDate && maxDate ? { minDate, maxDate } : null;
}
