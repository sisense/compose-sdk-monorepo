import { useCallback, useMemo } from 'react';

import type { Attribute, Measure } from '@sisense/sdk-data';

import { getTranslatedDataOptions } from '@/domains/visualizations/components/chart/helpers/use-translated-data-options.js';
import { translateTableDataOptions } from '@/domains/visualizations/core/chart-data-options/translate-data-options.js';
import { TableDataOptions } from '@/domains/visualizations/core/chart-data-options/types';
import {
  isMeasureColumn,
  translateColumnToAttribute,
} from '@/domains/visualizations/core/chart-data-options/utils.js';
import { isTable } from '@/domains/visualizations/core/chart-options-processor/translations/types.js';
import {
  mapAttributesForExcelExport,
  mapMeasureColumnsForExcelExport,
  mapMeasuresForExcelExport,
} from '@/domains/widgets/helpers/excel-export-map-dimensions-measures.js';
import { useExcelQueryFileLoader } from '@/domains/widgets/hooks/use-excel-query-file-loader.js';
import { useWithExcelDownloadMenuItem } from '@/domains/widgets/hooks/use-with-excel-download-menu-item.js';
import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';

import type { ChartWidgetProps } from './types.js';

export type UseChartWidgetExcelDownloadParams = Pick<
  ChartWidgetProps,
  'title' | 'dataOptions' | 'chartType' | 'config' | 'dataSource' | 'filters' | 'id'
> & {
  baseHeaderConfig: WidgetHeaderConfig;
};

export type UseChartWidgetExcelDownloadResult = {
  headerConfig: WidgetHeaderConfig;
};

/**
 * Enhances a chart widget header with Excel download menu items (placeholder).
 * Excel menu is shown only when the widget/dashboard allows download.
 * **Repeat rows** sets `mergeRows: false`; **Merge rows** sets `mergeRows: true`).
 *
 * @param props - Chart data/config plus `baseHeaderConfig`. `id` is optional; when present it is forwarded as `widgetId` without validation.
 * @returns Header config for {@link WidgetContainer}
 */
export function useChartWidgetExcelDownload(
  props: UseChartWidgetExcelDownloadParams,
): UseChartWidgetExcelDownloadResult {
  const { chartType, dataOptions, dataSource, title, config, baseHeaderConfig, id, filters } =
    props;
  const excelLoader = useExcelQueryFileLoader();
  const downloadExcelRequested = !!config?.actions?.downloadExcel?.enabled;

  const excelQueryParams = useMemo(() => {
    if (!downloadExcelRequested) {
      return {
        dataSource,
        dimensions: [] as Attribute[],
        measures: [] as Measure[],
        ungroup: false,
        filename: title ? `${title}.xlsx` : undefined,
        widgetType: chartType,
        widgetId: id,
        widgetTitle: title ?? '',
      };
    }

    const isTableWidget = isTable(chartType);
    const { attributes, measures } = isTableWidget
      ? (() => {
          const translated = translateTableDataOptions(dataOptions as TableDataOptions);
          const tableAttributes: Attribute[] = [];
          const tableMeasureColumns = [];
          for (const column of translated.columns) {
            if (isMeasureColumn(column)) {
              tableMeasureColumns.push(column);
            } else {
              tableAttributes.push(translateColumnToAttribute(column));
            }
          }
          return {
            attributes: mapAttributesForExcelExport(tableAttributes),
            measures: mapMeasureColumnsForExcelExport(tableMeasureColumns),
          };
        })()
      : getTranslatedDataOptions(dataOptions, chartType);

    return {
      dataSource,
      dimensions: mapAttributesForExcelExport(attributes),
      measures: isTableWidget ? measures : mapMeasuresForExcelExport(measures),
      ungroup: false,
      filename: title ? `${title}.xlsx` : undefined,
      widgetType: chartType,
      widgetId: id,
      widgetTitle: title ?? '',
    };
  }, [chartType, dataOptions, dataSource, downloadExcelRequested, id, title]);

  const isChartWidgetAllowExcelDownload =
    excelQueryParams.dimensions.length > 0 || excelQueryParams.measures.length > 0;
  const isExcelDownloadEnabled =
    !!config?.actions?.downloadExcel?.enabled && isChartWidgetAllowExcelDownload;

  const onDownloadExcel = useCallback(
    (mergeRows: boolean) => {
      if (!isExcelDownloadEnabled || !isChartWidgetAllowExcelDownload) {
        return;
      }
      void excelLoader.execute({ ...excelQueryParams, mergeRows, filters });
    },
    [
      excelLoader,
      excelQueryParams,
      filters,
      isChartWidgetAllowExcelDownload,
      isExcelDownloadEnabled,
    ],
  );

  const headerConfig = useWithExcelDownloadMenuItem({
    baseHeaderConfig,
    enabled: isExcelDownloadEnabled,
    onDownloadExcel,
  });

  return { headerConfig };
}
