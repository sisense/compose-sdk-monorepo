import { useCallback } from 'react';

import { formatDateValue } from '@/domains/query-execution/core/date-formats';
import { formatDatetimeString } from '@/domains/visualizations/components/pivot-table/formatters/header-cell-formatters/header-cell-value-formatter';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';

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
