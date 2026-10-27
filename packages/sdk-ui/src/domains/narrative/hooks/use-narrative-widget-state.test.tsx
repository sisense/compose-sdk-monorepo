import { measureFactory } from '@sisense/sdk-data';
import { act, renderHook, waitFor } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { server } from '@/__mocks__/msw';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import type { WidgetProps } from '@/domains/widgets/components/widget/types';
import {
  DASHBOARD_NARRATIVE_DASHBOARDS_ENDPOINT,
  DASHBOARD_NARRATIVE_QUERIES_ENDPOINT,
  type DashboardNarrativeQuery,
  type DashboardNarrativeRequestBody,
  type DashboardNarrativeResponseDto,
} from '@/infra/api/narrative/dashboard-narrative-endpoints.js';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';

import { NarrativeTestWrapper } from '../__test-helpers__/narrative-test-wrapper.js';
import {
  useNarrativeWidgetState,
  type UseNarrativeWidgetStateParams,
} from './use-narrative-widget-state.js';

const chart = (id: string): WidgetProps => ({
  widgetType: 'chart',
  id,
  title: `Revenue ${id}`,
  chartType: 'line',
  dataSource: 'Sample ECommerce',
  dataOptions: {
    category: [DM.Commerce.Date.Months],
    value: [measureFactory.sum(DM.Commerce.Revenue)],
  },
});

const text: WidgetProps = {
  widgetType: 'text',
  id: 't1',
  styleOptions: { html: '<p>hello</p>', bgColor: '#fff', vAlign: 'valign-middle' },
};

const narrativeBody: DashboardNarrativeResponseDto = {
  overview: 'Revenue grew **12%**.',
  insights: [{ text: 'Q4 led with **$1.2M**.', status: 'positive' }],
  density: 'standard',
  sourceType: 'dashboard',
  sourceId: null,
  model: 'test-model',
  usage: { inputTokens: 1, outputTokens: 2 },
  traceId: 'trace-1',
  generatedAt: '2026-09-10T08:00:00.000Z',
  excludedWidgetIds: [],
};

const phaseOneBody = { resolvedQueries: [], excludedWidgetIds: [] };

const cacheMissBody: DashboardNarrativeResponseDto = {
  overview: '',
  insights: [],
  density: 'none',
  sourceType: 'dashboard',
  sourceId: null,
  model: '',
  usage: { inputTokens: 0, outputTokens: 0 },
  traceId: null,
  generatedAt: '',
  excludedWidgetIds: [],
  cached: false,
};

type Respond = () => HttpResponse | Promise<HttpResponse>;

/** Body of a queries-route request as it goes on the wire. */
type WireRequest = DashboardNarrativeRequestBody & { queries: DashboardNarrativeQuery[] };

/** Generation requests; cache-only lookups are recorded in `lookups`. */
let requests: WireRequest[];
let lookups: WireRequest[];
let lookupResponse: Respond;

function respondWith(...responses: Respond[]) {
  server.use(
    http.post(`*/${DASHBOARD_NARRATIVE_QUERIES_ENDPOINT}`, async ({ request }) => {
      const body = (await request.json()) as WireRequest;
      if (body.cacheOnly) {
        lookups.push(body);
        return lookupResponse();
      }
      requests.push(body);
      const next = responses.length > 1 ? responses.shift() : responses[0];
      return next ? next() : HttpResponse.json(narrativeBody);
    }),
  );
}

const ok = () => HttpResponse.json(narrativeBody);
const slowOk = async () => {
  await delay(150);
  return ok();
};
const status = (code: number) => () => HttpResponse.json({ error: { code } }, { status: code });
const cacheMiss = () => HttpResponse.json(cacheMissBody);
const cacheHit = () => HttpResponse.json({ ...narrativeBody, cached: true });

async function renderNarrative(params: UseNarrativeWidgetStateParams) {
  const rendered = renderHook(
    (p: UseNarrativeWidgetStateParams) => ({
      ...useNarrativeWidgetState(p),
      isInitialized: useSisenseContext().isInitialized,
    }),
    { wrapper: NarrativeTestWrapper, initialProps: params },
  );
  await waitFor(() => expect(rendered.result.current.isInitialized).toBe(true));
  return rendered;
}

