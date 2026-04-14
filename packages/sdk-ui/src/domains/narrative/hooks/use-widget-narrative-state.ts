import { useCallback, useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import {
  isChartWidgetProps,
  isPivotTableWidgetProps,
} from '@/domains/widgets/components/widget-by-id/utils.js';
import { WidgetProps } from '@/domains/widgets/components/widget/types';
import type { NarrativeRequest } from '@/infra/api/narrative/narrative-api-types.js';
import { getNarrative } from '@/infra/api/narrative/narrative-endpoints.js';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';

import {
  type NarrativeQueryParams,
  prepareNarrativeRequest,
} from '../core/build-narrative-request.js';
import type { WidgetNarrativeOptions } from '../core/widget-narrative-options.js';
import {
  convertChartWidgetPropsToNarrativeParams,
  convertPivotWidgetPropsToNarrativeRequest,
} from '../core/widget-props-to-narrative-params.js';

/**
 * Hook state aligned with legacy {@link UseGetNlgInsightsState}; used by {@link useGetWidgetNarrative}.
 *
 * @internal
 */
export type WidgetNarrativeQueryState = {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  data: string | undefined;
  error: unknown;
  refetch: () => void;
};

const INACTIVE_NARRATIVE_PARAMS: NarrativeQueryParams = {
  dataSource: '__WidgetNarrativeInactive__',
  dimensions: [],
  measures: [],
  filters: [],
};

export type UseWidgetNarrativeStateParams = {
  widgetProps: WidgetProps;
  enabled?: boolean;
} & WidgetNarrativeOptions;

export type UseWidgetNarrativeStateResult = WidgetNarrativeQueryState & {
  supported: boolean;
  /**
   * Mirrors the `enabled` param. When `false`, the narrative is opted out: `data` is cleared (no
   * cached fallback), `narrativeRequest` is undefined, and loading/error flags reflect a disabled
   * query rather than “no insights.”
   */
  enabled: boolean;
  /** Present when `supported` and `enabled`; used by {@link WidgetNarrative} for feedback payload only. */
  narrativeRequest: NarrativeRequest | undefined;
};

/**
 * Resolves chart or pivot widget props to a narration request and runs `getNarrative` via TanStack Query.
 * Depends on {@link useSisenseContext} (`httpClient`, narration settings) and a `QueryClientProvider`.
 * Not exported from `@sisenseInternal` public API.
 *
 * @internal
 */
export function useWidgetNarrativeState({
  widgetProps,
  defaultDataSource,
  verbosity,
  enabled = true,
  ignoreTrendAndForecast = false,
  isUnifiedNarrationEnabled: optionsUnified,
  isSisenseAiEnabled: optionsSisenseAi,
}: UseWidgetNarrativeStateParams): UseWidgetNarrativeStateResult {
  const { app } = useSisenseContext();
  const httpClient = app?.httpClient;

  const narrativeOptions = useMemo(
    () => ({
      isUnifiedNarrationEnabled:
        optionsUnified ?? app?.settings?.isUnifiedNarrationEnabled ?? false,
      isSisenseAiEnabled: optionsSisenseAi ?? app?.settings?.isSisenseAiEnabled ?? false,
    }),
    [
      optionsUnified,
      optionsSisenseAi,
      app?.settings?.isUnifiedNarrationEnabled,
      app?.settings?.isSisenseAiEnabled,
    ],
  );

  const { supported, narrativeRequest } = useMemo((): {
    supported: boolean;
    narrativeRequest: NarrativeRequest | undefined;
  } => {
    if (isPivotTableWidgetProps(widgetProps)) {
      try {
        return {
          supported: true,
          narrativeRequest: convertPivotWidgetPropsToNarrativeRequest(
            widgetProps,
            defaultDataSource,
            verbosity,
            ignoreTrendAndForecast,
          ),
        };
      } catch {
        return { supported: false, narrativeRequest: undefined };
      }
    }

    if (!isChartWidgetProps(widgetProps)) {
      return { supported: false, narrativeRequest: undefined };
    }

    try {
      const params = convertChartWidgetPropsToNarrativeParams(
        widgetProps,
        defaultDataSource,
        verbosity,
        ignoreTrendAndForecast,
      );
      return { supported: true, narrativeRequest: prepareNarrativeRequest(params) };
    } catch {
      return { supported: false, narrativeRequest: undefined };
    }
  }, [widgetProps, defaultDataSource, verbosity, ignoreTrendAndForecast]);

  const payload = useMemo(() => {
    if (supported && narrativeRequest) {
      return narrativeRequest;
    }
    return prepareNarrativeRequest(INACTIVE_NARRATIVE_PARAMS);
  }, [supported, narrativeRequest]);

  const queryEnabled = supported && enabled && !!httpClient;

  /** Stable connection identity for the query cache (`HttpClient` is not JSON-serializable). */
  const clientId = httpClient ? httpClient.url : null;
  const payloadKey = useMemo(() => JSON.stringify(payload), [payload]);

  const { data, error, isError, isLoading, isSuccess, refetch } = useQuery({
    queryKey: [
      'narrative',
      payloadKey,
      clientId,
      narrativeOptions.isUnifiedNarrationEnabled,
      narrativeOptions.isSisenseAiEnabled,
    ],
    queryFn: () => {
      if (!httpClient) {
        return Promise.reject(new Error('HttpClient is required for narrative requests'));
      }
      return getNarrative(httpClient, payload, narrativeOptions);
    },
    select: (response) => response?.data?.answer,
    enabled: queryEnabled,
  });

  const refetchNarrative = useCallback(() => {
    void refetch();
  }, [refetch]);

  if (!enabled) {
    return {
      isLoading: false,
      isError: false,
      isSuccess: false,
      data: undefined,
      error: undefined,
      refetch: refetchNarrative,
      supported,
      enabled: false,
      narrativeRequest: undefined,
    };
  }

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    refetch: refetchNarrative,
    supported,
    enabled: true,
    narrativeRequest: supported ? narrativeRequest : undefined,
  };
}
