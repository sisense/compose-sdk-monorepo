import { renderHook, waitFor } from '@testing-library/react';
import { useFetch } from './use-fetch.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSisenseContextMock } from '@/sisense-context/__mocks__/sisense-context.js';
import { type HttpClient } from '@sisense/sdk-rest-client';
import { Mock } from 'vitest';

const HOST = 'https://my-sisense-instance.com';
const URL = '/api/v1/dashboards';

vi.mock('@/sisense-context/sisense-context');

vi.mock('@sisense/sdk-tracking', async () => {
  const actual: typeof import('@sisense/sdk-tracking') = await vi.importActual(
    '@sisense/sdk-tracking',
  );
  return {
    ...actual,
    trackProductEvent: vi.fn().mockImplementation(() => {
      console.log('trackProductEvent');
      return Promise.resolve();
    }),
  };
});

type MockedHttpClient = HttpClient & { call: Mock };

describe('useFetch', () => {
  let queryClient: QueryClient;
  let mockHttpClient: MockedHttpClient;

  beforeAll(() => {
    // Create a new QueryClient before all tests
    queryClient = new QueryClient();
    mockHttpClient = {
      call: vi.fn(),
      url: HOST,
    } as MockedHttpClient;
  });

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    mockHttpClient.call.mockResolvedValue('response');

    useSisenseContextMock.mockReturnValue({
      app: { httpClient: mockHttpClient },
      isInitialized: true,
      tracking: {
        enabled: false,
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  const renderUseFetch = (...props: Parameters<typeof useFetch>) => {
    return renderHook(() => useFetch(...props), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });
  };

  it('should call httpClient.call with correct arguments when enabled', async () => {
    renderUseFetch(URL);

    await waitFor(() => {
      expect(mockHttpClient.call).toHaveBeenCalledWith(
        HOST + URL,
        {},
        {
          skipTrackingParam: true,
        },
      );
    });
  });

  it('should return correct data when enabled', async () => {
    const { result } = renderUseFetch(URL);

    await waitFor(() => {
      expect(result.current.data).toBe('response');
    });
  });

  it('should not call httpClient.call when disabled', async () => {
    renderUseFetch(URL, undefined, { enabled: false });

    await waitFor(() => {
      expect(mockHttpClient.call).not.toHaveBeenCalled();
    });
  });

  it('should should not call httpClient.call until httpClient will not be available', async () => {
    // httpClient is not available initially
    useSisenseContextMock.mockReturnValue({
      app: {},
      tracking: {
        enabled: false,
      },
    });

    const { result, rerender } = renderUseFetch(URL);

    rerender();

    await waitFor(() => {
      expect(mockHttpClient.call).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(true);
    });

    // httpClient is available now
    useSisenseContextMock.mockReturnValue({
      app: { httpClient: mockHttpClient },
      tracking: {
        enabled: false,
      },
    });

    rerender();

    await waitFor(() => {
      expect(mockHttpClient.call).toHaveBeenCalledOnce();
      expect(mockHttpClient.call).toHaveBeenCalledWith(
        HOST + URL,
        {},
        {
          skipTrackingParam: true,
        },
      );
    });
  });
});
