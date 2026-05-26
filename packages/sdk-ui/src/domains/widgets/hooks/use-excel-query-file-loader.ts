import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useExecuteExcelQueryInternal } from '@/domains/query-execution/hooks/use-execute-excel-query/use-execute-excel-query.js';
import type { ExecuteExcelQueryParams } from '@/domains/query-execution/types.js';
import {
  downloadBlobAsFile,
  normalizeFileName,
} from '@/domains/widgets/helpers/download-blob-as-file.js';

const DEFAULT_EXCEL_FILENAME = 'data.xlsx';

export type ExcelExecuteParams = Omit<ExecuteExcelQueryParams, 'enabled' | 'exportRunId'>;

export type UseExcelQueryLoaderResult = {
  /** Triggers Excel export and browser file download with the given params. */
  execute: (params: ExcelExecuteParams) => void;
};

const idleExcelQueryParams: ExecuteExcelQueryParams = {
  dimensions: [],
  measures: [],
  mergeRows: false,
  enabled: false,
};

/**
 * Hook that runs an Excel JAQL export on demand and triggers a browser file download.
 * Uses {@link useExecuteExcelQueryInternal} for loading and error state (mirrors {@link useCsvQueryFileLoader}).
 *
 * @returns `execute` callback
 */
export function useExcelQueryFileLoader(): UseExcelQueryLoaderResult {
  const [pendingParams, setPendingParams] = useState<
    (ExcelExecuteParams & { exportRunId: number }) | null
  >(null);
  const exportRunIdRef = useRef(0);

  /**
   * Stable reference while `pendingParams` is unchanged. A new object literal each render would
   * retrigger `useExecuteExcelQueryInternal`'s effect (deps include `params`), run cleanup
   * (`isCancelled`), and drop `success` dispatches for in-flight requests.
   */
  const excelQueryParams: ExecuteExcelQueryParams = useMemo(
    () => ({
      ...idleExcelQueryParams,
      ...(pendingParams ?? {}),
      enabled: !!pendingParams,
      mergeRows: pendingParams?.mergeRows ?? false,
    }),
    [pendingParams],
  );

  const excelState = useExecuteExcelQueryInternal(excelQueryParams);

  useEffect(() => {
    if (!pendingParams) {
      return;
    }

    if (excelState.isSuccess && excelState.data) {
      downloadBlobAsFile(
        excelState.data,
        normalizeFileName(pendingParams.filename ?? DEFAULT_EXCEL_FILENAME),
      );
      setPendingParams(null);
    } else if (excelState.isError) {
      setPendingParams(null);
    }
  }, [pendingParams, excelState.isSuccess, excelState.isError, excelState.data]);

  const execute = useCallback((params: ExcelExecuteParams) => {
    exportRunIdRef.current += 1;
    setPendingParams({ ...params, exportRunId: exportRunIdRef.current });
  }, []);

  return { execute };
}
