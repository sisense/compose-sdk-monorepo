import { useEffect, useReducer } from 'react';

import type { DataSource } from '@sisense/sdk-data';
import type { HttpClient } from '@sisense/sdk-rest-client';

import { RestApi } from '@/infra/api/rest-api.js';

import { useSisenseContext } from '../../../../infra/contexts/sisense-context/sisense-context.js';
import { TranslatableError } from '../../../../infra/translation/translatable-error.js';
import type { ExcelQueryAction, ExcelQueryState, ExecuteExcelQueryParams } from '../../types.js';
import { buildJaqlForExcelExport } from './excel-export/build-jaql-excel-export.js';
import {
  buildXlsxExportPayload,
  type XlsxExportRequestPayload,
} from './excel-export/build-xlsx-export-payload.js';
import { downloadExcelQueryStateReducer } from './excel-query-state-reducer.js';
import { useExcelQueryParamsChanged } from './use-excel-query-params-changed.js';

function buildExcelExportPayloadFromParams(
  params: ExecuteExcelQueryParams,
  resolvedLanguage: string,
  widgetType: string,
  widgetId: string,
  dataSource: DataSource,
): XlsxExportRequestPayload {
  const jaql = buildJaqlForExcelExport(params, {
    widgetOid: widgetId,
    widgetTitle: params.widgetTitle ?? '',
    dataSource,
    mergeRows: params.mergeRows,
  });
  return buildXlsxExportPayload(
    {
      widgetId,
      widgetType,
      language: resolvedLanguage,
    },
    jaql,
    params.mergeRows,
  );
}

type ExcelExportAppSlice = {
  httpClient?: HttpClient;
  defaultDataSource?: DataSource;
  settings: { translationConfig: { language?: string } };
};

function runExcelJaqlExportWhenInputsReady(
  safeDispatch: (action: ExcelQueryAction) => void,
  app: ExcelExportAppSlice | undefined,
  params: ExecuteExcelQueryParams,
): void {
  const widgetType = params.widgetType;
  if (!widgetType) {
    safeDispatch({
      type: 'error',
      error: new Error('Excel export requires widgetType (e.g. ChartWidget `chartType`).'),
    });
    return;
  }
  const widgetId = params.widgetId;
  if (!widgetId) {
    safeDispatch({
      type: 'error',
      error: new Error(
        'Excel export requires widgetId (e.g. ChartWidget `id` when rendered via `Widget` / dashboard).',
      ),
    });
    return;
  }
  safeDispatch({ type: 'loading' });
  const httpClient = app?.httpClient;
  if (!httpClient) {
    safeDispatch({
      type: 'error',
      error: new TranslatableError('errors.executeQueryNoSisenseContext'),
    });
    return;
  }
  const dataSource = params.dataSource ?? app?.defaultDataSource;
  if (!dataSource) {
    safeDispatch({
      type: 'error',
      error: new TranslatableError('errors.executeQueryNoDataSource'),
    });
    return;
  }
  const resolvedLanguage = app?.settings.translationConfig.language ?? 'en-US';
  const payload = buildExcelExportPayloadFromParams(
    params,
    resolvedLanguage,
    widgetType,
    widgetId,
    dataSource,
  );
  void new RestApi(httpClient)
    .exportJaqlToXlsx(payload)
    .then((blob) => {
      if (!blob || blob.size === 0) {
        safeDispatch({
          type: 'error',
          error: new Error('Excel export returned an empty file.'),
        });
        return;
      }
      safeDispatch({ type: 'success', data: blob });
    })
    .catch((error: Error) => {
      safeDispatch({ type: 'error', error });
    });
}

/**
 * Runs JAQL XLSX export without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @param params - Parameters of the export query
 * @internal
 */
export function useExecuteExcelQueryInternal(params: ExecuteExcelQueryParams): ExcelQueryState {
  const isQueryParamsChanged = useExcelQueryParamsChanged(params);
  const [queryState, dispatch] = useReducer(downloadExcelQueryStateReducer, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });
  const { isInitialized, app } = useSisenseContext();

  /**
   * Runs one JAQL XLSX export per `params` identity while `enabled` is true. Unlike
   * {@link useExecuteCsvQueryInternal}, this hook does not use {@link useShouldLoad}: that helper
   * skips runs when `enabled` stays true and `isParamsChanged` is false on the same render pass,
   * which breaks on-demand downloads (repeat clicks, switching merge rows).
   */
  useEffect(() => {
    let isCancelled = false;
    const safeDispatch = (action: ExcelQueryAction) => {
      if (!isCancelled) {
        dispatch(action);
      }
    };

    if (!params.enabled) {
      return () => {
        isCancelled = true;
      };
    }

    if (!isInitialized) {
      safeDispatch({
        type: 'error',
        error: new TranslatableError('errors.executeQueryNoSisenseContext'),
      });
      return () => {
        isCancelled = true;
      };
    }

    runExcelJaqlExportWhenInputsReady(safeDispatch, app, params);

    return () => {
      isCancelled = true;
    };
  }, [app, isInitialized, params]);

  if (queryState.data && isQueryParamsChanged) {
    return downloadExcelQueryStateReducer(queryState, { type: 'loading' });
  }

  return queryState;
}
