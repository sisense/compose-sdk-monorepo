/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect } from 'react';
import {
  type DataService,
  EVENT_DATA_CELL_FORMAT,
  EVENT_HEADER_CELL_FORMAT,
} from '@sisense/sdk-pivot-client';
import over from 'lodash-es/over';
import { type PivotTableDataOptions } from '@/chart-data-options/types';
import { applyDateFormat } from '@/query/date-formats';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { createDataCellValueFormatter, createHeaderCellValueFormatter } from '../formatters';
import { createHeaderCellHighlightFormatter } from '../formatters/header-cell-formatters/header-cell-highlight-formatter';
import { createHeaderCellTotalsFormatter } from '@/pivot-table/formatters/header-cell-formatters/header-cell-totals-formatter';
import { useTranslation } from 'react-i18next';
import { createDataCellColorFormatter } from '@/pivot-table/formatters/data-cell-formatters/data-cell-color-formatter';
import { useThemeContext } from '@/theme-provider';

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
  const { t: translate } = useTranslation();
  const { themeSettings } = useThemeContext();

  const onDataCellFormat = useCallback(
    over([
      createDataCellValueFormatter(dataOptions),
      createDataCellColorFormatter(dataOptions, themeSettings),
    ]),
    [dataOptions],
  );

  const dateFormatter = useCallback(
    (date: Date, format: string) =>
      applyDateFormat(date, format, app?.settings.locale, app?.settings.dateConfig),
    [app],
  );

  const onHeaderCellFormat = useCallback(
    over([
      createHeaderCellValueFormatter(dataOptions, dateFormatter),
      createHeaderCellTotalsFormatter(dataOptions, translate),
      createHeaderCellHighlightFormatter(),
    ]),
    [dataOptions, translate],
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
