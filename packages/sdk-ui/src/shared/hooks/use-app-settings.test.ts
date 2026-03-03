import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useSisenseContextMock } from '@/infra/contexts/sisense-context/__mocks__/sisense-context';

import { useAppSettings } from './use-app-settings';

vi.mock('@/infra/contexts/sisense-context/sisense-context');

describe('useAppSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSisenseContextMock.mockReturnValue({ app: undefined });
  });

  it('returns undefined when app is undefined', () => {
    useSisenseContextMock.mockReturnValue({ app: undefined });

    const { result } = renderHook(() => useAppSettings());

    expect(result.current).toBeUndefined();
  });

  it('returns undefined when app has no settings', () => {
    useSisenseContextMock.mockReturnValue({
      app: { settings: undefined },
    });

    const { result } = renderHook(() => useAppSettings());

    expect(result.current).toBeUndefined();
  });

  it('returns full app.settings when app is present', () => {
    const mockSettings = {
      translationConfig: { language: 'en-US', customTranslations: [] },
      user: {
        tenant: { name: 'Sisense' },
        permissions: { dashboards: { create: true } },
      },
      serverFeatures: {
        aiAssistant: {
          key: 'aiAssistant',
          active: true,
          quotaNotification: true,
          featureModelType: 'sisense_managed',
        },
      },
      serverLanguage: 'en-US',
      isSisenseAiEnabled: true,
      isUnifiedNarrationEnabled: false,
    };

    useSisenseContextMock.mockReturnValue({
      app: { settings: mockSettings },
    });

    const { result } = renderHook(() => useAppSettings());

    expect(result.current).toBe(mockSettings);
    expect(result.current?.translationConfig.language).toBe('en-US');
    expect(result.current?.user.permissions.dashboards?.create).toBe(true);
    expect(result.current?.serverFeatures?.aiAssistant?.quotaNotification).toBe(true);
    expect(result.current?.isSisenseAiEnabled).toBe(true);
  });

  it('returns the same settings object reference on re-render when app unchanged', () => {
    const mockSettings = {
      translationConfig: { language: 'en-US', customTranslations: [] },
      user: { tenant: { name: 'Sisense' }, permissions: {} },
    };

    useSisenseContextMock.mockReturnValue({
      app: { settings: mockSettings },
    });

    const { result, rerender } = renderHook(() => useAppSettings());

    const firstResult = result.current;
    rerender();
    const secondResult = result.current;

    expect(firstResult).toBe(secondResult);
    expect(firstResult).toBe(mockSettings);
  });
});
