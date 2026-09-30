import type { HttpClient } from '@sisense/sdk-rest-client';

import {
  DASHBOARD_NARRATIVE_DASHBOARDS_ENDPOINT,
  DASHBOARD_NARRATIVE_QUERIES_ENDPOINT,
  type DashboardNarrativeQueriesRequest,
  type DashboardNarrativeResponseDto,
  getDashboardNarrative,
  getDashboardNarrativeByDashboardId,
  isDashboardNarrativeCacheMiss,
  isRetryableDashboardNarrativeError,
} from './dashboard-narrative-endpoints.js';
import { NARRATIVE_BY_CSDK } from './narrative-constants.js';

const response: DashboardNarrativeResponseDto = {
  overview: 'Admissions grew **12%**.',
  insights: [{ text: 'Cardiology leads with **312** admissions.', status: 'positive' }],
  density: 'standard',
  sourceType: 'dashboard',
  sourceId: null,
  model: 'test-model',
  usage: { inputTokens: 10, outputTokens: 20 },
  traceId: 'trace-1',
  generatedAt: '2026-09-10T08:00:00.000Z',
  excludedWidgetIds: [],
};

const request: DashboardNarrativeQueriesRequest = {
  queries: [
    {
      title: 'Admissions by diagnosis',
      chartType: 'column',
      jaql: { datasource: { title: 'Sample Healthcare' }, metadata: [] },
    },
    { jaql: { datasource: { title: 'Sample Healthcare' }, metadata: [] } },
  ],
};

describe('getDashboardNarrative', () => {
  it('posts every query to the queries endpoint with jaql.by set', async () => {
    const post = vi.fn().mockResolvedValue(response);
    const httpClient = { post } as unknown as HttpClient;

    await getDashboardNarrative(httpClient, request);

    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith(DASHBOARD_NARRATIVE_QUERIES_ENDPOINT, {
      queries: request.queries.map((query) => ({
        ...query,
        jaql: { ...query.jaql, by: NARRATIVE_BY_CSDK },
      })),
    });
  });

  it('sends cacheOnly only when it is set', async () => {
    const post = vi.fn().mockResolvedValue(response);
    const httpClient = { post } as unknown as HttpClient;

    await getDashboardNarrative(httpClient, { ...request, cacheOnly: true });
    await getDashboardNarrative(httpClient, { ...request, cacheOnly: false });

    expect(post.mock.calls[0][1]).toMatchObject({ cacheOnly: true });
    expect(post.mock.calls[1][1]).not.toHaveProperty('cacheOnly');
  });

  it('does not mutate the caller request', async () => {
    const post = vi.fn().mockResolvedValue(response);
    const httpClient = { post } as unknown as HttpClient;

    await getDashboardNarrative(httpClient, request);

    expect(request.queries[0].jaql).not.toHaveProperty('by');
  });

  it('resolves with the wire response', async () => {
    const post = vi.fn().mockResolvedValue(response);
    const httpClient = { post } as unknown as HttpClient;

    await expect(getDashboardNarrative(httpClient, request)).resolves.toBe(response);
  });

  it('propagates the rest client rejection', async () => {
    const error = { status: '422' };
    const post = vi.fn().mockRejectedValue(error);
    const httpClient = { post } as unknown as HttpClient;

    await expect(getDashboardNarrative(httpClient, request)).rejects.toBe(error);
  });
});

