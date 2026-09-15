import { type ReactElement } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { server } from '@/__mocks__/msw';
import { setup } from '@/__test-helpers__';
import { NarrativeTestWrapper } from '@/domains/narrative/__test-helpers__/narrative-test-wrapper';
import { mockNarrativeStandard } from '@/domains/narrative/components/narrative/__mocks__/narrative-mocks.js';
import { MenuProvider } from '@/infra/contexts/menu-provider/menu-provider';

import { NarrativeWidget } from './narrative-widget.js';

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

  it('starts idle, and generating without a narrative lands in the retryable failed state', async () => {
    const { user } = setup(withQueryClient(<NarrativeWidget title="Dashboard Narrative" />));

    await user.click(await screen.findByTestId('csdk-narrative-generate'));

    expect(await screen.findByTestId('csdk-narrative-error')).toHaveAttribute(
      'data-error-kind',
      'failed',
    );
    expect(screen.getByTestId('csdk-narrative-generate')).toBeEnabled();
  });

  it('starts ready when a narrative is pre-supplied, with the copy action in the header', async () => {
    setup(
      withQueryClient(
        <NarrativeWidget title="Dashboard Narrative" narrative={mockNarrativeStandard} />,
      ),
    );

    expect(await screen.findByTestId('csdk-narrative-overview')).toBeTruthy();
    expect(screen.getAllByTestId('csdk-narrative-insight')).toHaveLength(
      mockNarrativeStandard.insights.length,
    );
    expect(screen.getByText('Dashboard Narrative')).toBeTruthy();
    expect(screen.getByTestId('csdk-narrative-copy-button')).toBeTruthy();
  });

  it('renders only the content when the host provides the chrome (containerless)', async () => {
    setup(
      withQueryClient(
        <NarrativeWidget
          title="Dashboard Narrative"
          narrative={mockNarrativeStandard}
          containerless
        />,
      ),
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
    expect(screen.queryByTestId('csdk-narrative-generate')).toBeNull();
  });

  it('keeps a generated narrative on screen and disables regenerate once the allowance is spent', async () => {
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
        <NarrativeWidget narrative={mockNarrativeStandard} />
      </NarrativeTestWrapper>,
    );

    expect(await screen.findByTestId('csdk-narrative-overview')).toBeTruthy();
    expect(await screen.findByTestId('csdk-narrative-quota-warning')).toBeTruthy();
    expect(screen.getByTestId('csdk-narrative-generate')).toBeDisabled();
  });

  it('shows no quota warning while the balance is comfortable', async () => {
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

  it('reports every state to the host: idle on mount, ready once a narrative arrives', async () => {
    const onStateChange = vi.fn();
    const { rerender } = setup(withQueryClient(<NarrativeWidget onStateChange={onStateChange} />));

    expect(await screen.findByTestId('csdk-narrative-idle')).toBeTruthy();
    expect(onStateChange).toHaveBeenLastCalledWith({ status: 'idle' });

    rerender(
      withQueryClient(
        <NarrativeWidget onStateChange={onStateChange} narrative={mockNarrativeStandard} />,
      ),
    );

    expect(await screen.findByTestId('csdk-narrative-overview')).toBeTruthy();
    expect(onStateChange).toHaveBeenLastCalledWith({
      status: 'ready',
      data: mockNarrativeStandard,
    });
  });

  it('fires onReady once after mount, so export pipelines never hang on this widget', async () => {
    const onReady = vi.fn();
    setup(withQueryClient(<NarrativeWidget onReady={onReady} />));

    await screen.findByTestId('csdk-narrative-idle');

    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('renames inline from the header menu and emits title/changed', async () => {
    const onChange = vi.fn();
    const { user } = setup(
      withQueryClient(
        <MenuProvider>
          <NarrativeWidget
            title="Dashboard Narrative"
            narrative={mockNarrativeStandard}
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
          <NarrativeWidget title="Dashboard Narrative" narrative={mockNarrativeStandard} />
        </MenuProvider>,
      ),
    );

    expect(await screen.findByTestId('csdk-narrative-overview')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'widget header menu' })).toBeNull();
  });
});
