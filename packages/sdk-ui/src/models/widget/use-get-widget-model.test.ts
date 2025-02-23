/** @vitest-environment jsdom */
import { renderHook, waitFor } from '@testing-library/react';
import type { Mock } from 'vitest';
import { trackProductEvent } from '@sisense/sdk-tracking';
import { useGetWidgetModel } from './use-get-widget-model';
import { getWidgetModel } from './get-widget-model';
import { useSisenseContext } from '../../sisense-context/sisense-context';
import { type ClientApplication } from '../../app/client-application';
import { sampleEcommerceDashboard as dashboardMock } from '../__mocks__/sample-ecommerce-dashboard';
import { isWidgetModel, widgetModelTranslator } from '.';

const widgetDtoMock = dashboardMock.widgets![0];

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

vi.mock('../../sisense-context/sisense-context', async () => {
  const actual: typeof import('../../sisense-context/sisense-context') = await vi.importActual(
    '../../sisense-context/sisense-context',
  );

  return {
    ...actual,
    useSisenseContext: vi.fn(),
  };
});

vi.mock('./get-widget-model', () => ({
  getWidgetModel: vi.fn(),
}));

const getWidgetModelMock = getWidgetModel as Mock<typeof getWidgetModel>;
const useSisenseContextMock = useSisenseContext as Mock<typeof useSisenseContext>;
const trackProductEventMock = trackProductEvent as Mock<typeof trackProductEvent>;

describe('useGetWidgetModel', () => {
  beforeEach(() => {
    getWidgetModelMock.mockClear();
    trackProductEventMock.mockClear();
    useSisenseContextMock.mockReturnValue({
      app: {} as ClientApplication,
      isInitialized: true,
      tracking: {
        enabled: false,
        packageName: 'sdk-ui',
      },
      errorBoundary: {
        showErrorBox: true,
      },
    });
  });

  it('should fetch a widget model', async () => {
    getWidgetModelMock.mockResolvedValue(widgetModelTranslator.fromWidgetDto(widgetDtoMock));
    const { result } = renderHook(() =>
      useGetWidgetModel({
        widgetOid: widgetDtoMock.oid,
        dashboardOid: dashboardMock.oid,
      }),
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(isWidgetModel(result.current.widget)).toBe(true);
      expect(result.current.widget?.oid).toBe(widgetDtoMock.oid);
    });
  });

  it('should handle widget fetch error', async () => {
    const mockError = new Error('Widget fetch error');
    getWidgetModelMock.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() =>
      useGetWidgetModel({
        dashboardOid: dashboardMock.oid,
        widgetOid: widgetDtoMock.oid,
      }),
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(mockError);
    });
  });

  it('should send tracking for the first execution', async () => {
    const widgetModel = widgetModelTranslator.fromWidgetDto(widgetDtoMock);
    getWidgetModelMock.mockResolvedValue(widgetModel);
    useSisenseContextMock.mockReturnValue({
      app: { httpClient: {} } as ClientApplication,
      isInitialized: true,
      tracking: {
        enabled: true,
        packageName: 'sdk-ui',
      },
      errorBoundary: {
        showErrorBox: true,
      },
    });
    vi.stubGlobal('__PACKAGE_VERSION__', 'unit-test-version');

    const { result } = renderHook(() =>
      useGetWidgetModel({
        dashboardOid: dashboardMock.oid,
        widgetOid: widgetDtoMock.oid,
      }),
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.widget).toBe(widgetModel);
    });

    expect(trackProductEventMock).toHaveBeenCalledOnce();
    expect(trackProductEventMock).toHaveBeenCalledWith(
      'sdkHookInit',
      expect.objectContaining({
        hookName: 'useGetWidgetModel',
      }),
      expect.anything(),
      expect.any(Boolean),
    );
  });
});
