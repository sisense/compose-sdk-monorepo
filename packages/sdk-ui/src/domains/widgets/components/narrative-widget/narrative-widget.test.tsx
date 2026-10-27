import { type ReactElement } from 'react';

import { measureFactory } from '@sisense/sdk-data';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as mockGlobals from '@/__mocks__/data/mock-globals.json';
import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { NarrativeTestWrapper } from '@/domains/narrative/__test-helpers__/narrative-test-wrapper';
import type { WidgetProps } from '@/domains/widgets/components/widget/types';
import {
  DASHBOARD_NARRATIVE_QUERIES_ENDPOINT,
  type DashboardNarrativeResponseDto,
} from '@/infra/api/narrative/dashboard-narrative-endpoints.js';
import { MenuProvider } from '@/infra/contexts/menu-provider/menu-provider';
import { SisenseContextProvider } from '@/infra/contexts/sisense-context/sisense-context-provider';

import { NarrativeWidget } from './narrative-widget.js';

const chart: WidgetProps = {
  widgetType: 'chart',
  id: 'c1',
  title: 'Revenue by month',
  chartType: 'line',
  dataSource: DM.DataSource,
  dataOptions: {
    category: [DM.Commerce.Date.Months],
    value: [measureFactory.sum(DM.Commerce.Revenue)],
  },
};

const narrativeBody: DashboardNarrativeResponseDto = {
  overview: 'Revenue grew **12%**.',
  insights: [
    { text: 'Q4 led with **$1.2M**.', status: 'positive' },
    { text: 'Returns rose to **4%**.', status: 'negative' },
  ],
  density: 'standard',
  sourceType: 'queries',
  sourceId: null,
  model: 'test-model',
  usage: { inputTokens: 1, outputTokens: 2 },
  traceId: null,
  generatedAt: '2026-09-10T08:00:00.000Z',
  excludedWidgetIds: [],
};

const cacheMissBody: DashboardNarrativeResponseDto = {
  ...narrativeBody,
  overview: '',
  insights: [],
  density: 'none',
  generatedAt: '',
  cached: false,
};

/** Generates on request; a cache-only lookup misses. */
function respondWithNarrative() {
  server.use(
    http.post(`*/${DASHBOARD_NARRATIVE_QUERIES_ENDPOINT}`, async ({ request }) => {
      const { cacheOnly } = (await request.json()) as { cacheOnly?: boolean };
      return HttpResponse.json(cacheOnly ? cacheMissBody : narrativeBody);
    }),
  );
}

/** The tenant holds the credit-based narrative entitlement instead of the unlimited one. */
function onCreditLicence() {
  server.use(
    http.get('*/api/globals', () =>
      HttpResponse.json({
        ...mockGlobals,
        props: { ...mockGlobals.props, isNarration: false, aiNarrative: true },
      }),
    ),
  );
}

