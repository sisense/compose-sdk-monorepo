import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import type { WidgetProps } from '@/domains/widgets/components/widget/types';
import type {
  DashboardNarrativeRequestOptions,
  DashboardNarrativeTriggerType,
} from '@/infra/api/narrative/dashboard-narrative-endpoints.js';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';

import type { NarrativeState } from '../components/narrative/types.js';
import { buildDashboardNarrativeQueries } from '../core/build-dashboard-narrative-queries.js';
import {
  type DashboardNarrativeTarget,
  isNoDataNarrativeError,
  requestDashboardNarrative,
} from '../core/get-narrative-from-dashboard.js';

/**
 * One request: its target, whether it only reads the service's cache, and — for a generation —
 * the usage-tracking fields and whether the `generate` action asked for it.
 */
type NarrativeRequest = {
  target: DashboardNarrativeTarget;
  cacheOnly: boolean;
  tracking?: Pick<DashboardNarrativeRequestOptions, 'subActionType' | 'triggerType'>;
  fromGenerate?: boolean;
};

/**
 * Parameters of {@link useNarrativeWidgetState}.
 * @internal
 */
export type UseNarrativeWidgetStateParams = {
  /** Widgets the narrative describes, in layout order. Not sent when `dashboardId` is set. */
  widgets?: readonly WidgetProps[];
  /** Saved dashboard to narrate; when non-empty, it is requested by id instead of by queries. */
  dashboardId?: string;
  /** The dashboard is open in shared mode (co-authoring). Only sent with `dashboardId`. */
  sharedMode?: boolean;
  /** The dashboard is open through Admin Access. Only sent with `dashboardId`. */
  adminAccess?: boolean;
  /**
   * Generates once, as soon as the Sisense app is available, without waiting for `generate`.
   * Without it, the service's cache is looked up once instead, and nothing is generated.
   */
  generateOnMount?: boolean;
  /** Sent as the generation's `triggerType` with `generateOnMount`. Defaults to `'export'`. */
  generateOnMountTriggerType?: DashboardNarrativeTriggerType;
  /** Called each time a generation requested through `generate` ends with a narrative. */
  onGenerated?: () => void;
};

/**
 * Result of {@link useNarrativeWidgetState}.
 * @internal
 */
export type UseNarrativeWidgetStateResult = {
  /** What the widget renders. */
  state: NarrativeState;
  /** Requests a narrative for the current widgets. */
  generate: () => void;
};

/**
 * Drives the dashboard narrative state machine: idle until `generate` is called (or, with
 * `generateOnMount`, until the Sisense app is available), then loading, then ready with the
 * narrative or one of the error kinds.
 *
 * Without `generateOnMount`, the service's cache is looked up once the Sisense app is available:
 * loading from mount until the lookup settles, then ready with a cached narrative, or idle when
 * the cache holds none or the lookup fails. Outside a Sisense context nothing is looked up.
 *
 * With a `dashboardId` the saved dashboard is requested by id; otherwise the widgets' queries
 * are sent. `no-data` when no widget yields a query (queries only); `failed` when the request
 * fails or the body is not a narrative. A retryable failure is retried once before it is
 * reported. Depends on {@link useSisenseContext} and a `QueryClientProvider` ancestor.
 * @param params - Dashboard id or widgets, and whether to generate on mount.
 * @returns The state to render and the generate action.
 * @internal
 */
