import { filterFactory, type FilterRelations, measureFactory } from '@sisense/sdk-data';
import type { HttpClient } from '@sisense/sdk-rest-client';
import { describe, expect, it, vi } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import type { WidgetsPanelLayout } from '@/domains/dashboarding/dashboard-model/types.js';
import type { WidgetProps } from '@/domains/widgets/components/widget/types';
import {
  DASHBOARD_NARRATIVE_DASHBOARDS_ENDPOINT,
  DASHBOARD_NARRATIVE_MAX_QUERIES,
  type DashboardNarrativeQuery,
  type DashboardNarrativeResponseDto,
} from '@/infra/api/narrative/dashboard-narrative-endpoints.js';

import { getNarrativeFromDashboard } from './get-narrative-from-dashboard.js';

const response: DashboardNarrativeResponseDto = {
  overview: 'Revenue grew **12%**.',
  insights: [{ text: 'Q4 led with **$1.2M**.', status: 'positive' }],
  density: 'standard',
  sourceType: 'dashboard',
  sourceId: null,
  model: 'test-model',
  usage: { inputTokens: 1, outputTokens: 2 },
  traceId: 'trace-1',
  generatedAt: '2026-09-10T08:00:00.000Z',
  excludedWidgetIds: ['w9'],
};

const httpError = (status: string) => Object.assign(new Error(status), { status });

/** HttpClient whose `post` answers with the given results in turn, rejecting the errors. */
function client(...results: unknown[]) {
  const post = vi.fn();
  results.forEach((result) =>
    result instanceof Error
      ? post.mockRejectedValueOnce(result)
      : post.mockResolvedValueOnce(result),
  );
  return { post, httpClient: { post } as unknown as HttpClient };
}

type UnsavedDashboard = Extract<
  Parameters<typeof getNarrativeFromDashboard>[1],
  { dashboard: unknown }
>['dashboard'];

/** The queries sent for an unsaved dashboard. */
async function queriesFor(
  dashboard: UnsavedDashboard,
  options?: { includeFilters?: boolean },
): Promise<DashboardNarrativeQuery[]> {
  const { post, httpClient } = client(response);
  await getNarrativeFromDashboard(httpClient, { dashboard }, options);
  return post.mock.calls[0][1].queries;
}

const chart = (id: string, filters?: FilterRelations): WidgetProps => ({
  widgetType: 'chart',
  id,
  ...(filters && { filters }),
  title: `Chart ${id}`,
  chartType: 'column',
  dataSource: DM.DataSource,
  dataOptions: {
    category: [DM.Commerce.AgeRange],
    value: [measureFactory.sum(DM.Commerce.Revenue)],
  },
});
const narrative: WidgetProps = { widgetType: 'narrative', id: 'n1' };

const layout = (ids: (string | { id: string; hidden: true })[]): WidgetsPanelLayout => ({
  columns: [
    {
      widthPercentage: 100,
      rows: ids.map((entry) => ({
        cells:
          typeof entry === 'string'
            ? [{ widthPercentage: 100, widgetId: entry }]
            : [{ widthPercentage: 100, widgetId: entry.id, hidden: true }],
      })),
    },
  ],
});

const genderFilter = filterFactory.members(DM.Commerce.Gender, ['Female']);

type RelationNode =
  | { instanceid: string }
  | { operator: string; left: RelationNode; right: RelationNode };

/** The query's filter relations, with each filter shown by its dimension. */
function relationDims(query: {
  jaql: { metadata?: unknown[]; filterRelations?: unknown };
}): unknown {
  const dimById = new Map(
    (query.jaql.metadata ?? [])
      .map((item) => item as { instanceid?: string; jaql?: { dim?: string } })
      .map((item) => [item.instanceid, item.jaql?.dim]),
  );
  const toDims = (node: RelationNode): unknown =>
    'instanceid' in node
      ? dimById.get(node.instanceid)
      : { operator: node.operator, left: toDims(node.left), right: toDims(node.right) };
  return query.jaql.filterRelations && toDims(query.jaql.filterRelations as RelationNode);
}

/** Dimensions of the filters a query carries. */
function filterDims(query: { jaql: { metadata?: unknown[] } }): string[] {
  return (query.jaql.metadata ?? [])
    .map((item) => item as { panel?: string; jaql?: { dim?: string } })
    .filter((item) => item.panel === 'scope')
    .map((item) => item.jaql?.dim ?? '');
}

