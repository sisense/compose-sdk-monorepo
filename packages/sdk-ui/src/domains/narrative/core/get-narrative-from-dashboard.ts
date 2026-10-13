import type { Filter } from '@sisense/sdk-data';
import type { HttpClient } from '@sisense/sdk-rest-client';

import { prepareCommonFiltersConnectionProps } from '@/domains/dashboarding/common-filters/common-filters-connector.js';
import { connectWidgetFilters } from '@/domains/dashboarding/common-filters/use-convert-filter-relations.js';
import { getWidgetDataOptionsWithDrilldown } from '@/domains/dashboarding/common-filters/utils.js';
import type { DashboardProps } from '@/domains/dashboarding/types.js';
import {
  getInternalWidgetType,
  isChartWidgetProps,
  isPivotTableWidgetProps,
} from '@/domains/widgets/components/widget-by-id/utils.js';
import type { WidgetProps } from '@/domains/widgets/components/widget/types';
import {
  DASHBOARD_NARRATIVE_MAX_QUERIES,
  type DashboardNarrativeByIdOptions,
  type DashboardNarrativeQuery,
  type DashboardNarrativeRequestOptions,
  type DashboardNarrativeTriggerType,
  getDashboardNarrative,
  getDashboardNarrativeByDashboardId,
  isRetryableDashboardNarrativeError,
} from '@/infra/api/narrative/dashboard-narrative-endpoints.js';
import { i18nextInstance } from '@/infra/translation/initialize-i18n.js';
import {
  type FilterRelationsRules,
  splitFiltersAndRelations,
} from '@/shared/utils/filter-relations.js';

import type { NarrativeData } from '../components/narrative/types.js';
import { buildDashboardNarrativeQueries } from './build-dashboard-narrative-queries.js';
import { isDashboardNarrativeResponse, toNarrativeData } from './to-narrative-data.js';
import { getNarrativeSiblings } from './with-narrative-siblings.js';

type DashboardForNarrative = Pick<
  DashboardProps,
  'widgets' | 'filters' | 'widgetsOptions' | 'layoutOptions' | 'defaultDataSource'
>;

/**
 * Options of {@link getNarrativeFromDashboard}.
 * @sisenseInternal
 */
export type GetNarrativeFromDashboardOptions = {
  /**
   * Whether the dashboard filters are applied to each widget's query, as the dashboard applies
   * them when it renders. Defaults to `true`.
   */
  includeFilters?: boolean;
  /** The control that asked for the narrative, for the service's usage tracking. */
  triggerType?: DashboardNarrativeTriggerType;
};

/**
 * Why {@link getNarrativeFromDashboard} produced no narrative, besides a failed request:
 * - `no-data`: no widget yields a query, or the widgets returned no data.
 * - `invalid-response`: the service answered with something that is not a narrative.
 * @internal
 */
export type NarrativeFromDashboardErrorCode = 'no-data' | 'invalid-response';

function narrativeError(code: NarrativeFromDashboardErrorCode, message: string) {
  return Object.assign(new Error(message), { code });
}

/**
 * Tells whether a failure of {@link requestDashboardNarrative} means there was no data to narrate.
 * @param error - The rejection.
 * @returns `true` for a `'no-data'` error.
 * @internal
 */
export function isNoDataNarrativeError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'no-data';
}

// The filters are only read: a change they would request has nowhere to go.
const noop = () => {};

/**
 * Applies the dashboard filters to one widget the way the rendered dashboard does: the filters
 * the widget does not ignore become slice filters merged with its own, filters on an attribute the
 * widget itself selects by stay highlights and are not applied, and the relations among the
 * dashboard filters carry over, as do the widget's own relations.
 * @param widget - Chart or pivot widget.
 * @param filters - Dashboard filters.
 * @param relations - Relations among the dashboard filters, if any.
 * @param dashboard - Dashboard holding the per-widget filter options.
 * @returns The widget with the dashboard filters merged into its own.
 */
function withDashboardFilters(
  widget: WidgetProps,
  filters: Filter[],
  relations: FilterRelationsRules | null,
  dashboard: Pick<DashboardForNarrative, 'widgetsOptions'>,
): WidgetProps {
  if (!isChartWidgetProps(widget) && !isPivotTableWidgetProps(widget)) return widget;
  const { filters: sliceFilters } = prepareCommonFiltersConnectionProps(
    filters,
    noop,
    getInternalWidgetType(widget),
    getWidgetDataOptionsWithDrilldown(widget),
    dashboard.widgetsOptions?.[widget.id]?.filtersOptions ?? {},
    i18nextInstance.t,
  );
  return {
    ...widget,
    filters: connectWidgetFilters(filters, relations, sliceFilters, widget.filters),
  };
}

/**
 * Builds the queries of a dashboard that is not saved — the same queries a narrative widget placed
 * on it sends: one per non-narrative widget visible in the layout, in layout order, or per
 * non-narrative widget, in list order, when there is no layout.
 * @param dashboard - Dashboard props.
 * @param includeFilters - Whether the dashboard filters apply.
 * @returns Queries, not yet capped, and how many chart and pivot widgets yield none.
 */
