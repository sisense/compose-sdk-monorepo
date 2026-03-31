import { useMemo } from 'react';

import { useCsvQueryFileLoader } from '@/domains/widgets/hooks/use-csv-query-file-loader.js';
import { useWithCsvDownloadMenuItem } from '@/domains/widgets/hooks/use-with-csv-download-menu-item.js';
import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';
import { extractDimensionsAndMeasures } from '@/infra/contexts/custom-widgets-provider/use-execute-custom-widget-query.js';

import type { CustomWidgetProps } from './types.js';

export type UseCustomWidgetCsvDownloadParams = Pick<
  CustomWidgetProps,
  'title' | 'dataOptions' | 'filters' | 'highlights' | 'config' | 'dataSource'
>;

export type UseCustomWidgetCsvDownloadResult = {
  headerConfig: WidgetHeaderConfig;
};

/**
 * Enhances a custom widget's header with CSV download capabilities:
 * - Adds the "Download > CSV File" header menu item.
 * - Executes the CSV query and downloads the result as a CSV file.
 *
 * @param widgetProps - Custom widget props needed for CSV
 * @returns Header config for {@link WidgetContainer}
 */
export function useCustomWidgetCsvDownload(
  widgetProps: UseCustomWidgetCsvDownloadParams,
): UseCustomWidgetCsvDownloadResult {
  const { dataSource, dataOptions, filters, highlights, title, config } = widgetProps;
  const csvLoader = useCsvQueryFileLoader();

  const baseHeaderConfig = useMemo(() => config?.header ?? {}, [config?.header]);

  const csvQueryParams = useMemo(() => {
    const { dimensions, measures } = extractDimensionsAndMeasures(dataOptions);
    return {
      dataSource,
      dimensions,
      measures,
      filters,
      highlights,
      filename: title ? `${title}.csv` : undefined,
    };
  }, [dataSource, dataOptions, filters, highlights, title]);

  const isCustomWidgetAllowCsvDownload =
    csvQueryParams.dimensions.length > 0 || csvQueryParams.measures.length > 0;
  const isCsvDownloadEnabled =
    !!config?.actions?.downloadCsv?.enabled && isCustomWidgetAllowCsvDownload;

  const headerConfig = useWithCsvDownloadMenuItem({
    baseHeaderConfig,
    enabled: isCsvDownloadEnabled,
    onClick: () => isCustomWidgetAllowCsvDownload && csvLoader.execute(csvQueryParams),
  });

  return { headerConfig };
}
