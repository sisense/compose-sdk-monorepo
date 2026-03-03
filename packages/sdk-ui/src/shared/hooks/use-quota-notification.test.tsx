import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useSisenseContextMock } from '@/infra/contexts/sisense-context/__mocks__/sisense-context.js';

import { useQuotaNotification } from './use-quota-notification.js';

vi.mock('@/infra/contexts/sisense-context/sisense-context');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useQuotaNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSisenseContextMock.mockReturnValue({
      app: undefined,
    });
  });

  describe('enabled (feature flags)', () => {
    it('returns enabled true when quotaNotification === true and featureModelType === sisense_managed', () => {
      useSisenseContextMock.mockReturnValue({
        app: {
          settings: {
            serverFeatures: {
              aiAssistant: {
                quotaNotification: true,
                featureModelType: 'sisense_managed',
              },
            },
          },
        },
      });

      const { result } = renderHook(() => useQuotaNotification(), {
        wrapper: createWrapper(),
      });
      expect(result.current.enabled).toBe(true);
    });

    it('returns enabled false when quotaNotification is null', () => {
      useSisenseContextMock.mockReturnValue({
        app: {
          settings: {
            serverFeatures: {
              aiAssistant: {
                quotaNotification: null,
                featureModelType: 'sisense_managed',
              },
            },
          },
        },
      });

      const { result } = renderHook(() => useQuotaNotification(), {
        wrapper: createWrapper(),
      });
      expect(result.current.enabled).toBe(false);
    });

    it('returns enabled false when quotaNotification is false', () => {
      useSisenseContextMock.mockReturnValue({
        app: {
          settings: {
            serverFeatures: {
              aiAssistant: {
                quotaNotification: false,
                featureModelType: 'sisense_managed',
              },
            },
          },
        },
      });

      const { result } = renderHook(() => useQuotaNotification(), {
        wrapper: createWrapper(),
      });
      expect(result.current.enabled).toBe(false);
    });

    it('returns enabled false when featureModelType is not sisense_managed', () => {
      useSisenseContextMock.mockReturnValue({
        app: {
          settings: {
            serverFeatures: {
              aiAssistant: {
                quotaNotification: true,
                featureModelType: 'custom',
              },
            },
          },
        },
      });

      const { result } = renderHook(() => useQuotaNotification(), {
        wrapper: createWrapper(),
      });
      expect(result.current.enabled).toBe(false);
    });

    it('returns enabled false when aiAssistant is undefined', () => {
      useSisenseContextMock.mockReturnValue({
        app: {
          settings: {
            serverFeatures: {},
          },
        },
      });

      const { result } = renderHook(() => useQuotaNotification(), {
        wrapper: createWrapper(),
      });
      expect(result.current.enabled).toBe(false);
    });

    it('returns enabled false when app is undefined', () => {
      useSisenseContextMock.mockReturnValue({
        app: undefined,
      });

      const { result } = renderHook(() => useQuotaNotification(), {
        wrapper: createWrapper(),
      });
      expect(result.current.enabled).toBe(false);
    });

    it('returns enabled false when settings is undefined', () => {
      useSisenseContextMock.mockReturnValue({
        app: {
          settings: undefined,
        },
      });

      const { result } = renderHook(() => useQuotaNotification(), {
        wrapper: createWrapper(),
      });
      expect(result.current.enabled).toBe(false);
    });
  });

  describe('options.enabled override', () => {
    it('returns enabled false when options.enabled is false even when feature flags are on', () => {
      useSisenseContextMock.mockReturnValue({
        app: {
          settings: {
            serverFeatures: {
              aiAssistant: {
                quotaNotification: true,
                featureModelType: 'sisense_managed',
              },
            },
          },
        },
      });

      const { result } = renderHook(() => useQuotaNotification({ enabled: false }), {
        wrapper: createWrapper(),
      });
      expect(result.current.enabled).toBe(false);
    });

    it('returns enabled true when options.enabled is true and feature flags are on', () => {
      useSisenseContextMock.mockReturnValue({
        app: {
          settings: {
            serverFeatures: {
              aiAssistant: {
                quotaNotification: true,
                featureModelType: 'sisense_managed',
              },
            },
          },
        },
      });

      const { result } = renderHook(() => useQuotaNotification({ enabled: true }), {
        wrapper: createWrapper(),
      });
      expect(result.current.enabled).toBe(true);
    });
  });
});
