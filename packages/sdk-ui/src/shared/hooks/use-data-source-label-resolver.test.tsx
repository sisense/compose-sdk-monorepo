import type { PropsWithChildren } from 'react';

import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { mockToken, server } from '@/__mocks__/msw';
import { SisenseContextProvider } from '@/infra/contexts/sisense-context/sisense-context-provider';

import { useDataSourceLabelResolver } from './use-data-source-label-resolver.js';

// Display names are cached per Sisense URL, so each test uses its own URL
let testIndex = 0;
const createWrapper = () => {
  testIndex += 1;
  const url = `http://fake-url-${testIndex}/`;
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <SisenseContextProvider
        url={url}
        token={mockToken}
        appConfig={{ queryCacheConfig: { enabled: false }, trackingConfig: { enabled: false } }}
      >
        {children}
      </SisenseContextProvider>
    );
  };
};

const renderUseGetDataSourceLabel = () =>
  renderHook(() => useDataSourceLabelResolver(), { wrapper: createWrapper() });

const mockDataSourceList = (response: () => Response) => {
  const onRequest = vi.fn(response);
  server.use(http.get('*/api/datasources/', onRequest));
  return onRequest;
};

// A renamed data source returned next to the one under test. Once it resolves to its display
// name, the loaded response has been applied, so a title fallback is not just the initial value.
const probe = {
  title: 'Probe',
  fullname: 'localhost/Probe',
  live: false,
  displayName: 'Probe loaded',
};

// The resolver is memoized on the loaded display names, so it changes once the result is applied.
const waitForLoadedResolver = async (result: { current: (dataSource: string) => string }) => {
  const initialResolver = result.current;
  await waitFor(() => expect(result.current).not.toBe(initialResolver));
};

describe('useDataSourceLabelResolver', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should resolve the display name returned by the server', async () => {
    mockDataSourceList(() =>
      HttpResponse.json([
        { title: 'ECommerce', fullname: 'localhost/ECommerce', live: false, displayName: 'Store' },
        { title: 'Healthcare', fullname: 'localhost/Healthcare', live: false },
      ]),
    );

    const { result } = renderUseGetDataSourceLabel();

    await waitFor(() => expect(result.current('ECommerce')).toBe('Store'));
    expect(result.current('Healthcare')).toBe('Healthcare');
    expect(result.current('Unknown')).toBe('Unknown');
  });

  it.each([null, '', '   '])(
    'should fall back to the title for a blank display name (%j)',
    async (displayName) => {
      mockDataSourceList(() =>
        HttpResponse.json([
          { title: 'ECommerce', fullname: 'localhost/ECommerce', live: false, displayName },
          probe,
        ]),
      );

      const { result } = renderUseGetDataSourceLabel();

      await waitFor(() => expect(result.current(probe.title)).toBe(probe.displayName));
      expect(result.current('ECommerce')).toBe('ECommerce');
    },
  );

  it('should fall back to titles and log when the request fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onRequest = mockDataSourceList(() => new HttpResponse(null, { status: 404 }));

    const { result } = renderUseGetDataSourceLabel();

    await waitForLoadedResolver(result);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('Unable to load data source display names');
    expect(onRequest).toHaveBeenCalledTimes(1);
    expect(result.current('ECommerce')).toBe('ECommerce');
  });

  it('should fall back to titles for an unexpected response shape', async () => {
    mockDataSourceList(() => HttpResponse.json({ unexpected: true }));

    const { result } = renderUseGetDataSourceLabel();

    await waitForLoadedResolver(result);
    expect(result.current('ECommerce')).toBe('ECommerce');
  });

  it('should request the data source list once for several consumers', async () => {
    const onRequest = mockDataSourceList(() =>
      HttpResponse.json([
        { title: 'ECommerce', fullname: 'localhost/ECommerce', live: false, displayName: 'Store' },
      ]),
    );
    const { result } = renderHook(
      () => [useDataSourceLabelResolver(), useDataSourceLabelResolver()],
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current[1]('ECommerce')).toBe('Store'));
    expect(result.current[0]('ECommerce')).toBe('Store');
    expect(onRequest).toHaveBeenCalledTimes(1);
  });

  describe('when a consumer mounts again', () => {
    const renderTwice = async (msSinceLoad: number) => {
      let displayName = 'Store';
      const onRequest = mockDataSourceList(() =>
        HttpResponse.json([
          { title: 'ECommerce', fullname: 'localhost/ECommerce', live: false, displayName },
        ]),
      );
      const wrapper = createWrapper();
      const first = renderHook(() => useDataSourceLabelResolver(), { wrapper });
      await waitFor(() => expect(first.result.current('ECommerce')).toBe('Store'));
      first.unmount();

      displayName = 'Online Store';
      const loadedAt = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(loadedAt + msSinceLoad);
      const second = renderHook(() => useDataSourceLabelResolver(), { wrapper });
      return { onRequest, result: second.result };
    };

    it('should reuse display names loaded less than a minute ago', async () => {
      const { onRequest, result } = await renderTwice(30_000);

      await waitFor(() => expect(result.current('ECommerce')).toBe('Store'));
      expect(onRequest).toHaveBeenCalledTimes(1);
    });

    it('should refetch display names loaded more than a minute ago', async () => {
      const { onRequest, result } = await renderTwice(61_000);

      await waitFor(() => expect(result.current('ECommerce')).toBe('Online Store'));
      expect(onRequest).toHaveBeenCalledTimes(2);
    });
  });
});
