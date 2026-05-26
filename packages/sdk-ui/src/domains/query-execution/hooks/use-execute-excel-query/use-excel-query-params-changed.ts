import { useHasChanged } from '../../../../shared/hooks/use-has-changed.js';
import type { ExecuteExcelQueryParams } from '../../types.js';
import { useQueryParamsChanged } from '../shared/query-params-comparator.js';

/**
 * Detects changes relevant to Excel export (query fields and `mergeRows`).
 *
 * @param params - Excel export parameters
 * @returns Whether parameters differ from the previous render
 */
export function useExcelQueryParamsChanged(params: ExecuteExcelQueryParams): boolean {
  const excelMetaChanged = useHasChanged(params, [
    'mergeRows',
    'exportRunId',
    'widgetId',
    'widgetTitle',
    'widgetType',
  ]);
  const queryParamsChanged = useQueryParamsChanged(params);
  return excelMetaChanged || queryParamsChanged;
}
