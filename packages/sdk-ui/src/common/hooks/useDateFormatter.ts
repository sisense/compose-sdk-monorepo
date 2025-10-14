import { useCallback } from 'react';

import { useSisenseContext } from '@/sisense-context/sisense-context';

import { createDateFormatter, DateFormatter } from '../formatters/create-date-formatter';

/**
 * A hook that returns a date formatter function
 *
 * @returns A function that formats dates
 */
export function useDateFormatter() {
  const { app } = useSisenseContext();

  return useCallback<DateFormatter>(
    (date: Date, format: string) =>
      createDateFormatter(app?.settings.locale, app?.settings.dateConfig)(date, format),
    [app?.settings.locale, app?.settings.dateConfig],
  );
}
