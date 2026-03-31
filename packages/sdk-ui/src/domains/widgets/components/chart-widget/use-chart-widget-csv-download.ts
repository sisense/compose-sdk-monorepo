import { useMemo } from 'react';

import { isDimensionalLevelAttribute } from '@sisense/sdk-data';

import { getTranslatedDataOptions } from '@/domains/visualizations/components/chart/helpers/use-translated-data-options.js';
import { getTableAttributesAndMeasures } from '@/domains/visualizations/components/table/hooks/use-table-data.js';
import { translateTableDataOptions } from '@/domains/visualizations/core/chart-data-options/translate-data-options.js';
import { TableDataOptions } from '@/domains/visualizations/core/chart-data-options/types';
import { isTable } from '@/domains/visualizations/core/chart-options-processor/translations/types.js';
import { useCsvQueryFileLoader } from '@/domains/widgets/hooks/use-csv-query-file-loader.js';
import { useWithCsvDownloadMenuItem } from '@/domains/widgets/hooks/use-with-csv-download-menu-item.js';
import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';

import type { ChartWidgetProps } from './types.js';

const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss.S';

export type UseChartWidgetCsvDownloadParams = Pick<
  ChartWidgetProps,
  'title' | 'dataOptions' | 'chartType' | 'filters' | 'highlights' | 'config' | 'dataSource'
> & {
  /** Base header config */
  baseHeaderConfig: WidgetHeaderConfig;
};

export type UseChartWidgetCsvDownloadResult = {
  headerConfig: WidgetHeaderConfig;
};

/**
 * Enhances a chart widget's header with CSV download capabilities:
 * - Adds the "Download > CSV File" header menu item.
 * - Executes the CSV query and downloads the result as a CSV file.
 *
 * @param props - Chart widget props and base header config
 * @returns Header config for {@link WidgetContainer}
 */
export function useChartWidgetCsvDownload(
  props: UseChartWidgetCsvDownloadParams,
): UseChartWidgetCsvDownloadResult {
  const {
    chartType,
    dataOptions,
    dataSource,
    filters,
    highlights,
    title,
    config,
    baseHeaderConfig,
  } = props;
  const csvLoader = useCsvQueryFileLoader();

  const csvQueryParams = useMemo(() => {
    const isTableWidget = isTable(chartType);
    const { attributes, measures } = isTableWidget
      ? getTableAttributesAndMeasures(translateTableDataOptions(dataOptions as TableDataOptions))
      : getTranslatedDataOptions(dataOptions, chartType);

    const attributesWithUnformattedDates = attributes.map((attribute) => {
      if (isDimensionalLevelAttribute(attribute)) {
        return attribute.format(DEFAULT_DATE_FORMAT);
      }
      return attribute;
    });

    return {
      dataSource,
      dimensions: attributesWithUnformattedDates,
      measures,
      filters,
      highlights,
      ungroup: isTableWidget,
      filename: title ? `${title}.csv` : undefined,
    };
  }, [chartType, dataOptions, dataSource, filters, highlights, title]);

  const isChartWidgetAllowCsvDownload =
    csvQueryParams.dimensions.length > 0 || csvQueryParams.measures.length > 0;
  const isCsvDownloadEnabled =
    !!config?.actions?.downloadCsv?.enabled && isChartWidgetAllowCsvDownload;

  const headerConfig = useWithCsvDownloadMenuItem({
    baseHeaderConfig,
    enabled: isCsvDownloadEnabled,
    onClick: () => isChartWidgetAllowCsvDownload && csvLoader.execute(csvQueryParams),
  });

  return { headerConfig };
}
