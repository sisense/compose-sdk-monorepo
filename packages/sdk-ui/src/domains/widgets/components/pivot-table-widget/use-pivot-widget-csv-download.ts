import { useMemo } from 'react';

import { translatePivotTableDataOptions } from '@/domains/visualizations/core/chart-data-options/translate-data-options.js';
import {
  translateColumnToAttribute,
  translateColumnToMeasure,
} from '@/domains/visualizations/core/chart-data-options/utils.js';
import { useCsvQueryFileLoader } from '@/domains/widgets/hooks/use-csv-query-file-loader.js';
import { useWithCsvDownloadMenuItem } from '@/domains/widgets/hooks/use-with-csv-download-menu-item.js';
import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';

import type { PivotTableWidgetProps } from './types.js';

export type UsePivotWidgetCsvDownloadParams = Pick<
  PivotTableWidgetProps,
  'title' | 'dataOptions' | 'filters' | 'highlights' | 'config' | 'dataSource'
> & {
  /** Header config from {@link useWidgetHeaderManagement} (rename menu, etc.). */
  baseHeaderConfig: WidgetHeaderConfig;
};

export type UsePivotWidgetCsvDownloadResult = {
  headerConfig: WidgetHeaderConfig;
};

/**
 * Enhances a pivot table widget's header with CSV download capabilities:
 * - Adds the "Download > CSV File" header menu item.
 * - Executes the CSV query and downloads the result as a CSV file.
 *
 * @param props - Pivot widget props and base header config
 * @returns Header config for {@link WidgetContainer}
 */
export function usePivotWidgetCsvDownload(
  props: UsePivotWidgetCsvDownloadParams,
): UsePivotWidgetCsvDownloadResult {
  const { dataOptions, dataSource, filters, highlights, title, config, baseHeaderConfig } = props;
  const csvLoader = useCsvQueryFileLoader();

  const csvQueryParams = useMemo(() => {
    const internal = translatePivotTableDataOptions(dataOptions);
    const dimensions = [
      ...(internal.rows ?? []).map(translateColumnToAttribute),
      ...(internal.columns ?? []).map(translateColumnToAttribute),
    ];
    const measures = (internal.values ?? []).map(translateColumnToMeasure);
    return {
      dataSource,
      dimensions,
      measures,
      filters,
      highlights,
      filename: title ? `${title}.csv` : undefined,
    };
  }, [dataOptions, dataSource, filters, highlights, title]);

  const isPivotTableAllowCsvDownload =
    csvQueryParams.dimensions.length > 0 || csvQueryParams.measures.length > 0;
  const isCsvDownloadEnabled =
    !!config?.actions?.downloadCsv?.enabled && isPivotTableAllowCsvDownload;

  const headerConfig = useWithCsvDownloadMenuItem({
    baseHeaderConfig,
    enabled: isCsvDownloadEnabled,
    onClick: () => isPivotTableAllowCsvDownload && csvLoader.execute(csvQueryParams),
  });

  return { headerConfig };
}
