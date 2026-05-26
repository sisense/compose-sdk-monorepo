import { useCallback, useEffect, useState } from 'react';

import { useExecuteCsvQueryInternal } from '@/domains/query-execution/hooks/use-execute-csv-query/use-execute-csv-query.js';
import type { ExecuteCsvQueryParams } from '@/domains/query-execution/types.js';
import {
  downloadBlobAsFile,
  normalizeFileName,
} from '@/domains/widgets/helpers/download-blob-as-file.js';

const DEFAULT_CSV_FILENAME = 'data.csv';

export type CsvExecuteParams = Omit<ExecuteCsvQueryParams, 'enabled'> & {
  /** Filename for the downloaded CSV file. Defaults to `data.csv`. */
  filename?: string;
};

export type UseCsvQueryLoaderResult = {
  /** Triggers CSV query execution and browser file download with the given params. */
  execute: (params: CsvExecuteParams) => void;
};

/**
 * Hook that executes a CSV query on demand and triggers a browser file download.
 * Call `execute` with query params to start the download; no params are needed at hook initialisation.
 *
 * @returns `execute` callback
 */
export function useCsvQueryFileLoader(): UseCsvQueryLoaderResult {
  const [pendingParams, setPendingParams] = useState<CsvExecuteParams | null>(null);

  const csvState = useExecuteCsvQueryInternal({
    ...(pendingParams ?? { dimensions: [], measures: [] }),
    enabled: !!pendingParams,
    config: { asDataStream: true },
  });

  useEffect(() => {
    if (!pendingParams) return;

    if (csvState.isSuccess && csvState.data) {
      downloadBlobAsFile(
        csvState.data as Blob,
        normalizeFileName(pendingParams.filename ?? DEFAULT_CSV_FILENAME),
      );
      setPendingParams(null);
    } else if (csvState.isError) {
      setPendingParams(null);
    }
  }, [pendingParams, csvState.isSuccess, csvState.isError, csvState.data]);

  const execute = useCallback((params: CsvExecuteParams) => {
    setPendingParams(params);
  }, []);

  return { execute };
}