export function useNarrativeWidgetState(
  params: UseNarrativeWidgetStateParams,
): UseNarrativeWidgetStateResult {
  const {
    widgets,
    dashboardId,
    sharedMode = false,
    adminAccess = false,
    generateOnMount = false,
    generateOnMountTriggerType = 'export',
    onGenerated,
  } = params;
  const { app, isInitialized } = useSisenseContext();
  const httpClient = app?.httpClient;
  const defaultDataSource = app?.defaultDataSource;

  const [noData, setNoData] = useState(false);

  const mutation = useMutation({
    // The retry of a server-side failure happens inside `requestDashboardNarrative`.
    mutationFn: ({ target, cacheOnly, tracking }: NarrativeRequest) => {
      if (!httpClient) {
        return Promise.reject(new Error('HttpClient is required for narrative requests'));
      }
      return requestDashboardNarrative(httpClient, target, { cacheOnly, ...tracking });
    },
  });
  const { mutate, reset, status, data, error, variables } = mutation;

  /** `undefined` when neither a dashboard id nor any widget query is there to request. */
  const getTarget = useCallback((): DashboardNarrativeTarget | undefined => {
    if (dashboardId) return { dashboardId, sharedMode, adminAccess };
    const queries = buildDashboardNarrativeQueries(widgets ?? [], defaultDataSource);
    return queries.length > 0 ? { queries } : undefined;
  }, [dashboardId, sharedMode, adminAccess, widgets, defaultDataSource]);

  // Whether this widget has shown a narrative, cached or generated: a generation after one is a
  // regenerate, even when the attempt in between failed.
  const hasShownNarrative = useRef(false);

  const requestGeneration = useCallback(
    (triggerType: DashboardNarrativeTriggerType, fromGenerate: boolean) => {
      const target = getTarget();
      if (!target) {
        reset();
        setNoData(true);
        return;
      }
      setNoData(false);
      mutate({
        target,
        cacheOnly: false,
        tracking: {
          subActionType: hasShownNarrative.current ? 'regenerate' : 'generate',
          triggerType,
        },
        fromGenerate,
      });
    },
    [getTarget, mutate, reset],
  );

  const generate = useCallback(() => requestGeneration('widgetButton', true), [requestGeneration]);

  const onGeneratedRef = useRef(onGenerated);
  useEffect(() => {
    onGeneratedRef.current = onGenerated;
  }, [onGenerated]);
  // Must stay out of the mutation's callbacks, where an error thrown by the host fails the generation.
  useEffect(() => {
    if (status === 'success' && variables?.fromGenerate) {
      onGeneratedRef.current?.();
    }
  }, [status, data, variables]);

  const requestedOnMount = useRef(false);
  useEffect(() => {
    if (!generateOnMount || requestedOnMount.current || !httpClient) return;
    requestedOnMount.current = true;
    requestGeneration(generateOnMountTriggerType, false);
  }, [generateOnMount, generateOnMountTriggerType, httpClient, requestGeneration]);

  useEffect(() => {
    if (generateOnMount || requestedOnMount.current || !httpClient) return;
    requestedOnMount.current = true;
    const target = getTarget();
    if (target) mutate({ target, cacheOnly: true });
  }, [generateOnMount, httpClient, getTarget, mutate]);

  const isLookup = variables?.cacheOnly === true;
  const hasTarget = useMemo(() => getTarget() !== undefined, [getTarget]);
  // Between mount and the lookup's start (the app may still be loading) nothing has been
  // requested yet, but the lookup is certain to follow.
  const isLookupPending =
    isInitialized && !generateOnMount && hasTarget && !noData && variables === undefined;

  const state = useMemo((): NarrativeState => {
    if (noData) return { status: 'error', kind: 'no-data' };
    switch (status) {
      case 'loading':
        return { status: 'loading' };
      case 'success':
        return { status: 'ready', data: data.narrative };
      case 'error':
        // A lookup that finds nothing in the cache, or fails, leaves the generate action.
        if (isLookup) return { status: 'idle' };
        return { status: 'error', kind: isNoDataNarrativeError(error) ? 'no-data' : 'failed' };
      default:
        return isLookupPending ? { status: 'loading' } : { status: 'idle' };
    }
  }, [noData, status, data, error, isLookup, isLookupPending]);

  useEffect(() => {
    if (state.status === 'ready') hasShownNarrative.current = true;
  }, [state.status]);

  return { state, generate };
}
