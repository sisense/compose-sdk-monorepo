import type { HttpClient } from '@sisense/sdk-rest-client';

import type { NarrativeRequest } from './narrative-api-types.js';
import { NARRATIVE_BY_CSDK } from './narrative-constants.js';

/**
 * Dashboard narrative endpoint for callers that hold JAQL rather than saved widget ids.
 * @internal
 */
export const DASHBOARD_NARRATIVE_QUERIES_ENDPOINT = 'api/v2/ai/narrative/queries';

/**
 * Dashboard narrative endpoint for a saved dashboard, followed by `/{dashboardId}`. The service
 * reads the dashboard's widgets, number formats and AI context itself.
 * @internal
 */
export const DASHBOARD_NARRATIVE_DASHBOARDS_ENDPOINT = 'api/v2/ai/narrative/dashboards';

/**
 * Upper bound on `queries` per request; the service rejects longer lists with 422.
 * @internal
 */
export const DASHBOARD_NARRATIVE_MAX_QUERIES = 50;

/**
 * One widget's query as sent to the dashboard narrative endpoint.
 * @internal
 */
export type DashboardNarrativeQuery = {
  /** Executable JAQL of the widget. `by` is set by {@link getDashboardNarrative}. */
  jaql: NarrativeRequest['jaql'];
  /** Widget title, a hint for the digest. */
  title?: string;
  /** Widget chart type, a hint for the digest. Not validated by the service. */
  chartType?: string;
  /**
   * Number format of each measure, keyed by the measure's title in `jaql`. The service quotes
   * numbers formatted with it; a measure without an entry is formatted with the service defaults.
   */
  measureFormats?: Record<string, DashboardNarrativeMeasureFormat>;
};

/**
 * Number format of one measure, in the shape of a Fusion widget panel item's `format.mask`:
 * `type`, `decimals`, `separated`, `abbreviations`, `currency`.
 * @internal
 */
export type DashboardNarrativeMeasureFormat = Record<string, unknown>;

/**
 * Request body of {@link DASHBOARD_NARRATIVE_QUERIES_ENDPOINT}.
 * @internal
 */
export type DashboardNarrativeQueriesRequest = DashboardNarrativeRequestOptions & {
  /** 1 to {@link DASHBOARD_NARRATIVE_MAX_QUERIES} entries. */
  queries: readonly DashboardNarrativeQuery[];
};

/**
 * Whether a generation is the widget's first narrative or a repeat of one it has shown, reported
 * for the service's usage tracking.
 * @internal
 */
export type DashboardNarrativeSubActionType = 'generate' | 'regenerate';

/**
 * What asked for a generation — a control, or an export that renders without a user —
 * reported for the service's usage tracking.
 * @sisenseInternal
 */
export type DashboardNarrativeTriggerType = 'widgetButton' | 'assistantCard' | 'export';

/**
 * Options shared by every dashboard narrative route.
 * @internal
 */
export type DashboardNarrativeRequestOptions = {
  /**
   * Answers from the service's cache only: a cached narrative is returned, and on a miss the
   * response is empty (see {@link isDashboardNarrativeCacheMiss}) — nothing is generated or billed.
   * The widgets' queries still run, since the cache key is derived from their results.
   */
  cacheOnly?: boolean;
  /** Sent as the `tracking.subActionType` body field, for the service's usage tracking. */
  subActionType?: DashboardNarrativeSubActionType;
  /** Sent as the `tracking.triggerType` body field, for the service's usage tracking. */
  triggerType?: DashboardNarrativeTriggerType;
};

/**
 * Request body fields every dashboard narrative route shares, as the service reads them.
 * @internal
 */
export type DashboardNarrativeRequestBody = {
  cacheOnly?: true;
  tracking?: {
    subActionType?: DashboardNarrativeSubActionType;
    triggerType?: DashboardNarrativeTriggerType;
  };
};

/**
 * Options of {@link getDashboardNarrativeByDashboardId}.
 * @internal
 */
export type DashboardNarrativeByIdOptions = DashboardNarrativeRequestOptions & {
  /**
   * The dashboard is open in shared mode (co-authoring): its shared copy is the one to narrate.
   * Sent as the `sharedMode=true` query parameter, and only when true.
   */
  sharedMode?: boolean;
  /**
   * The dashboard is open through Admin Access (an admin viewing a dashboard not shared with them).
   * Sent as the `adminAccess=true` query parameter, and only when true.
   */
  adminAccess?: boolean;
  /**
   * Whether the dashboard's active filters are merged into each widget's query. The service
   * merges them by default; sent as the `includeFilters=false` query parameter, and only when false.
   */
  includeFilters?: boolean;
};

/**
 * Sentiment of one insight as classified by the service.
 * @internal
 */
export type DashboardNarrativeInsightStatusDto = 'positive' | 'negative' | 'neutral';

/**
 * One insight of the wire response.
 * @internal
 */
export type DashboardNarrativeInsightDto = {
  /** Insight sentence, markdown bold only. */
  text: string;
  status: DashboardNarrativeInsightStatusDto;
};

/**
 * Wire response of every dashboard narrative route. Mapped into the UI view model by a single
 * transformer; nothing renders this type directly.
 * @internal
 */
