/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect } from 'react';
import {
  type DataService,
  EVENT_DATA_CELL_FORMAT,
  EVENT_HEADER_CELL_FORMAT,
} from '@sisense/sdk-pivot-client';
import over from 'lodash/over';
import { type PivotTableDataOptions } from '@/chart-data-options/types';
import { applyDateFormat } from '@/query/date-formats';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { createDataCellValueFormatter, createHeaderCellValueFormatter } from './formatters';
import { createHeaderCellHighlightFormatter } from './formatters/header-cell-formatters/header-cell-highlight-formatter';

/**
 * A hook that applies formatting over pivot table cells.
 *
 * @internal
 */
export const useApplyPivotTableFormatting = ({
  dataService,
  dataOptions,
}: {
  dataService: DataService;
  dataOptions: PivotTableDataOptions;
}) => {
  const { app } = useSisenseContext();

  const onDataCellFormat = useCallback(over([createDataCellValueFormatter(dataOptions)]), [
    dataOptions,
  ]);

  const dateFormatter = useCallback(
    (date: Date, format: string) =>
      applyDateFormat(date, format, app?.settings.locale, app?.settings.dateConfig),
    [app],
  );

  const onHeaderCellFormat = useCallback(
    over([
      createHeaderCellValueFormatter(dataOptions, dateFormatter),
      createHeaderCellHighlightFormatter(),
    ]),
    [dataOptions],
  );

  useEffect(() => {
    dataService.on(EVENT_DATA_CELL_FORMAT, onDataCellFormat);
    dataService.on(EVENT_HEADER_CELL_FORMAT, onHeaderCellFormat);
    return () => {
      dataService.off(EVENT_DATA_CELL_FORMAT, onDataCellFormat);
      dataService.off(EVENT_HEADER_CELL_FORMAT, onHeaderCellFormat);
    };
  }, [dataService, onDataCellFormat]);
};
