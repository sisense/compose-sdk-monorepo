import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type DataService,
  EVENT_DATA_CELL_FORMAT,
  EVENT_HEADER_CELL_FORMAT,
} from '@sisense/sdk-pivot-query-client';
import over from 'lodash-es/over';

import { formatDateValue } from '@/domains/query-execution/core/date-formats';
import { type PivotTableDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { useThemeContext } from '@/infra/contexts/theme-provider';

import { createDataCellValueFormatter, createHeaderCellValueFormatter } from '../formatters';
import { createDataCellColorFormatter } from '../formatters/data-cell-formatters/data-cell-color-formatter';
import {
  createUnifiedDataCellFormatter,
  createUnifiedHeaderCellFormatter,
} from '../formatters/formatter-utils';
import { createHeaderCellHighlightFormatter } from '../formatters/header-cell-formatters/header-cell-highlight-formatter';
import { createHeaderCellTotalsFormatter } from '../formatters/header-cell-formatters/header-cell-totals-formatter';
import { type CustomDataCellFormatter, type CustomHeaderCellFormatter } from '../formatters/types';

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
  const defaultNumberFormattingEnabled =
    app?.settings?.chartConfig?.defaultNumberFormatting?.enabled ?? true;

  const onDataCellFormatCombined = useMemo(
    () =>
      over([
        createDataCellValueFormatter(dataOptions, defaultNumberFormattingEnabled),
        createDataCellColorFormatter(dataOptions, themeSettings),
        ...(onDataCellFormat
          ? [createUnifiedDataCellFormatter(onDataCellFormat, dataOptions)]
          : []),
      ]),
    [dataOptions, onDataCellFormat, themeSettings, defaultNumberFormattingEnabled],
  );

  const dateFormatter = useCallback(
    (date: Date, format: string) =>
      formatDateValue(date, format, app?.settings.locale, app?.settings.dateConfig),
    [app],
  );

  const onHeaderCellFormatCombined = useMemo(
    () =>
      over([
        createHeaderCellValueFormatter(dataOptions, dateFormatter, defaultNumberFormattingEnabled),
        createHeaderCellTotalsFormatter(dataOptions, translate),
        createHeaderCellHighlightFormatter(),
        ...(onHeaderCellFormat
          ? [createUnifiedHeaderCellFormatter(onHeaderCellFormat, dataOptions)]
          : []),
      ]),
    [dataOptions, translate, onHeaderCellFormat, dateFormatter, defaultNumberFormattingEnabled],
  );

  useEffect(() => {
    dataService.on(EVENT_DATA_CELL_FORMAT, onDataCellFormatCombined);
    dataService.on(EVENT_HEADER_CELL_FORMAT, onHeaderCellFormatCombined);

    return () => {
      dataService.off(EVENT_DATA_CELL_FORMAT, onDataCellFormatCombined);
      dataService.off(EVENT_HEADER_CELL_FORMAT, onHeaderCellFormatCombined);
    };
  }, [dataService, onDataCellFormatCombined, onHeaderCellFormatCombined]);
};
