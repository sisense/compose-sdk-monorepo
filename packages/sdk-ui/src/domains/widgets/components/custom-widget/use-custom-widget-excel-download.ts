import { useCallback, useMemo } from 'react';

import {
  mapAttributesForExcelExport,
  mapMeasuresForExcelExport,
} from '@/domains/widgets/helpers/excel-export-map-dimensions-measures.js';
import { useExcelQueryFileLoader } from '@/domains/widgets/hooks/use-excel-query-file-loader.js';
import { useWithExcelDownloadMenuItem } from '@/domains/widgets/hooks/use-with-excel-download-menu-item.js';
import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';
import { extractDimensionsAndMeasures } from '@/infra/contexts/custom-widgets-provider/use-execute-custom-widget-query.js';
import { useAppSettings } from '@/shared/hooks/use-app-settings.js';

import type { CustomWidgetProps } from './types.js';

export type UseCustomWidgetExcelDownloadParams = Pick<
  CustomWidgetProps,
  | 'title'
  | 'dataOptions'
  | 'filters'
  | 'highlights'
  | 'config'
  | 'dataSource'
  | 'customWidgetType'
  | 'id'
> & {
  baseHeaderConfig: WidgetHeaderConfig;
};

export type UseCustomWidgetExcelDownloadResult = {
  headerConfig: WidgetHeaderConfig;
};

/**
 * Enhances a custom widget header with Excel download menu items when the server feature
 * **`exportingXlsxV2`** is active. **Repeat rows** sets `mergeRows: false`; **Merge rows** sets `mergeRows: true`.
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
    highlights,
  } = props;
  const excelLoader = useExcelQueryFileLoader();
  const appSettings = useAppSettings();
  const isExportingXlsxV2FeatureOn = appSettings?.serverFeatures?.exportingXlsxV2?.active === true;

  const excelQueryParams = useMemo(() => {
    const { dimensions, measures } = extractDimensionsAndMeasures(dataOptions);
    return {
      dataSource,
      dimensions: mapAttributesForExcelExport(dimensions),
      measures: mapMeasuresForExcelExport(measures),
      filters,
      highlights,
      ungroup: false,
      filename: title ? `${title}.xlsx` : undefined,
      widgetType: customWidgetType,
      widgetId: id,
      widgetTitle: title ?? '',
    };
  }, [customWidgetType, dataOptions, dataSource, filters, highlights, id, title]);

  const isCustomWidgetAllowExcelDownload =
    excelQueryParams.dimensions.length > 0 || excelQueryParams.measures.length > 0;
  const isExcelDownloadEnabled =
    !!config?.actions?.downloadExcel?.enabled &&
    isExportingXlsxV2FeatureOn &&
    isCustomWidgetAllowExcelDownload;

  const onDownloadExcel = useCallback(
    (mergeRows: boolean) => {
      if (!isExcelDownloadEnabled || !isCustomWidgetAllowExcelDownload) {
        return;
      }
      const params = { ...excelQueryParams, mergeRows };
      void excelLoader.execute(params);
    },
    [excelLoader, excelQueryParams, isCustomWidgetAllowExcelDownload, isExcelDownloadEnabled],
  );

  const headerConfig = useWithExcelDownloadMenuItem({
    baseHeaderConfig,
    enabled: isExcelDownloadEnabled,
    onDownloadExcel,
  });

  return { headerConfig };
}