function buildQueries(
  dashboard: DashboardForNarrative,
  includeFilters: boolean,
): { queries: DashboardNarrativeQuery[]; omittedWidgetCount: number } {
  const described = getNarrativeSiblings(dashboard.widgets, dashboard.layoutOptions?.widgetsPanel);

  const { filters, relations } =
    !includeFilters || !dashboard.filters
      ? { filters: [], relations: null }
      : splitFiltersAndRelations(dashboard.filters);
  const connected = filters.length
    ? described.map((widget) => withDashboardFilters(widget, filters, relations, dashboard))
    : described;

  const queries = buildDashboardNarrativeQueries(connected, dashboard.defaultDataSource);
  // Text and other widgets without data are not narratable by design, so they are not counted.
  const narratableCount = connected.filter(
    (widget) => isChartWidgetProps(widget) || isPivotTableWidgetProps(widget),
  ).length;
  return { queries, omittedWidgetCount: narratableCount - queries.length };
}

/**
 * Generates the narrative of a dashboard: a saved one by its id, or one that is not saved by its
 * widgets' queries, at most {@link DASHBOARD_NARRATIVE_MAX_QUERIES} of them. A server-side failure
 * is retried once.
 * @param httpClient - HttpClient of the Sisense app.
 * @param source - The saved dashboard's id, or the props of a dashboard that is not saved. A
 *   widget of the latter with no `dataSource` of its own falls back to `dashboard.defaultDataSource`
 *   only — not to the app's default data source, as a narrative widget would — and is left out
 *   when the dashboard has none.
 * @param options - Filters and usage tracking.
 * @returns The narrative, and how many widgets it leaves out.
 * @throws The request error, with its HTTP `status`. Otherwise an `Error` with a `code`:
 *   `'no-data'` when no widget yields a query or the widgets returned no data,
 *   `'invalid-response'` when the response is not a narrative.
 * @example
 * ```ts
 * const { narrative, excludedWidgetCount } = await getNarrativeFromDashboard(
 *   app.httpClient,
 *   { dashboardId: 'dashboard-oid' },
 *   { includeFilters: false },
 * );
 * console.log(narrative.overview, narrative.insights);
 * ```
 * @group Generative AI
 * @sisenseInternal
 */
export async function getNarrativeFromDashboard(
  httpClient: HttpClient,
  source: { dashboardId: string } | { dashboard: DashboardForNarrative },
  options: GetNarrativeFromDashboardOptions = {},
): Promise<DashboardNarrativeResult> {
  const { includeFilters = true, triggerType } = options;
  const target =
    'dashboardId' in source
      ? { dashboardId: source.dashboardId, includeFilters }
      : buildQueries(source.dashboard, includeFilters);
  return requestDashboardNarrative(httpClient, target, { subActionType: 'generate', triggerType });
}

/**
 * A dashboard narrative and how many widgets it leaves out.
 * @sisenseInternal
 */
export type DashboardNarrativeResult = { narrative: NarrativeData; excludedWidgetCount: number };

/**
 * What {@link requestDashboardNarrative} narrates: a saved dashboard by its id, or widget queries.
 * @internal
 */
export type DashboardNarrativeTarget =
  | (Pick<DashboardNarrativeByIdOptions, 'sharedMode' | 'adminAccess' | 'includeFilters'> & {
      dashboardId: string;
    })
  | {
      queries: readonly DashboardNarrativeQuery[];
      /** Widgets the queries leave out, counted into `excludedWidgetCount`. */
      omittedWidgetCount?: number;
    };

/**
 * Requests a dashboard narrative — the one request path of {@link getNarrativeFromDashboard} and
 * the narrative widget. Sends at most {@link DASHBOARD_NARRATIVE_MAX_QUERIES} queries, retries a
 * server-side failure once and maps the response to the view model.
 * @param httpClient - HttpClient of the Sisense app.
 * @param target - The saved dashboard, or the widget queries, not yet capped.
 * @param options - Cache lookup and usage tracking.
 * @returns The narrative, and how many widgets it leaves out.
 * @throws The request error, with its HTTP `status`. Otherwise an `Error` with a `code`:
 *   `'no-data'` when there is no query, the widgets returned no data or — for a `cacheOnly`
 *   request — the cache holds no narrative; `'invalid-response'` when the response is not a
 *   narrative.
 * @internal
 */
export async function requestDashboardNarrative(
  httpClient: HttpClient,
  target: DashboardNarrativeTarget,
  options: DashboardNarrativeRequestOptions,
): Promise<DashboardNarrativeResult> {
  let request: () => Promise<unknown>;
  let skippedWidgetCount = 0;
  if ('dashboardId' in target) {
    const { dashboardId, ...byIdOptions } = target;
    request = () =>
      getDashboardNarrativeByDashboardId(httpClient, dashboardId, { ...byIdOptions, ...options });
  } else {
    if (target.queries.length === 0) {
      throw narrativeError('no-data', 'None of the dashboard widgets can be narrated');
    }
    const queries = target.queries.slice(0, DASHBOARD_NARRATIVE_MAX_QUERIES);
    skippedWidgetCount = (target.omittedWidgetCount ?? 0) + target.queries.length - queries.length;
    request = () => getDashboardNarrative(httpClient, { queries, ...options });
  }

  const response = await request().catch((error: unknown) => {
    if (!isRetryableDashboardNarrativeError(error)) throw error;
    return request();
  });
  if (!isDashboardNarrativeResponse(response)) {
    throw narrativeError('invalid-response', 'Invalid response from the dashboard narrative API');
  }
  // The service answers with an empty overview only when every widget returned no data, or — for
  // a cache-only request — when the cache holds no narrative.
  if (response.overview === '') {
    throw narrativeError('no-data', 'The dashboard widgets returned no data');
  }
  return {
    narrative: toNarrativeData(response),
    excludedWidgetCount: response.excludedWidgetIds.length + skippedWidgetCount,
  };
}
