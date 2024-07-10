import { renderHook, waitFor } from '@testing-library/react';
import { useFetchWidgetDtoModel } from './use-fetch-widget-dto-model';

// Mock the api/rest-api.js module
const mockApi = {
  getWidget: vi.fn(),
  getDashboard: vi.fn(),
};
vi.mock('../api/rest-api', () => ({
  useGetApi: vi.fn(() => mockApi),
}));

describe('useFetchWidgetDtoModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should fetch widget DTO model', async () => {
    mockApi.getWidget.mockResolvedValueOnce({});
    mockApi.getDashboard.mockResolvedValueOnce({});

    const widgetOid = 'widget-123';
    const dashboardOid = 'dashboard-123';
    const { result } = renderHook(() => useFetchWidgetDtoModel({ widgetOid, dashboardOid }));

    await waitFor(() => {
      expect(result.current.widget).toBeDefined();
      expect(result.current.dashboard).toBeUndefined();
      expect(result.current.error).toBeUndefined();
    });
  });

  test('should fetch widget and dashboard DTO models', async () => {
    mockApi.getWidget.mockResolvedValueOnce({});
    mockApi.getDashboard.mockResolvedValueOnce({});

    const widgetOid = 'widget-678';
    const dashboardOid = 'dashboard-678';
    const { result } = renderHook(() =>
      useFetchWidgetDtoModel({ widgetOid, dashboardOid, includeDashboard: true }),
    );

    await waitFor(() => {
      expect(result.current.widget).toBeDefined();
      expect(result.current.dashboard).toBeDefined();
      expect(result.current.error).toBeUndefined();
    });
  });

  test('should handle empty fetch', async () => {
    mockApi.getWidget.mockResolvedValueOnce(undefined);
    mockApi.getDashboard.mockResolvedValueOnce({});

    const widgetOid = 'widget-456';
    const dashboardOid = 'dashboard-456';
    const { result } = renderHook(() => useFetchWidgetDtoModel({ widgetOid, dashboardOid }));

    await waitFor(() => {
      expect(result.current.widget).toBeUndefined();
      expect(result.current.dashboard).toBeUndefined();
      expect(result.current.error).toBeDefined();
    });
  });

  test('should handle fetch error', async () => {
    mockApi.getWidget.mockRejectedValueOnce(new Error('Fetch error'));
    mockApi.getDashboard.mockResolvedValueOnce({});

    const widgetOid = 'widget-901';
    const dashboardOid = 'dashboard-901';
    const { result } = renderHook(() => useFetchWidgetDtoModel({ widgetOid, dashboardOid }));

    await waitFor(() => {
      expect(result.current.widget).toBeUndefined();
      expect(result.current.dashboard).toBeUndefined();
      expect(result.current.error).toEqual(new Error('Fetch error'));
    });
  });
});
