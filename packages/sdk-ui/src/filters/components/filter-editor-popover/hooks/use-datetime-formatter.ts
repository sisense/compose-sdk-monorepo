import { useCallback } from 'react';
import isDate from 'lodash-es/isDate';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { formatDatetimeString } from '@/pivot-table/formatters/header-cell-formatters/header-cell-value-formatter';
import { applyDateFormat } from '@/query/date-formats';

export type DatetimeFormatter = (value: Date | string, format: string) => string;

export const useDatetimeFormatter = (): DatetimeFormatter => {
  const { app } = useSisenseContext();

  return useCallback(
    (value: Date | string, format: string) => {
      const dateFormatter = (date: Date, format: string) =>
        applyDateFormat(date, format, app?.settings.locale, app?.settings.dateConfig);

      return formatDatetimeString(
        isDate(value) ? value.toISOString() : value,
        dateFormatter,
        format,
      );
    },
    [app],
  );
};
