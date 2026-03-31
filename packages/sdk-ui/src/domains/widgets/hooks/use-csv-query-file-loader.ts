import { useCallback, useEffect, useState } from 'react';

import { useExecuteCsvQueryInternal } from '@/domains/query-execution/hooks/use-execute-csv-query/use-execute-csv-query.js';
import type { ExecuteCsvQueryParams } from '@/domains/query-execution/types.js';

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
 * Triggers a browser file download from a Blob.
 *
 * @param blob - The CSV Blob to download.
 * @param filename - The name to give the downloaded file.
 */
function downloadBlobAsFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(link);
}

const DEFAULT_FILENAME = 'file';

/**
 * Normalizes a file name by removing invalid characters and keeping the extension.
 *
 * @param rawFileName - The raw file name to normalize.
 * @returns The normalized file name.
 */
function normalizeFileName(rawFileName: string): string {
  const lastDotIndex = rawFileName.lastIndexOf('.');

  const namePart = lastDotIndex === -1 ? rawFileName : rawFileName.substring(0, lastDotIndex);
  const extensionPart = lastDotIndex === -1 ? '' : rawFileName.substring(lastDotIndex);

  // The regex /[^a-zA-Z0-9]/g finds anything that is NOT (-) a letter or number
  // and replaces it with an empty string (removes it).
  const normalizedName = namePart.replace(/[^a-zA-Z0-9]/g, '');

  return `${normalizedName || DEFAULT_FILENAME}${extensionPart}`;
}

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