export type DashboardNarrativeResponseDto = {
  /** Summary paragraph, markdown bold only. */
  overview: string;
  /** Zero or more insights — three by default. Empty for the low-density output. */
  insights: DashboardNarrativeInsightDto[];
  /** Which output path the service took; `none` for a cache-only miss. */
  density: 'low' | 'standard' | 'none';
  sourceType: string;
  /** `null` when the request carried no saved dashboard, as on the queries route. */
  sourceId: string | null;
  model: string;
  usage: { inputTokens: number; outputTokens: number };
  /** Trace id of the generation; `null` when the service reports none. */
  traceId: string | null;
  /**
   * ISO 8601 UTC timestamp of the generation; absent when the service does not report it, empty
   * for a cache-only miss.
   */
  generatedAt?: string;
  /** Widgets the service skipped as not narratable. */
  excludedWidgetIds: string[];
  /** Whether the narrative came from the service's cache. */
  cached?: boolean;
};

/**
 * Tells a cache-only miss from a narrative: the service answers a miss with an empty `overview`,
 * which a generated or cached narrative never has.
 * @param response - Response to a request made with `cacheOnly`.
 * @returns `true` when the cache held no narrative.
 * @internal
 */
export function isDashboardNarrativeCacheMiss(response: DashboardNarrativeResponseDto): boolean {
  return response.overview === '';
}

/**
 * HTTP statuses after which another attempt can succeed: any server-side failure (5xx). Every
 * other failure (disabled feature, bad input, missing access) is final — a retry would only
 * repeat it, so none is made.
 */
const FIRST_RETRYABLE_STATUS = 500;
const LAST_RETRYABLE_STATUS = 599;

function hasStatusProperty(obj: object): obj is object & { status: unknown } {
  return 'status' in obj;
}

/**
 * Tells whether a dashboard narrative request failure is worth retrying, based on the HTTP status
 * carried by the rest client's error.
 * @param error - Rejection of {@link getDashboardNarrative}.
 * @returns `true` for every 5xx status; `false` for every other status and for non-HTTP errors.
 * @internal
 */
export function isRetryableDashboardNarrativeError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !hasStatusProperty(error)) return false;
  if (typeof error.status !== 'string') return false;
  const status = Number(error.status);
  return status >= FIRST_RETRYABLE_STATUS && status <= LAST_RETRYABLE_STATUS;
}

function withQueryBy(query: DashboardNarrativeQuery): DashboardNarrativeQuery {
  return { ...query, jaql: { ...query.jaql, by: NARRATIVE_BY_CSDK } };
}

/**
 * The body fields every dashboard narrative route shares, each sent only when set. The usage
 * tracking fields go under `tracking`, where the service reads them.
 * @param options - Request options.
 * @returns The fields to merge into the request body.
 */
function toRequestFields(options: DashboardNarrativeRequestOptions): DashboardNarrativeRequestBody {
  const tracking = {
    ...(options.subActionType && { subActionType: options.subActionType }),
    ...(options.triggerType && { triggerType: options.triggerType }),
  };
  return {
    ...(options.cacheOnly && { cacheOnly: true }),
    ...(Object.keys(tracking).length > 0 && { tracking }),
  };
}

/**
 * Requests a dashboard narrative for a set of widget queries.
 * @param httpClient - HttpClient instance.
 * @param request - Queries to narrate, at most {@link DASHBOARD_NARRATIVE_MAX_QUERIES}.
 * @returns Promise that resolves with the wire response, or `undefined` (same semantics as
 *   `HttpClient.post`).
 * @internal
 */
export function getDashboardNarrative(
  httpClient: HttpClient,
  request: DashboardNarrativeQueriesRequest,
): Promise<DashboardNarrativeResponseDto | undefined> {
  const payload: DashboardNarrativeQueriesRequest = {
    queries: request.queries.map(withQueryBy),
    ...toRequestFields(request),
  };
  return httpClient.post<DashboardNarrativeResponseDto>(
    DASHBOARD_NARRATIVE_QUERIES_ENDPOINT,
    payload,
  );
}

/**
 * Requests the narrative of a saved dashboard by its id.
 * @param httpClient - HttpClient instance.
 * @param dashboardId - Id of the saved dashboard.
 * @param options - Request options.
 * @returns Promise that resolves with the wire response, or `undefined` (same semantics as
 *   `HttpClient.post`).
 * @internal
 */
export function getDashboardNarrativeByDashboardId(
  httpClient: HttpClient,
  dashboardId: string,
  options: DashboardNarrativeByIdOptions = {},
): Promise<DashboardNarrativeResponseDto | undefined> {
  const params = new URLSearchParams();
  if (options.sharedMode) params.set('sharedMode', 'true');
  if (options.adminAccess) params.set('adminAccess', 'true');
  if (options.includeFilters === false) params.set('includeFilters', 'false');
  const query = params.toString();
  return httpClient.post<DashboardNarrativeResponseDto>(
    `${DASHBOARD_NARRATIVE_DASHBOARDS_ENDPOINT}/${encodeURIComponent(dashboardId)}${
      query ? `?${query}` : ''
    }`,
    toRequestFields(options),
  );
}
