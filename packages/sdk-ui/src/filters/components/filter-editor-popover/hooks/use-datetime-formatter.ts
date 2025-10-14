import { useCallback } from 'react';

import { formatDatetimeString } from '@/pivot-table/formatters/header-cell-formatters/header-cell-value-formatter';
import { formatDateValue } from '@/query/date-formats';
import { useSisenseContext } from '@/sisense-context/sisense-context';

export type DatetimeFormatter = (value: Date | string, format: string) => string;

export const useDatetimeFormatter = (): DatetimeFormatter => {
  const { app } = useSisenseContext();

  return useCallback(
    (value: Date | string, format: string) => {
      const dateFormatter = (date: Date, format: string) =>
        formatDateValue(date, format, app?.settings.locale, app?.settings.dateConfig);

      return formatDatetimeString(value, dateFormatter, format);
    },
    [app],
  );
};