describe('NarrativeWidget', () => {
  // The widget reads the credit balance through useQuotaNotification, which needs a query
  // client. Without a Sisense app context the query stays disabled, so no request is made.
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const withQueryClient = (ui: ReactElement) => (
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );

  it('starts idle, and generating with no widgets to describe reports no data', async () => {
    const { user } = setup(withQueryClient(<NarrativeWidget title="Dashboard Narrative" />));

    await user.click(await screen.findByTestId('csdk-narrative-generate'));

    expect(await screen.findByTestId('csdk-narrative-error')).toHaveAttribute(
      'data-error-kind',
      'no-data',
    );
  });

  it('shows a generated narrative, with the copy action in the header', async () => {
    respondWithNarrative();
    setup(
      <NarrativeTestWrapper>
        <NarrativeWidget title="Dashboard Narrative" widgets={[chart]} generateOnMount />
      </NarrativeTestWrapper>,
    );

    expect(await screen.findByTestId('csdk-narrative-overview')).toBeTruthy();
    expect(screen.getAllByTestId('csdk-narrative-insight')).toHaveLength(
      narrativeBody.insights.length,
    );
    expect(screen.getByText('Dashboard Narrative')).toBeTruthy();
    expect(screen.getByTestId('csdk-narrative-copy-button')).toBeTruthy();
  });

  it('draws no regenerate action when it generates on mount, as in an export', async () => {
    respondWithNarrative();
    setup(
      <NarrativeTestWrapper>
        <NarrativeWidget widgets={[chart]} generateOnMount />
      </NarrativeTestWrapper>,
    );

    expect(await screen.findByTestId('csdk-narrative-overview')).toBeTruthy();
    expect(screen.queryByTestId('csdk-narrative-generate')).toBeNull();
  });

  it('reports the trigger on mount the host names, for usage tracking', async () => {
    const bodies: unknown[] = [];
    server.use(
      http.post(`*/${DASHBOARD_NARRATIVE_QUERIES_ENDPOINT}`, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json(narrativeBody);
      }),
    );
    setup(
      <NarrativeTestWrapper>
        <NarrativeWidget
          widgets={[chart]}
          generateOnMount
          generateOnMountTriggerType="assistantCard"
        />
      </NarrativeTestWrapper>,
    );

    expect(await screen.findByTestId('csdk-narrative-overview')).toBeTruthy();
    expect(bodies[0]).toMatchObject({
      tracking: { subActionType: 'generate', triggerType: 'assistantCard' },
    });
  });

  it('renders only the content when the host provides the chrome (containerless)', async () => {
    respondWithNarrative();
    setup(
      <NarrativeTestWrapper>
        <NarrativeWidget
          title="Dashboard Narrative"
          widgets={[chart]}
          generateOnMount
          containerless
        />
      </NarrativeTestWrapper>,
    );

    expect(await screen.findByTestId('csdk-narrative-overview')).toBeTruthy();
    expect(screen.queryByText('Dashboard Narrative')).toBeNull();
    expect(screen.queryByTestId('csdk-narrative-copy-button')).toBeNull();
  });

  it('offers no copy action before a narrative exists', async () => {
    setup(withQueryClient(<NarrativeWidget title="Dashboard Narrative" />));

    await screen.findByTestId('csdk-narrative-idle');

    expect(screen.queryByTestId('csdk-narrative-copy-button')).toBeNull();
  });

  it('surfaces the quota warning beside the idle action, from the live credit balance', async () => {
    onCreditLicence();
    // 13 of 100 credits left is 87 % used — past the hook's 85 % warning threshold.
    server.use(
      http.get('*/api/v1/credits/get-balance', () =>
        HttpResponse.json({
          balance: 13,
          initialBalance: 100,
          sequenceNumber: '1',
          date: '2026-09-01T00:00:00.000Z',
        }),
      ),
    );

    setup(
      <NarrativeTestWrapper>
        <NarrativeWidget />
      </NarrativeTestWrapper>,
    );

    expect(await screen.findByTestId('csdk-narrative-idle')).toBeTruthy();
    expect(await screen.findByTestId('csdk-narrative-quota-warning')).toBeTruthy();
  });

  it('presents the spent allowance as the error state when nothing is generated yet', async () => {
    onCreditLicence();
    server.use(
      http.get('*/api/v1/credits/get-balance', () =>
        HttpResponse.json({
          balance: 0,
          initialBalance: 100,
          sequenceNumber: '1',
          date: '2026-09-02T00:00:00.000Z',
        }),
      ),
    );

    setup(
      <NarrativeTestWrapper>
        <NarrativeWidget />
      </NarrativeTestWrapper>,
    );

    expect(await screen.findByTestId('csdk-narrative-error')).toHaveAttribute(
      'data-error-kind',
      'quota-exceeded',
    );
    expect(screen.queryByTestId('csdk-narrative-idle')).toBeNull();
  });

  it('keeps a generated narrative on screen and disables regenerate once the allowance is spent', async () => {
    onCreditLicence();
    server.use(
      http.get('*/api/v1/credits/get-balance', () =>
        HttpResponse.json({
          balance: 0,
          initialBalance: 100,
          sequenceNumber: '1',
          date: '2026-09-02T00:00:00.000Z',
        }),
      ),
    );

    server.use(
      http.post(`*/${DASHBOARD_NARRATIVE_QUERIES_ENDPOINT}`, () =>
        HttpResponse.json({ ...narrativeBody, cached: true }),
      ),
    );
    setup(
      <NarrativeTestWrapper>
        <NarrativeWidget widgets={[chart]} />
      </NarrativeTestWrapper>,
    );

    expect(await screen.findByTestId('csdk-narrative-overview')).toBeTruthy();
    expect(await screen.findByTestId('csdk-narrative-quota-warning')).toBeTruthy();
    expect(screen.getByTestId('csdk-narrative-generate')).toBeDisabled();
  });

  it('shows no quota warning while the balance is comfortable', async () => {
    onCreditLicence();
    server.use(
      http.get('*/api/v1/credits/get-balance', () =>
        HttpResponse.json({
          balance: 90,
          initialBalance: 100,
          sequenceNumber: '1',
          date: '2026-09-01T00:00:00.000Z',
        }),
      ),
    );

    setup(
      <NarrativeTestWrapper>
        <NarrativeWidget />
      </NarrativeTestWrapper>,
    );

    expect(await screen.findByTestId('csdk-narrative-idle')).toBeTruthy();
    expect(screen.queryByTestId('csdk-narrative-quota-warning')).toBeNull();
  });

  it('ignores the credit balance under the unlimited narrative entitlement', async () => {
    server.use(
      http.get('*/api/v1/credits/get-balance', () =>
        HttpResponse.json({
          balance: 0,
          initialBalance: 0,
          sequenceNumber: '1',
          date: '2026-10-08T00:00:00.000Z',
        }),
      ),
    );

    setup(
      <NarrativeTestWrapper>
        <NarrativeWidget />
      </NarrativeTestWrapper>,
    );

    expect(await screen.findByTestId('csdk-narrative-idle')).toBeTruthy();
    expect(screen.queryByTestId('csdk-narrative-quota-warning')).toBeNull();
    expect(screen.getByTestId('csdk-narrative-generate')).toBeEnabled();
  });

  it('ignores a spent balance another consumer already cached, under the unlimited entitlement', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    client.setQueryData(['creditBalance'], {
      balance: 0,
      initialBalance: 100,
      sequenceNumber: '1',
      date: '2026-10-08T00:00:00.000Z',
    });

    setup(
      <SisenseContextProvider url={mockUrl} token={mockToken}>
        <QueryClientProvider client={client}>
          <NarrativeWidget />
        </QueryClientProvider>
      </SisenseContextProvider>,
    );

    expect(await screen.findByTestId('csdk-narrative-idle')).toBeTruthy();
    expect(screen.queryByTestId('csdk-narrative-error')).toBeNull();
    expect(screen.queryByTestId('csdk-narrative-quota-warning')).toBeNull();
  });

  it('shows a cached narrative on mount without a click', async () => {
    server.use(
      http.post(`*/${DASHBOARD_NARRATIVE_QUERIES_ENDPOINT}`, () =>
        HttpResponse.json({ ...narrativeBody, cached: true }),
      ),
    );
    setup(
      <NarrativeTestWrapper>
        <NarrativeWidget widgets={[chart]} />
      </NarrativeTestWrapper>,
    );

    expect(await screen.findByTestId('csdk-narrative-overview')).toBeTruthy();
    expect(screen.queryByTestId('csdk-narrative-idle')).toBeNull();
  });

  it('reports every state to the host: idle after a cache miss, ready once a narrative arrives', async () => {
    respondWithNarrative();
    const onStateChange = vi.fn();
    const { user } = setup(
      <NarrativeTestWrapper>
        <NarrativeWidget widgets={[chart]} onStateChange={onStateChange} />
      </NarrativeTestWrapper>,
    );

    expect(await screen.findByTestId('csdk-narrative-idle')).toBeTruthy();
    expect(onStateChange).toHaveBeenLastCalledWith({ status: 'idle' });

    await user.click(screen.getByTestId('csdk-narrative-generate'));

    expect(await screen.findByTestId('csdk-narrative-overview')).toBeTruthy();
    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        status: 'ready',
        data: expect.objectContaining({ overview: narrativeBody.overview }),
      }),
    );
  });

  describe('automatic height', () => {
    const MEASURED = 40;
    /** The outer box the widget sizes; everything inside it measures `MEASURED`. */
    const OUTER = 100;

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const renderIdle = (styleOptions?: { isAutoHeight?: boolean }, containerless = false) => {
      vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
        this: HTMLElement,
      ) {
        return this.parentElement?.parentElement === document.body ? OUTER : MEASURED;
      });
      const onContentHeightChange = vi.fn();
      const view = setup(
        withQueryClient(
          <NarrativeWidget
            styleOptions={styleOptions}
            containerless={containerless}
            onContentHeightChange={onContentHeightChange}
          />,
        ),
      );
      return { ...view, onContentHeightChange };
    };

    const sizedWrapper = (container: HTMLElement) =>
      (container.firstElementChild as HTMLElement | null)?.style.height;

    it('sizes itself to the content plus what its container measures around it', async () => {
      const { container, onContentHeightChange } = renderIdle({ isAutoHeight: true });

      await screen.findByTestId('csdk-narrative-idle');

      const natural = 16 + MEASURED + 16;
      expect(onContentHeightChange).toHaveBeenLastCalledWith(natural);
      // The container's chrome is the outer box minus its content area: OUTER - MEASURED.
      expect(sizedWrapper(container)).toBe(`${natural + OUTER - MEASURED}px`);
    });

    it('leaves its size to the container when isAutoHeight is off', async () => {
      const { container } = renderIdle({ isAutoHeight: false });

      await screen.findByTestId('csdk-narrative-idle');

      expect(sizedWrapper(container)).toBe('');
    });

    it('only reports the height when the host draws the chrome', async () => {
      const { container, onContentHeightChange } = renderIdle({ isAutoHeight: true }, true);

      await screen.findByTestId('csdk-narrative-idle');

      expect(onContentHeightChange).toHaveBeenCalled();
      expect(sizedWrapper(container)).toBe('');
    });
  });

  it('reports each generation started from the widget once it yields a narrative', async () => {
    respondWithNarrative();
    const onGenerated = vi.fn();
    const { user } = setup(
      <NarrativeTestWrapper>
        <NarrativeWidget widgets={[chart]} onGenerated={onGenerated} />
      </NarrativeTestWrapper>,
    );

    await user.click(await screen.findByTestId('csdk-narrative-generate'));
    expect(await screen.findByTestId('csdk-narrative-overview')).toBeTruthy();
    await vi.waitFor(() => expect(onGenerated).toHaveBeenCalledTimes(1));

    await user.click(screen.getByTestId('csdk-narrative-generate'));
    await vi.waitFor(() => expect(onGenerated).toHaveBeenCalledTimes(2));
  });

  it('reports no generation for a failed attempt, a cached narrative or one generated on mount', async () => {
    server.use(
      http.post(`*/${DASHBOARD_NARRATIVE_QUERIES_ENDPOINT}`, () =>
        HttpResponse.json({ ...narrativeBody, cached: true }),
      ),
    );
    const onGenerated = vi.fn();
    const cached = setup(
      <NarrativeTestWrapper>
        <NarrativeWidget widgets={[chart]} onGenerated={onGenerated} />
      </NarrativeTestWrapper>,
    );
    expect(await screen.findByTestId('csdk-narrative-overview')).toBeTruthy();
    cached.unmount();

    const onMount = setup(
      <NarrativeTestWrapper>
        <NarrativeWidget widgets={[chart]} generateOnMount onGenerated={onGenerated} />
      </NarrativeTestWrapper>,
    );
    expect(await screen.findByTestId('csdk-narrative-overview')).toBeTruthy();
    onMount.unmount();

    server.use(
      http.post(`*/${DASHBOARD_NARRATIVE_QUERIES_ENDPOINT}`, async ({ request }) => {
        const { cacheOnly } = (await request.json()) as { cacheOnly?: boolean };
        return cacheOnly
          ? HttpResponse.json(cacheMissBody)
          : new HttpResponse(null, { status: 400 });
      }),
    );
    const { user } = setup(
      <NarrativeTestWrapper>
        <NarrativeWidget widgets={[chart]} onGenerated={onGenerated} />
      </NarrativeTestWrapper>,
    );
    await user.click(await screen.findByTestId('csdk-narrative-generate'));
    expect(await screen.findByTestId('csdk-narrative-error')).toHaveAttribute(
      'data-error-kind',
      'failed',
    );

    expect(onGenerated).not.toHaveBeenCalled();
  });

  it('reports no generation on mount, even when the host names the widget button as its trigger', async () => {
    respondWithNarrative();
    const onGenerated = vi.fn();
    setup(
      <NarrativeTestWrapper>
        <NarrativeWidget
          widgets={[chart]}
          generateOnMount
          generateOnMountTriggerType="widgetButton"
          onGenerated={onGenerated}
        />
      </NarrativeTestWrapper>,
    );

    expect(await screen.findByTestId('csdk-narrative-overview')).toBeTruthy();
    expect(onGenerated).not.toHaveBeenCalled();
  });

  it('suggests adding AI context before a narrative exists when the host asks for it', async () => {
    setup(withQueryClient(<NarrativeWidget aiContextHint />));

    expect(await screen.findByTestId('csdk-narrative-ai-context-hint')).toBeTruthy();
  });

  it('fires onReady once after mount, so export pipelines never hang on this widget', async () => {
    const onReady = vi.fn();
    setup(withQueryClient(<NarrativeWidget onReady={onReady} />));

    await screen.findByTestId('csdk-narrative-idle');

    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('with generateOnMount, generates without a click and fires onReady once it has settled', async () => {
    const onScreenAtReady: (string | null)[] = [];
    const onReady = vi.fn(() => {
      const error = screen.queryByTestId('csdk-narrative-error');
      onScreenAtReady.push(error?.getAttribute('data-error-kind') ?? null);
    });
    setup(
      <NarrativeTestWrapper>
        <NarrativeWidget generateOnMount onReady={onReady} />
      </NarrativeTestWrapper>,
    );

    expect(await screen.findByTestId('csdk-narrative-error')).toHaveAttribute(
      'data-error-kind',
      'no-data',
    );
    expect(onReady).toHaveBeenCalledTimes(1);
    expect(onScreenAtReady).toEqual(['no-data']);
  });

  it('renames inline from the header menu and emits title/changed', async () => {
    const onChange = vi.fn();
    const { user } = setup(
      withQueryClient(
        <MenuProvider>
          <NarrativeWidget
            title="Dashboard Narrative"
            config={{ header: { title: { editing: { enabled: true } } } }}
            onChange={onChange}
          />
        </MenuProvider>,
      ),
    );

    await user.click(await screen.findByRole('button', { name: 'widget header menu' }));
    await user.click(await screen.findByText('Rename Widget'));
    const input = await screen.findByRole('textbox');
    await user.clear(input);
    await user.type(input, 'My Narrative{Enter}');

    expect(onChange).toHaveBeenCalledWith({
      type: 'title/changed',
      payload: { title: 'My Narrative' },
    });
  });

  it('offers no header menu while title editing is not enabled (no items to show)', async () => {
    setup(
      withQueryClient(
        <MenuProvider>
          <NarrativeWidget title="Dashboard Narrative" />
        </MenuProvider>,
      ),
    );

    expect(await screen.findByTestId('csdk-narrative-idle')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'widget header menu' })).toBeNull();
  });
});