describe('getNarrativeFromDashboard', () => {
  it('describes the visible widgets in layout order, never a narrative widget', async () => {
    const queries = await queriesFor({
      widgets: [chart('c1'), narrative, chart('c2'), chart('c3')],
      layoutOptions: { widgetsPanel: layout(['n1', 'c3', { id: 'c2', hidden: true }, 'c1']) },
    });

    expect(queries.map((q) => q.title)).toEqual(['Chart c3', 'Chart c1']);
  });

  it('describes the non-narrative widgets in list order when the dashboard has no layout', async () => {
    const queries = await queriesFor({
      widgets: [chart('c1'), narrative, chart('c2')],
    });

    expect(queries.map((q) => q.title)).toEqual(['Chart c1', 'Chart c2']);
  });

  it('applies the dashboard filters to a widget query by default', async () => {
    const [query] = await queriesFor({
      widgets: [chart('c1')],
      filters: [genderFilter],
    });

    expect(filterDims(query)).toEqual(['[Commerce.Gender]']);
  });

  it('keeps the relations among the dashboard filters', async () => {
    const brandFilter = filterFactory.members(DM.Brand.Brand, ['Apple']);
    const [query] = await queriesFor({
      widgets: [chart('c1')],
      filters: filterFactory.logic.or(genderFilter, brandFilter),
    });

    expect(relationDims(query)).toEqual({
      operator: 'OR',
      left: '[Commerce.Gender]',
      right: '[Brand.Brand]',
    });
  });

  it('leaves the dashboard filters out when includeFilters is false', async () => {
    const [query] = await queriesFor(
      { widgets: [chart('c1')], filters: [genderFilter] },
      { includeFilters: false },
    );

    expect(filterDims(query)).toEqual([]);
  });

  it('does not apply a filter the widget ignores', async () => {
    const [query] = await queriesFor({
      widgets: [chart('c1')],
      filters: [genderFilter],
      widgetsOptions: { c1: { filtersOptions: { ignoreFilters: { all: true } } } },
    });

    expect(filterDims(query)).toEqual([]);
  });

  it('narrates a saved dashboard by id, tracked as a generation', async () => {
    const { post, httpClient } = client(response);

    const result = await getNarrativeFromDashboard(
      httpClient,
      { dashboardId: 'd1' },
      { includeFilters: false, triggerType: 'assistantCard' },
    );

    expect(post).toHaveBeenCalledWith(
      `${DASHBOARD_NARRATIVE_DASHBOARDS_ENDPOINT}/d1?includeFilters=false`,
      { tracking: { subActionType: 'generate', triggerType: 'assistantCard' } },
    );
    expect(result.narrative).toMatchObject({
      overview: response.overview,
      insights: response.insights,
    });
    expect(result.excludedWidgetCount).toBe(1);
  });

  it('sends at most the query cap and counts the widgets left out', async () => {
    const widgets = Array.from({ length: DASHBOARD_NARRATIVE_MAX_QUERIES + 2 }, (_, i) =>
      chart(`c${i}`),
    );
    const { post, httpClient } = client(response);

    const result = await getNarrativeFromDashboard(httpClient, { dashboard: { widgets } });

    expect(post.mock.calls[0][1].queries).toHaveLength(DASHBOARD_NARRATIVE_MAX_QUERIES);
    expect(result.excludedWidgetCount).toBe(3);
  });

  it('fails without a request when no widget can be narrated', async () => {
    const { post, httpClient } = client();

    await expect(
      getNarrativeFromDashboard(httpClient, { dashboard: { widgets: [narrative] } }),
    ).rejects.toMatchObject({
      code: 'no-data',
      message: 'None of the dashboard widgets can be narrated',
    });
    expect(post).not.toHaveBeenCalled();
  });

  it('leaves out a widget without a data source when the dashboard has no default one', async () => {
    const { post, httpClient } = client();
    const withoutDataSource = { ...chart('c1'), dataSource: undefined } as WidgetProps;

    await expect(
      getNarrativeFromDashboard(httpClient, {
        dashboard: { widgets: [withoutDataSource] },
      }),
    ).rejects.toMatchObject({ code: 'no-data' });
    expect(post).not.toHaveBeenCalled();
  });

  it('counts a chart without a query as excluded, but not a text widget', async () => {
    const withoutDataSource = { ...chart('c2'), dataSource: undefined } as WidgetProps;
    const text = {
      widgetType: 'text',
      id: 't1',
      styleOptions: { html: '<p>hi</p>', bgColor: '#fff', vAlign: 'valign-middle' },
    } as WidgetProps;
    const { post, httpClient } = client(response);

    const result = await getNarrativeFromDashboard(httpClient, {
      dashboard: { widgets: [chart('c1'), withoutDataSource, text] },
    });

    expect(post.mock.calls[0][1].queries).toHaveLength(1);
    // One left out here, plus the one the service reports in `excludedWidgetIds`.
    expect(result.excludedWidgetCount).toBe(2);
  });

  it('fails with no-data when the widgets returned no data', async () => {
    const { httpClient } = client({
      ...response,
      overview: '',
      insights: [],
      excludedWidgetIds: ['c1'],
    });

    await expect(
      getNarrativeFromDashboard(httpClient, { dashboard: { widgets: [chart('c1')] } }),
    ).rejects.toMatchObject({ code: 'no-data', message: 'The dashboard widgets returned no data' });
  });

  it('retries a server-side failure once', async () => {
    const { post, httpClient } = client(httpError('503'), response);

    await expect(
      getNarrativeFromDashboard(httpClient, { dashboardId: 'd1' }),
    ).resolves.toBeTruthy();
    expect(post).toHaveBeenCalledTimes(2);
  });

  it('rethrows any other failure as is, with its status', async () => {
    const error = httpError('429');
    const { post, httpClient } = client(error);

    await expect(getNarrativeFromDashboard(httpClient, { dashboardId: 'd1' })).rejects.toBe(error);
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('fails when the response is not a narrative', async () => {
    const { httpClient } = client({ resolvedQueries: [] });

    await expect(
      getNarrativeFromDashboard(httpClient, { dashboardId: 'd1' }),
    ).rejects.toMatchObject({
      code: 'invalid-response',
      message: 'Invalid response from the dashboard narrative API',
    });
  });
});
