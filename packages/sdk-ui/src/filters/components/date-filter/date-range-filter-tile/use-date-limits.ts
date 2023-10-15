import { DataSource, LevelAttribute, measures } from '@sisense/sdk-data';
import { useSisenseContext } from '../../../../sisense-context/sisense-context';
import { useEffect, useState } from 'react';
import { executeQuery } from '../../../../query/execute-query';

type DateLimits = {
  minDate?: string;
  maxDate?: string;
};

export const useDateLimits = (
  userLimits: DateLimits,
  attribute: LevelAttribute,
  dataSource?: DataSource,
): Required<DateLimits> | null => {
  const [fetchedLimits, setFetchedLimits] = useState<Required<DateLimits> | null>(null);
  const { isInitialized: isAppInitialized, app } = useSisenseContext();
  const shouldFetchLimits = !isLimitsDefinedByUser(userLimits) && isAppInitialized && app;
  useEffect(() => {
    if (!shouldFetchLimits) {
      return;
    }

    void executeQuery(
      dataSource,
      [],
      [measures.min(attribute), measures.max(attribute)],
      [],
      [],
      app,
    ).then((data) => {
      const queryMembers = data.rows[0];
      setFetchedLimits({
        minDate: queryMembers[0].data as string,
        maxDate: queryMembers[1].data as string,
      });
    });
  }, [app, attribute, dataSource, shouldFetchLimits]);
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