describe('getDashboardNarrativeByDashboardId', () => {
  it('posts an empty body to the dashboards endpoint under the encoded id', async () => {
    const post = vi.fn().mockResolvedValue(response);
    const httpClient = { post } as unknown as HttpClient;

    await getDashboardNarrativeByDashboardId(httpClient, 'dash/1 a');

    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith(
      `${DASHBOARD_NARRATIVE_DASHBOARDS_ENDPOINT}/dash%2F1%20a`,
      {},
    );
  });

  it('posts cacheOnly in the body when it is set', async () => {
    const post = vi.fn().mockResolvedValue(response);
    const httpClient = { post } as unknown as HttpClient;

    await getDashboardNarrativeByDashboardId(httpClient, 'd1', { cacheOnly: true });
    await getDashboardNarrativeByDashboardId(httpClient, 'd1', { cacheOnly: false });

    expect(post.mock.calls[0][1]).toEqual({ cacheOnly: true });
    expect(post.mock.calls[1][1]).toEqual({});
  });

  it('adds sharedMode=true to the query only in shared mode', async () => {
    const post = vi.fn().mockResolvedValue(response);
    const httpClient = { post } as unknown as HttpClient;

    await getDashboardNarrativeByDashboardId(httpClient, 'd1', {
      sharedMode: true,
      cacheOnly: true,
    });
    await getDashboardNarrativeByDashboardId(httpClient, 'd1', { sharedMode: false });

    expect(post.mock.calls[0]).toEqual([
      `${DASHBOARD_NARRATIVE_DASHBOARDS_ENDPOINT}/d1?sharedMode=true`,
      { cacheOnly: true },
    ]);
    expect(post.mock.calls[1][0]).toBe(`${DASHBOARD_NARRATIVE_DASHBOARDS_ENDPOINT}/d1`);
  });

  it('adds adminAccess=true to the query only in admin access', async () => {
    const post = vi.fn().mockResolvedValue(response);
    const httpClient = { post } as unknown as HttpClient;

    await getDashboardNarrativeByDashboardId(httpClient, 'd1', { adminAccess: true });
    await getDashboardNarrativeByDashboardId(httpClient, 'd1', {
      adminAccess: true,
      sharedMode: true,
    });
    await getDashboardNarrativeByDashboardId(httpClient, 'd1', { adminAccess: false });

    expect(post.mock.calls[0][0]).toBe(
      `${DASHBOARD_NARRATIVE_DASHBOARDS_ENDPOINT}/d1?adminAccess=true`,
    );
    expect(post.mock.calls[1][0]).toBe(
      `${DASHBOARD_NARRATIVE_DASHBOARDS_ENDPOINT}/d1?sharedMode=true&adminAccess=true`,
    );
    expect(post.mock.calls[2][0]).toBe(`${DASHBOARD_NARRATIVE_DASHBOARDS_ENDPOINT}/d1`);
  });

  it('resolves with the wire response', async () => {
    const post = vi.fn().mockResolvedValue(response);
    const httpClient = { post } as unknown as HttpClient;

    await expect(getDashboardNarrativeByDashboardId(httpClient, 'd1')).resolves.toBe(response);
  });

  it('propagates the rest client rejection', async () => {
    const error = { status: '404' };
    const post = vi.fn().mockRejectedValue(error);
    const httpClient = { post } as unknown as HttpClient;

    await expect(getDashboardNarrativeByDashboardId(httpClient, 'd1')).rejects.toBe(error);
  });
});

describe('isRetryableDashboardNarrativeError', () => {
  it.each(['500', '502', '503', '504', '599'])('is true for status %s', (status) => {
    expect(isRetryableDashboardNarrativeError({ status })).toBe(true);
  });

  it.each(['400', '403', '422', '429', '499', '600'])('is false for status %s', (status) => {
    expect(isRetryableDashboardNarrativeError({ status })).toBe(false);
  });

  it('is false for a numeric status, a plain Error, null and undefined', () => {
    expect(isRetryableDashboardNarrativeError({ status: 503 })).toBe(false);
    expect(isRetryableDashboardNarrativeError(new Error('offline'))).toBe(false);
    expect(isRetryableDashboardNarrativeError(null)).toBe(false);
    expect(isRetryableDashboardNarrativeError(undefined)).toBe(false);
  });
});

describe('isDashboardNarrativeCacheMiss', () => {
  it('is true for the empty narrative of a cache-only miss', () => {
    expect(
      isDashboardNarrativeCacheMiss({
        ...response,
        overview: '',
        insights: [],
        density: 'none',
        generatedAt: '',
        cached: false,
      }),
    ).toBe(true);
  });

  it('is false for a cached or a generated narrative', () => {
    expect(isDashboardNarrativeCacheMiss({ ...response, cached: true })).toBe(false);
    expect(isDashboardNarrativeCacheMiss({ ...response, cached: false })).toBe(false);
  });
});
