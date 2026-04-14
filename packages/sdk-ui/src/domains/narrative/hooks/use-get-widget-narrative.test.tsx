import { measureFactory } from '@sisense/sdk-data';
import { trackProductEvent } from '@sisense/sdk-tracking';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { server } from '@/__mocks__/msw';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { WidgetProps } from '@/domains/widgets/components/widget/types';
import type { GetNlgInsightsResponse } from '@/infra/api/narrative/narrative-api-types.js';
import {
  LEGACY_NARRATIVE_ENDPOINT,
  UNIFIED_NARRATIVE_ENDPOINT,
} from '@/infra/api/narrative/narrative-endpoints.js';

import { NarrativeTestWrapper } from '../__test-helpers__/narrative-test-wrapper.js';
import { useGetWidgetNarrative } from './use-get-widget-narrative.js';

vi.mock('@sisense/sdk-tracking', async () => {
  const actual: typeof import('@sisense/sdk-tracking') = await vi.importActual(
    '@sisense/sdk-tracking',
  );
  return {
    ...actual,
    trackProductEvent: vi.fn().mockImplementation(() => Promise.resolve()),
  };
});

const trackProductEventMock = trackProductEvent as Mock<typeof trackProductEvent>;

const mockChartWidgetProps: WidgetProps = {
  widgetType: 'chart',
  id: 'test-widget',
  chartType: 'bar',
  dataSource: 'Sample ECommerce',
  dataOptions: {
    category: [DM.Commerce.Date.Months],
    value: [measureFactory.sum(DM.Commerce.Revenue)],
  },
};

const mockPivotWidgetProps: WidgetProps = {
  widgetType: 'pivot',
  id: 'test-pivot',
  dataSource: 'Sample ECommerce',
  dataOptions: {
    rows: [DM.Commerce.AgeRange],
    columns: [{ column: DM.Commerce.Gender, includeSubTotals: true }],
    values: [measureFactory.sum(DM.Commerce.Cost, 'Total Cost')],
  },
};

const mockNlgResponse: GetNlgInsightsResponse = {
  responseType: 'Text',
  data: {
    answer: 'widget narrative summary',
  },
};

describe('useGetWidgetNarrative', () => {
  beforeEach(() => {
    trackProductEventMock.mockClear();
    server.use(
      http.post(`*/${UNIFIED_NARRATIVE_ENDPOINT}`, () => HttpResponse.json({}, { status: 404 })),
      http.post(`*/${LEGACY_NARRATIVE_ENDPOINT}`, () => HttpResponse.json(mockNlgResponse)),
    );
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, '__PACKAGE_VERSION__');
    vi.stubGlobal('__PACKAGE_VERSION__', '0.0.0');
  });

  it('returns supported for pivot widgets, then loads narrative text', async () => {
    const { result } = renderHook(
      () => useGetWidgetNarrative({ widgetProps: mockPivotWidgetProps }),
      {
        wrapper: NarrativeTestWrapper,
      },
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current?.supported).toBe(true);

    await waitFor(() => expect(result.current?.data).toBe('widget narrative summary'));
    expect(result.current?.isError).toBe(false);
  });

  it('returns supported for chart widgets, then loads narrative text', async () => {
    const { result } = renderHook(
      () => useGetWidgetNarrative({ widgetProps: mockChartWidgetProps }),
      {
        wrapper: NarrativeTestWrapper,
      },
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current?.supported).toBe(true);

    await waitFor(() => expect(result.current?.data).toBe('widget narrative summary'));
    expect(result.current?.isError).toBe(false);
  });

  it('sends sdkHookInit tracking after the app context is ready', async () => {
    vi.stubGlobal('__PACKAGE_VERSION__', 'unit-test-version');

    const { result } = renderHook(
      () => useGetWidgetNarrative({ widgetProps: mockChartWidgetProps }),
      {
        wrapper: NarrativeTestWrapper,
      },
    );

    await waitFor(() => expect(result.current?.data).toBe('widget narrative summary'));

    expect(trackProductEventMock).toHaveBeenCalled();
    expect(trackProductEventMock).toHaveBeenCalledWith(
      'sdkHookInit',
      expect.objectContaining({
        hookName: 'useGetWidgetNarrative',
      }),
      expect.anything(),
      expect.any(Boolean),
    );
  });

  it('returns supported false for non-chart widgets without fetching', async () => {
    let narrationCallsUnified = 0;
    let narrationCalls = 0;
    server.use(
      http.post(`*/${UNIFIED_NARRATIVE_ENDPOINT}`, () => {
        narrationCallsUnified += 1;
        return HttpResponse.json({}, { status: 404 });
      }),
      http.post(`*/${LEGACY_NARRATIVE_ENDPOINT}`, () => {
        narrationCalls += 1;
        return HttpResponse.json(mockNlgResponse);
      }),
    );

    const textProps: WidgetProps = {
      id: 'widget-text',
      widgetType: 'text',
      styleOptions: {
        html: 'Test',
        vAlign: 'valign-middle',
        bgColor: 'white',
      },
    };

    const { result } = renderHook(() => useGetWidgetNarrative({ widgetProps: textProps }), {
      wrapper: NarrativeTestWrapper,
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current?.supported).toBe(false);
    expect(narrationCallsUnified).toBe(0);
    expect(narrationCalls).toBe(0);
  });

  it('does not fetch when enabled is false', async () => {
    let narrationCallsUnified = 0;
    let narrationCalls = 0;
    server.use(
      http.post(`*/${UNIFIED_NARRATIVE_ENDPOINT}`, () => {
        narrationCallsUnified += 1;
        return HttpResponse.json({}, { status: 404 });
      }),
      http.post(`*/${LEGACY_NARRATIVE_ENDPOINT}`, () => {
        narrationCalls += 1;
        return HttpResponse.json(mockNlgResponse);
      }),
    );

    const { result } = renderHook(
      () => useGetWidgetNarrative({ widgetProps: mockChartWidgetProps, enabled: false }),
      {
        wrapper: NarrativeTestWrapper,
      },
    );

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(narrationCallsUnified).toBe(0);
      expect(narrationCalls).toBe(0);
    });

    expect(result.current?.supported).toBe(true);
    expect(result.current?.enabled).toBe(false);
    expect(result.current?.data).toBeUndefined();
    expect(result.current?.isLoading).toBe(false);
    expect(result.current?.isError).toBe(false);
  });
});
