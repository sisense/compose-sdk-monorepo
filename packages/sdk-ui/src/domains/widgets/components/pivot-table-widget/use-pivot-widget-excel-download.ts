import { useCallback, useMemo } from 'react';

import { translatePivotTableDataOptions } from '@/domains/visualizations/core/chart-data-options/translate-data-options.js';
import {
  translateColumnToAttribute,
  translateColumnToMeasure,
} from '@/domains/visualizations/core/chart-data-options/utils.js';
import {
  mapAttributesForExcelExport,
  mapMeasuresForExcelExport,
} from '@/domains/widgets/helpers/excel-export-map-dimensions-measures.js';
import { useExcelQueryFileLoader } from '@/domains/widgets/hooks/use-excel-query-file-loader.js';
import { useWithExcelDownloadMenuItem } from '@/domains/widgets/hooks/use-with-excel-download-menu-item.js';
import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';
import { useAppSettings } from '@/shared/hooks/use-app-settings.js';

import type { PivotTableWidgetProps } from './types.js';

const PIVOT_WIDGET_TYPE = 'pivot';

export type UsePivotWidgetExcelDownloadParams = Pick<
  PivotTableWidgetProps,
  'title' | 'dataOptions' | 'config' | 'dataSource' | 'filters' | 'highlights' | 'id'
> & {
  baseHeaderConfig: WidgetHeaderConfig;
};

export type UsePivotWidgetExcelDownloadResult = {
  headerConfig: WidgetHeaderConfig;
};

/**
 * Enhances a pivot table widget header with Excel download menu items.
 * Excel menu is shown only when the widget/dashboard allows download **and**
 * the Sisense server feature **`exportingXlsxV2`** is active (`api/globals` → `features`).
 * **Repeat rows** sets `mergeRows: false`; **Merge rows** sets `mergeRows: true`).
 *
 * @param props - Pivot data/config plus `baseHeaderConfig`. `id` is optional; when present it is forwarded as `widgetId` without validation.
 * @returns Header config for {@link WidgetContainer}
 */
export function usePivotWidgetExcelDownload(
  props: UsePivotWidgetExcelDownloadParams,
): UsePivotWidgetExcelDownloadResult {
  const { dataOptions, dataSource, title, config, baseHeaderConfig, filters, highlights, id } =
    props;
  const excelLoader = useExcelQueryFileLoader();
  const appSettings = useAppSettings();
  const isExportingXlsxV2FeatureOn = appSettings?.serverFeatures?.exportingXlsxV2?.active === true;

  const excelQueryParams = useMemo(() => {
    const internal = translatePivotTableDataOptions(dataOptions);
    const dimensions = mapAttributesForExcelExport([
      ...(internal.rows ?? [])
        .map(translateColumnToAttribute)
        .map((attribute) => Object.assign(attribute, { panel: 'rows' as const })),
      ...(internal.columns ?? [])
        .map(translateColumnToAttribute)
        .map((attribute) => Object.assign(attribute, { panel: 'columns' as const })),
    ]);
    const measures = (internal.values ?? []).map(translateColumnToMeasure);

    return {
      dataSource,
      dimensions,
      measures: mapMeasuresForExcelExport(measures),
      filters,
      highlights,
      ungroup: false,
      filename: title ? `${title}.xlsx` : undefined,
      widgetType: PIVOT_WIDGET_TYPE,
      widgetId: id,
      widgetTitle: title ?? '',
    };
  }, [dataOptions, dataSource, filters, highlights, id, title]);

  const isPivotWidgetAllowExcelDownload =
    excelQueryParams.dimensions.length > 0 || excelQueryParams.measures.length > 0;
  const isExcelDownloadEnabled =
    !!config?.actions?.downloadExcel?.enabled &&
    isExportingXlsxV2FeatureOn &&
    isPivotWidgetAllowExcelDownload;

  const onDownloadExcel = useCallback(
    (mergeRows: boolean) => {
      if (!isExcelDownloadEnabled || !isPivotWidgetAllowExcelDownload) {
        return;
      }
      const params = { ...excelQueryParams, mergeRows };
      void excelLoader.execute(params);
    },
    [excelLoader, excelQueryParams, isPivotWidgetAllowExcelDownload, isExcelDownloadEnabled],
  );

  const headerConfig = useWithExcelDownloadMenuItem({
    baseHeaderConfig,
    enabled: isExcelDownloadEnabled,
    onDownloadExcel,
  });

  return { headerConfig };
}
