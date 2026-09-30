import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import type { WidgetProps } from '@/domains/widgets/components/widget/types';
import {
  DASHBOARD_NARRATIVE_MAX_QUERIES,
  type DashboardNarrativeQueriesRequest,
  getDashboardNarrative,
  getDashboardNarrativeByDashboardId,
  isDashboardNarrativeCacheMiss,
  isRetryableDashboardNarrativeError,
} from '@/infra/api/narrative/dashboard-narrative-endpoints.js';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';

import type { NarrativeState } from '../components/narrative/types.js';
import { buildDashboardNarrativeQueries } from '../core/build-dashboard-narrative-queries.js';
import { isDashboardNarrativeResponse, toNarrativeData } from '../core/to-narrative-data.js';

/** What one generation requests: a saved dashboard by id, or the widgets' queries. */
type NarrativeRequestTarget =
  | { kind: 'dashboard'; dashboardId: string; sharedMode: boolean; adminAccess: boolean }
  | { kind: 'queries'; request: DashboardNarrativeQueriesRequest };

/** One request: its target, and whether it only reads the service's cache. */
type NarrativeRequest = { target: NarrativeRequestTarget; cacheOnly: boolean };

/** Automatic attempts after a retryable failure, before the failed state is shown. */
const RETRYABLE_ATTEMPTS = 1;
const RETRY_DELAY_MS = 1000;

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
  } = params;
  const { app, isInitialized } = useSisenseContext();
  const httpClient = app?.httpClient;
  const defaultDataSource = app?.defaultDataSource;

  const [noData, setNoData] = useState(false);

  const mutation = useMutation({
    mutationFn: ({ target, cacheOnly }: NarrativeRequest) => {
      if (!httpClient) {
        return Promise.reject(new Error('HttpClient is required for narrative requests'));
      }
      return target.kind === 'dashboard'
        ? getDashboardNarrativeByDashboardId(httpClient, target.dashboardId, {
            cacheOnly,
            sharedMode: target.sharedMode,
            adminAccess: target.adminAccess,
          })
        : getDashboardNarrative(httpClient, { ...target.request, cacheOnly });
    },
    retry: (failureCount, error) =>
      failureCount < RETRYABLE_ATTEMPTS && isRetryableDashboardNarrativeError(error),
    retryDelay: RETRY_DELAY_MS,
  });
  const { mutate, reset, status, data, variables } = mutation;

  /** `undefined` when neither a dashboard id nor any widget query is there to request. */
  const getTarget = useCallback((): NarrativeRequestTarget | undefined => {
    if (dashboardId) return { kind: 'dashboard', dashboardId, sharedMode, adminAccess };
    const queries = buildDashboardNarrativeQueries(widgets ?? [], defaultDataSource).slice(
      0,
      DASHBOARD_NARRATIVE_MAX_QUERIES,
    );
    return queries.length > 0 ? { kind: 'queries', request: { queries } } : undefined;
  }, [dashboardId, sharedMode, adminAccess, widgets, defaultDataSource]);

  const generate = useCallback(() => {
    const target = getTarget();
    if (!target) {
      reset();
      setNoData(true);
      return;
    }
    setNoData(false);
    mutate({ target, cacheOnly: false });
  }, [getTarget, mutate, reset]);

  const requestedOnMount = useRef(false);
  useEffect(() => {
    if (!generateOnMount || requestedOnMount.current || !httpClient) return;
    requestedOnMount.current = true;
    generate();
  }, [generateOnMount, httpClient, generate]);

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
        if (!isDashboardNarrativeResponse(data)) {
          return isLookup ? { status: 'idle' } : { status: 'error', kind: 'failed' };
        }
        return isLookup && isDashboardNarrativeCacheMiss(data)
          ? { status: 'idle' }
          : { status: 'ready', data: toNarrativeData(data) };
      case 'error':
        return isLookup ? { status: 'idle' } : { status: 'error', kind: 'failed' };
      default:
        return isLookupPending ? { status: 'loading' } : { status: 'idle' };
    }
  }, [noData, status, data, isLookup, isLookupPending]);

  return { state, generate };
}
