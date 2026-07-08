import { useCallback, useMemo } from 'react';

import {
  isMeasureColumn,
  translateColumnToAttribute,
} from '@/domains/visualizations/core/chart-data-options/utils.js';
import {
  mapAttributesForExcelExport,
  mapMeasureColumnForExcelExport,
  type MeasureWithExcelExportFormat,
} from '@/domains/widgets/helpers/excel-export-map-dimensions-measures.js';
import { useExcelQueryFileLoader } from '@/domains/widgets/hooks/use-excel-query-file-loader.js';
import { useWithExcelDownloadMenuItem } from '@/domains/widgets/hooks/use-with-excel-download-menu-item.js';
import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';
import type { GenericDataOptions } from '@/types';

import type { CustomWidgetProps } from './types.js';

function extractDimensionsAndMeasuresForExcelExport(dataOptions: GenericDataOptions): {
  dimensions: ReturnType<typeof translateColumnToAttribute>[];
  measures: MeasureWithExcelExportFormat[];
} {
  const dimensions: ReturnType<typeof translateColumnToAttribute>[] = [];
  const measures: MeasureWithExcelExportFormat[] = [];

  Object.keys(dataOptions).forEach((key) => {
    if (!dataOptions[key].length) {
      return;
    }

    dataOptions[key].forEach((column) => {
      if (isMeasureColumn(column)) {
        measures.push(mapMeasureColumnForExcelExport(column));
      } else {
        dimensions.push(translateColumnToAttribute(column));
      }
    });
  });

  return { dimensions, measures };
}

export type UseCustomWidgetExcelDownloadParams = Pick<
  CustomWidgetProps,
  'title' | 'dataOptions' | 'filters' | 'config' | 'dataSource' | 'customWidgetType' | 'id'
> & {
  baseHeaderConfig: WidgetHeaderConfig;
};

export type UseCustomWidgetExcelDownloadResult = {
  headerConfig: WidgetHeaderConfig;
};

/**
 * Enhances a custom widget header with Excel download menu items when the widget/dashboard allows download.
 * **Repeat rows** sets `mergeRows: false`; **Merge rows** sets `mergeRows: true`.
 *
 * @param props - Custom widget data plus `baseHeaderConfig` (typically from {@link useCustomWidgetCsvDownload}).
 * @returns Header config for {@link WidgetContainer}
 */
export function useCustomWidgetExcelDownload(
  props: UseCustomWidgetExcelDownloadParams,
): UseCustomWidgetExcelDownloadResult {
  const {
    customWidgetType,
    dataOptions,
    dataSource,
    title,
    config,
    baseHeaderConfig,
    id,
    filters,
  } = props;
  const excelLoader = useExcelQueryFileLoader();

  const excelQueryParams = useMemo(() => {
    const { dimensions, measures } = extractDimensionsAndMeasuresForExcelExport(dataOptions);
    return {
      dataSource,
      dimensions: mapAttributesForExcelExport(dimensions),
      measures,
      ungroup: false,
      filename: title ? `${title}.xlsx` : undefined,
      widgetType: customWidgetType,
      widgetId: id,
      widgetTitle: title ?? '',
    };
  }, [customWidgetType, dataOptions, dataSource, id, title]);

  const isCustomWidgetAllowExcelDownload =
    excelQueryParams.dimensions.length > 0 || excelQueryParams.measures.length > 0;
  const isExcelDownloadEnabled =
    !!config?.actions?.downloadExcel?.enabled && isCustomWidgetAllowExcelDownload;

  const onDownloadExcel = useCallback(
    (mergeRows: boolean) => {
      if (!isExcelDownloadEnabled || !isCustomWidgetAllowExcelDownload) {
        return;
      }
      void excelLoader.execute({ ...excelQueryParams, mergeRows, filters });
    },
    [
      excelLoader,
      excelQueryParams,
      filters,
      isCustomWidgetAllowExcelDownload,
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
