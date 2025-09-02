/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect } from 'react';
import {
  type DataService,
  EVENT_DATA_CELL_FORMAT,
  EVENT_HEADER_CELL_FORMAT,
} from '@sisense/sdk-pivot-client';
import over from 'lodash-es/over';
import { type PivotTableDataOptionsInternal } from '@/chart-data-options/types';
import { formatDateValue } from '@/query/date-formats';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { createDataCellValueFormatter, createHeaderCellValueFormatter } from '../formatters';
import { createHeaderCellHighlightFormatter } from '../formatters/header-cell-formatters/header-cell-highlight-formatter';
import { createHeaderCellTotalsFormatter } from '@/pivot-table/formatters/header-cell-formatters/header-cell-totals-formatter';
import { useTranslation } from 'react-i18next';
import { createDataCellColorFormatter } from '@/pivot-table/formatters/data-cell-formatters/data-cell-color-formatter';
import {
  type CustomDataCellFormatter,
  type CustomHeaderCellFormatter,
} from '@/pivot-table/formatters/types';
import {
  createUnifiedDataCellFormatter,
  createUnifiedHeaderCellFormatter,
} from '@/pivot-table/formatters/formatter-utils';
import { useThemeContext } from '@/theme-provider';

/**
 * A hook that applies formatting over pivot table cells.
 *
 * @internal
 */
export const useApplyPivotTableFormatting = ({
  dataService,
  dataOptions,
  onDataCellFormat,
  onHeaderCellFormat,
}: {
  dataService: DataService;
  dataOptions: PivotTableDataOptionsInternal;
  onDataCellFormat?: CustomDataCellFormatter;
  onHeaderCellFormat?: CustomHeaderCellFormatter;
}) => {
  const { app } = useSisenseContext();
  const { t: translate } = useTranslation();
  const { themeSettings } = useThemeContext();

  const onDataCellFormatCombined = useCallback(
    over([
      createDataCellValueFormatter(dataOptions),
      createDataCellColorFormatter(dataOptions, themeSettings),
      // Apply functional formatter using unified wrapper (single callback instead of array)
      ...(onDataCellFormat ? [createUnifiedDataCellFormatter(onDataCellFormat, dataOptions)] : []),
    ]),
    [dataOptions, onDataCellFormat, themeSettings],
  );

  const dateFormatter = useCallback(
    (date: Date, format: string) =>
      formatDateValue(date, format, app?.settings.locale, app?.settings.dateConfig),
    [app],
  );

  const onHeaderCellFormatCombined = useCallback(
    over([
      createHeaderCellValueFormatter(dataOptions, dateFormatter),
      createHeaderCellTotalsFormatter(dataOptions, translate),
      createHeaderCellHighlightFormatter(),
      // Apply additional header formatter using unified wrapper (single callback instead of array)
      ...(onHeaderCellFormat
        ? [createUnifiedHeaderCellFormatter(onHeaderCellFormat, dataOptions)]
        : []),
    ]),
    [dataOptions, translate, onHeaderCellFormat, dateFormatter],
  );

  useEffect(() => {
    dataService.on(EVENT_DATA_CELL_FORMAT, onDataCellFormatCombined);
    dataService.on(EVENT_HEADER_CELL_FORMAT, onHeaderCellFormatCombined);
    return () => {
      dataService.off(EVENT_DATA_CELL_FORMAT, onDataCellFormatCombined);
      dataService.off(EVENT_HEADER_CELL_FORMAT, onHeaderCellFormatCombined);
    };
  }, [dataService, onDataCellFormat, onHeaderCellFormat]);
};
