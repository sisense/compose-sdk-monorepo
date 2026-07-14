import { BearerAuthenticator, HttpClient } from '@sisense/sdk-rest-client';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useSisenseContextMock } from '@/infra/contexts/sisense-context/__mocks__/sisense-context';

import { useHttpClient } from './use-http-client';

vi.mock('@/infra/contexts/sisense-context/sisense-context');

describe('useHttpClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSisenseContextMock.mockReturnValue({ app: undefined });
  });

  it('returns undefined when app is undefined', () => {
    const { result } = renderHook(() => useHttpClient());

    expect(result.current).toBeUndefined();
  });

  it('returns undefined when app has no httpClient', () => {
    useSisenseContextMock.mockReturnValue({ app: {} });

    const { result } = renderHook(() => useHttpClient());

    expect(result.current).toBeUndefined();
  });

  it('returns app.httpClient when app is present', () => {
    const mockHttpClient = new HttpClient(
      'https://example.com',
      new BearerAuthenticator('https://example.com', 'mock-token'),
      'test-env',
    );

    useSisenseContextMock.mockReturnValue({
      app: { httpClient: mockHttpClient },
    });

    const { result } = renderHook(() => useHttpClient());

    expect(result.current).toBe(mockHttpClient);
  });
});