describe('useNarrativeWidgetState', () => {
  beforeEach(() => {
    requests = [];
    lookups = [];
    lookupResponse = cacheMiss;
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('settles idle after a cache miss on mount', async () => {
    respondWith(ok);
    const { result } = await renderNarrative({ widgets: [chart('c1')] });

    await waitFor(() => expect(lookups).toHaveLength(1));
    await waitFor(() => expect(result.current.state).toEqual({ status: 'idle' }));
    expect(requests).toHaveLength(0);
  });

  it('reports no-data without a request when no widget yields a query', async () => {
    respondWith(ok);
    const { result } = await renderNarrative({ widgets: [text] });

    act(() => result.current.generate());

    expect(result.current.state).toEqual({ status: 'error', kind: 'no-data' });
    expect(requests).toHaveLength(0);
  });

  it('goes loading, then ready with the mapped narrative', async () => {
    respondWith(slowOk);
    const { result } = await renderNarrative({ widgets: [text, chart('c1')] });

    act(() => result.current.generate());

    await waitFor(() => expect(result.current.state).toEqual({ status: 'loading' }));
    await waitFor(() => expect(result.current.state.status).toBe('ready'));
    expect(result.current.state).toEqual({
      status: 'ready',
      data: {
        overview: 'Revenue grew **12%**.',
        insights: [{ text: 'Q4 led with **$1.2M**.', status: 'positive' }],
        generatedAt: '2026-09-10T08:00:00.000Z',
        copyText: 'Revenue grew **12%**.\n\n🟢 Q4 led with **$1.2M**.',
      },
    });
    expect(requests).toHaveLength(1);
    expect(requests[0].queries).toHaveLength(1);
    expect(requests[0].queries[0]).toMatchObject({
      title: 'Revenue c1',
      chartType: 'line',
      jaql: { by: 'ComposeSDK' },
    });
  });

  it('sends at most fifty queries', async () => {
    respondWith(ok);
    const widgets = Array.from({ length: 60 }, (_, i) => chart(`c${i}`));
    const { result } = await renderNarrative({ widgets });

    act(() => result.current.generate());

    await waitFor(() => expect(result.current.state.status).toBe('ready'));
    expect(requests[0].queries).toHaveLength(50);
    expect(requests[0].queries[49].title).toBe('Revenue c49');
  });

  it('fails without retrying on 422', async () => {
    respondWith(status(422));
    const { result } = await renderNarrative({ widgets: [chart('c1')] });

    act(() => result.current.generate());

    await waitFor(() => expect(result.current.state).toEqual({ status: 'error', kind: 'failed' }));
    expect(requests).toHaveLength(1);
  });

  it('retries once on 503 and succeeds', async () => {
    respondWith(status(503), ok);
    const { result } = await renderNarrative({ widgets: [chart('c1')] });

    act(() => result.current.generate());

    await waitFor(() => expect(result.current.state.status).toBe('ready'), { timeout: 4000 });
    expect(requests).toHaveLength(2);
  });

  it('fails after the single retry when 503 persists', async () => {
    respondWith(status(503));
    const { result } = await renderNarrative({ widgets: [chart('c1')] });

    act(() => result.current.generate());

    await waitFor(() => expect(result.current.state).toEqual({ status: 'error', kind: 'failed' }), {
      timeout: 4000,
    });
    expect(requests).toHaveLength(2);
  });

  it('fails when the body is not a narrative', async () => {
    respondWith(() => HttpResponse.json(phaseOneBody));
    const { result } = await renderNarrative({ widgets: [chart('c1')] });

    act(() => result.current.generate());

    await waitFor(() => expect(result.current.state).toEqual({ status: 'error', kind: 'failed' }));
  });

  it('shows no-data when every widget returned no data', async () => {
    respondWith(() => HttpResponse.json({ ...cacheMissBody, excludedWidgetIds: ['c1'] }));
    const { result } = await renderNarrative({ widgets: [chart('c1')] });

    act(() => result.current.generate());

    await waitFor(() => expect(result.current.state).toEqual({ status: 'error', kind: 'no-data' }));
  });

  it('generates once on mount with generateOnMount, without a generate call', async () => {
    respondWith(ok);
    const { result, rerender } = await renderNarrative({
      widgets: [chart('c1')],
      generateOnMount: true,
    });

    await waitFor(() => expect(result.current.state.status).toBe('ready'));
    rerender({ widgets: [chart('c1')], generateOnMount: true });

    expect(requests).toHaveLength(1);
  });

  describe('cache lookup on mount', () => {
    it('sends the queries once with cacheOnly, loading meanwhile', async () => {
      lookupResponse = async () => {
        await delay(150);
        return cacheMiss();
      };
      respondWith(ok);
      const { result, rerender } = await renderNarrative({ widgets: [chart('c1')] });

      await waitFor(() => expect(result.current.state).toEqual({ status: 'loading' }));
      await waitFor(() => expect(result.current.state).toEqual({ status: 'idle' }));
      rerender({ widgets: [chart('c1')] });

      expect(lookups).toHaveLength(1);
      expect(lookups[0]).toMatchObject({ cacheOnly: true, queries: [{ title: 'Revenue c1' }] });
    });

    it('is loading from the first render until the lookup settles, never idle', async () => {
      lookupResponse = cacheHit;
      respondWith(ok);
      const seen: string[] = [];
      renderHook(
        () => {
          const { state } = useNarrativeWidgetState({ widgets: [chart('c1')] });
          if (seen[seen.length - 1] !== state.status) seen.push(state.status);
          return state;
        },
        { wrapper: NarrativeTestWrapper },
      );

      await waitFor(() => expect(seen[seen.length - 1]).toBe('ready'));
      expect(seen).toEqual(['loading', 'ready']);
    });

    it('shows a cached narrative as ready', async () => {
      lookupResponse = cacheHit;
      respondWith(ok);
      const { result } = await renderNarrative({ widgets: [chart('c1')] });

      await waitFor(() => expect(result.current.state.status).toBe('ready'));
      expect(result.current.state).toMatchObject({
        data: { overview: 'Revenue grew **12%**.' },
      });
      expect(requests).toHaveLength(0);
    });

    it('settles idle, not failed, when the lookup fails', async () => {
      lookupResponse = status(422);
      respondWith(ok);
      const { result } = await renderNarrative({ widgets: [chart('c1')] });

      await waitFor(() => expect(lookups).toHaveLength(1));
      await waitFor(() => expect(result.current.state).toEqual({ status: 'idle' }));
    });

    it('settles idle when the lookup body is not a narrative', async () => {
      lookupResponse = () => HttpResponse.json(phaseOneBody);
      respondWith(ok);
      const { result } = await renderNarrative({ widgets: [chart('c1')] });

      await waitFor(() => expect(lookups).toHaveLength(1));
      await waitFor(() => expect(result.current.state).toEqual({ status: 'idle' }));
    });

    it('makes no request when no widget yields a query', async () => {
      respondWith(ok);
      const { result } = await renderNarrative({ widgets: [text] });

      expect(result.current.state).toEqual({ status: 'idle' });
      expect(lookups).toHaveLength(0);
    });

    it('does not look the cache up with generateOnMount', async () => {
      respondWith(ok);
      const { result } = await renderNarrative({ widgets: [chart('c1')], generateOnMount: true });

      await waitFor(() => expect(result.current.state.status).toBe('ready'));
      expect(lookups).toHaveLength(0);
      expect(requests).toHaveLength(1);
      expect(requests[0].cacheOnly).toBeUndefined();
    });

    it('generates on click after a miss, without cacheOnly', async () => {
      respondWith(ok);
      const { result } = await renderNarrative({ widgets: [chart('c1')] });
      await waitFor(() => expect(lookups).toHaveLength(1));
      await waitFor(() => expect(result.current.state).toEqual({ status: 'idle' }));

      act(() => result.current.generate());

      await waitFor(() => expect(result.current.state.status).toBe('ready'));
      expect(requests).toHaveLength(1);
      expect(requests[0].cacheOnly).toBeUndefined();
    });
  });

  describe('usage-tracking fields', () => {
    it('marks the first click as generate from the widget button, and the lookup as neither', async () => {
      respondWith(ok);
      const { result } = await renderNarrative({ widgets: [chart('c1')] });
      await waitFor(() => expect(result.current.state).toEqual({ status: 'idle' }));

      act(() => result.current.generate());

      await waitFor(() => expect(result.current.state.status).toBe('ready'));
      expect(requests[0]).toMatchObject({
        tracking: { subActionType: 'generate', triggerType: 'widgetButton' },
      });
      expect(lookups[0]).not.toHaveProperty('tracking');
    });

    it('marks a click after a narrative was shown as regenerate', async () => {
      respondWith(ok);
      const { result } = await renderNarrative({ widgets: [chart('c1')] });
      await waitFor(() => expect(result.current.state).toEqual({ status: 'idle' }));
      act(() => result.current.generate());
      await waitFor(() => expect(result.current.state.status).toBe('ready'));

      act(() => result.current.generate());

      await waitFor(() => expect(requests).toHaveLength(2));
      expect(requests[1]).toMatchObject({
        tracking: { subActionType: 'regenerate', triggerType: 'widgetButton' },
      });
    });

    it('marks a click on a cached narrative as regenerate', async () => {
      lookupResponse = cacheHit;
      respondWith(ok);
      const { result } = await renderNarrative({ widgets: [chart('c1')] });
      await waitFor(() => expect(result.current.state.status).toBe('ready'));

      act(() => result.current.generate());

      await waitFor(() => expect(requests).toHaveLength(1));
      expect(requests[0]).toMatchObject({ tracking: { subActionType: 'regenerate' } });
    });

    it('keeps a retry after a failed regenerate as regenerate', async () => {
      respondWith(ok, status(422), ok);
      const { result } = await renderNarrative({ widgets: [chart('c1')] });
      await waitFor(() => expect(result.current.state).toEqual({ status: 'idle' }));
      act(() => result.current.generate());
      await waitFor(() => expect(result.current.state.status).toBe('ready'));
      act(() => result.current.generate());
      await waitFor(() =>
        expect(result.current.state).toEqual({ status: 'error', kind: 'failed' }),
      );

      act(() => result.current.generate());

      await waitFor(() => expect(requests).toHaveLength(3));
      expect(requests[2]).toMatchObject({ tracking: { subActionType: 'regenerate' } });
    });

    it('marks a generation on mount as generate, triggered by an export', async () => {
      respondWith(ok);
      const { result } = await renderNarrative({ widgets: [chart('c1')], generateOnMount: true });

      await waitFor(() => expect(result.current.state.status).toBe('ready'));
      expect(requests[0]).toEqual(
        expect.objectContaining({ tracking: { subActionType: 'generate', triggerType: 'export' } }),
      );
    });

    it('reports the trigger the host names for a generation on mount', async () => {
      respondWith(ok);
      const { result } = await renderNarrative({
        widgets: [chart('c1')],
        generateOnMount: true,
        generateOnMountTriggerType: 'assistantCard',
      });

      await waitFor(() => expect(result.current.state.status).toBe('ready'));
      expect(requests[0]).toMatchObject({
        tracking: { subActionType: 'generate', triggerType: 'assistantCard' },
      });
    });

    it('keeps a click as the widget button, whatever the trigger on mount', async () => {
      respondWith(ok);
      const { result } = await renderNarrative({
        widgets: [chart('c1')],
        generateOnMountTriggerType: 'assistantCard',
      });
      await waitFor(() => expect(result.current.state).toEqual({ status: 'idle' }));

      act(() => result.current.generate());

      await waitFor(() => expect(result.current.state.status).toBe('ready'));
      expect(requests[0]).toMatchObject({ tracking: { triggerType: 'widgetButton' } });
    });
  });

  describe('with a dashboardId', () => {
    type DashboardRequest = { dashboardId: string; body: unknown };
    /** Generation requests; cache-only lookups are recorded in `dashboardLookups`. */
    let dashboardRequests: DashboardRequest[];
    let dashboardLookups: DashboardRequest[];

    function respondToDashboardWith(response: Respond) {
      server.use(
        http.post(
          `*/${DASHBOARD_NARRATIVE_DASHBOARDS_ENDPOINT}/:dashboardId`,
          async ({ request, params }) => {
            const body = (await request.json()) as { cacheOnly?: boolean };
            const entry = { dashboardId: String(params.dashboardId), body };
            if (body.cacheOnly) {
              dashboardLookups.push(entry);
              return lookupResponse();
            }
            dashboardRequests.push(entry);
            return response();
          },
        ),
      );
    }

    beforeEach(() => {
      dashboardRequests = [];
      dashboardLookups = [];
    });

    it('looks the dashboard up by id with cacheOnly on mount', async () => {
      lookupResponse = cacheHit;
      respondWith(ok);
      respondToDashboardWith(ok);
      const { result } = await renderNarrative({ dashboardId: 'd1', widgets: [chart('c1')] });

      await waitFor(() => expect(result.current.state.status).toBe('ready'));
      expect(dashboardLookups).toEqual([{ dashboardId: 'd1', body: { cacheOnly: true } }]);
      expect(dashboardRequests).toHaveLength(0);
      expect(lookups).toHaveLength(0);
    });

    it('sends sharedMode=true on the lookup and the generation in shared mode', async () => {
      const sharedModeParams: string[] = [];
      server.use(
        http.post(`*/${DASHBOARD_NARRATIVE_DASHBOARDS_ENDPOINT}/:dashboardId`, ({ request }) => {
          sharedModeParams.push(new URL(request.url).searchParams.get('sharedMode') ?? 'absent');
          return HttpResponse.json(narrativeBody);
        }),
      );
      const { result } = await renderNarrative({ dashboardId: 'd1', sharedMode: true });
      await waitFor(() => expect(result.current.state.status).toBe('ready'));

      act(() => result.current.generate());

      await waitFor(() => expect(sharedModeParams).toHaveLength(2));
      expect(sharedModeParams).toEqual(['true', 'true']);
    });

    it('sends adminAccess=true on the lookup and the generation in admin access', async () => {
      const adminAccessParams: string[] = [];
      server.use(
        http.post(`*/${DASHBOARD_NARRATIVE_DASHBOARDS_ENDPOINT}/:dashboardId`, ({ request }) => {
          adminAccessParams.push(new URL(request.url).searchParams.get('adminAccess') ?? 'absent');
          return HttpResponse.json(narrativeBody);
        }),
      );
      const { result } = await renderNarrative({ dashboardId: 'd1', adminAccess: true });
      await waitFor(() => expect(result.current.state.status).toBe('ready'));

      act(() => result.current.generate());

      await waitFor(() => expect(adminAccessParams).toHaveLength(2));
      expect(adminAccessParams).toEqual(['true', 'true']);
    });

    it('settles idle after a dashboard cache miss', async () => {
      respondToDashboardWith(ok);
      const { result } = await renderNarrative({ dashboardId: 'd1' });

      await waitFor(() => expect(dashboardLookups).toHaveLength(1));
      await waitFor(() => expect(result.current.state).toEqual({ status: 'idle' }));
      expect(dashboardRequests).toHaveLength(0);
    });

    it('requests the dashboard by id and does not send the queries', async () => {
      respondWith(ok);
      respondToDashboardWith(slowOk);
      const { result } = await renderNarrative({ dashboardId: 'd1', widgets: [chart('c1')] });

      act(() => result.current.generate());

      await waitFor(() => expect(result.current.state).toEqual({ status: 'loading' }));
      await waitFor(() => expect(result.current.state.status).toBe('ready'));
      expect(dashboardRequests).toEqual([
        {
          dashboardId: 'd1',
          body: { tracking: { subActionType: 'generate', triggerType: 'widgetButton' } },
        },
      ]);
      expect(requests).toHaveLength(0);
    });

    it('requests the dashboard even when no widget yields a query', async () => {
      respondToDashboardWith(ok);
      const { result } = await renderNarrative({ dashboardId: 'd1', widgets: [text] });

      act(() => result.current.generate());

      await waitFor(() => expect(result.current.state.status).toBe('ready'));
      expect(dashboardRequests).toHaveLength(1);
    });

    it('retries once on 503 and fails when it persists', async () => {
      respondToDashboardWith(status(503));
      const { result } = await renderNarrative({ dashboardId: 'd1' });

      act(() => result.current.generate());

      await waitFor(
        () => expect(result.current.state).toEqual({ status: 'error', kind: 'failed' }),
        {
          timeout: 4000,
        },
      );
      expect(dashboardRequests).toHaveLength(2);
    });

    it('generates once on mount with generateOnMount', async () => {
      respondToDashboardWith(ok);
      const { result } = await renderNarrative({ dashboardId: 'd1', generateOnMount: true });

      await waitFor(() => expect(result.current.state.status).toBe('ready'));
      expect(dashboardRequests).toHaveLength(1);
    });

    it('falls back to the queries for an empty id', async () => {
      respondWith(ok);
      respondToDashboardWith(ok);
      const { result } = await renderNarrative({ dashboardId: '', widgets: [chart('c1')] });

      act(() => result.current.generate());

      await waitFor(() => expect(result.current.state.status).toBe('ready'));
      expect(requests).toHaveLength(1);
      expect(dashboardRequests).toHaveLength(0);
    });
  });
});
