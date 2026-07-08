import { filterFactory, measureFactory } from '@sisense/sdk-data';
import { HttpClient } from '@sisense/sdk-rest-client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { WidgetProps } from '@/domains/widgets/components/widget/types';
import { LEGACY_NARRATIVE_ENDPOINT } from '@/infra/api/narrative/narrative-endpoints.js';

import { GetNlgInsightsResponse } from './api/types.js';
import { getNlgInsightsFromWidget } from './get-nlg-insights-from-widget.js';

const mockHttpClientPost = vi.fn();
const mockHttpClient = {
  post: mockHttpClientPost,
} as unknown as HttpClient;

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
    answer: 'This is a summary of the chart data',
  },
};

describe('getNlgInsightsFromWidget', () => {
  beforeEach(() => {
    mockHttpClientPost.mockResolvedValue(mockNlgResponse);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns insights when successful', async () => {
    const result = await getNlgInsightsFromWidget(mockChartWidgetProps, mockHttpClient);

    expect(result).toBe('This is a summary of the chart data');
    expect(mockHttpClientPost).toHaveBeenCalledTimes(1);
    expect(mockHttpClientPost).toHaveBeenCalledWith(
      LEGACY_NARRATIVE_ENDPOINT,
      expect.objectContaining({
        jaql: expect.objectContaining({
          datasource: expect.any(Object),
          metadata: expect.any(Array),
        }),
      }),
    );
  });

  it('returns insights for pivot widget props with pivot JAQL', async () => {
    const result = await getNlgInsightsFromWidget(mockPivotWidgetProps, mockHttpClient);

    expect(result).toBe('This is a summary of the chart data');
    expect(mockHttpClientPost).toHaveBeenCalledTimes(1);
    expect(mockHttpClientPost).toHaveBeenCalledWith(
      LEGACY_NARRATIVE_ENDPOINT,
      expect.objectContaining({
        jaql: expect.objectContaining({
          format: 'pivot',
          datasource: expect.any(Object),
          metadata: expect.any(Array),
        }),
      }),
    );
  });

  it('throws error when widgetProps is not chart or pivot', async () => {
    const textProps: WidgetProps = {
      id: 'widget-text',
      widgetType: 'text',
      styleOptions: {
        html: 'Test',
        vAlign: 'valign-middle',
        bgColor: 'white',
      },
    };

    await expect(getNlgInsightsFromWidget(textProps, mockHttpClient)).rejects.toThrow(
      'Only chart or pivot widget props are supported',
    );

    expect(mockHttpClientPost).not.toHaveBeenCalled();
  });

  it('throws error when dataSource is missing', async () => {
    const propsWithoutDataSource: WidgetProps = {
      ...mockChartWidgetProps,
      dataSource: undefined,
    };

    await expect(getNlgInsightsFromWidget(propsWithoutDataSource, mockHttpClient)).rejects.toThrow(
      'dataSource is required',
    );

    expect(mockHttpClientPost).not.toHaveBeenCalled();
  });

  it('uses verbosity from config.narrative', async () => {
    const props: WidgetProps = {
      ...mockChartWidgetProps,
      config: {
        narrative: { verbosity: 'high' },
      },
    };

    await getNlgInsightsFromWidget(props, mockHttpClient);

    expect(mockHttpClientPost).toHaveBeenCalledWith(
      LEGACY_NARRATIVE_ENDPOINT,
      expect.objectContaining({
        verbosity: 'High',
      }),
    );
  });

  it('throws error when API response is invalid (missing data)', async () => {
    mockHttpClientPost.mockResolvedValue({
      responseType: 'Text',
      data: {},
    });

    await expect(getNlgInsightsFromWidget(mockChartWidgetProps, mockHttpClient)).rejects.toThrow(
      'Invalid response from NLG insights API',
    );
  });

  it('throws error when API response is invalid (missing answer)', async () => {
    mockHttpClientPost.mockResolvedValue({
      responseType: 'Text',
      data: {
        answer: undefined,
      },
    });

    await expect(getNlgInsightsFromWidget(mockChartWidgetProps, mockHttpClient)).rejects.toThrow(
      'Invalid response from NLG insights API',
    );
  });

  it('throws error when API response is null', async () => {
    mockHttpClientPost.mockResolvedValue(null);

    await expect(getNlgInsightsFromWidget(mockChartWidgetProps, mockHttpClient)).rejects.toThrow(
      'Invalid response from NLG insights API',
    );
  });

  it('throws error when HTTP request fails', async () => {
    const httpError = new Error('Network error');
    mockHttpClientPost.mockRejectedValue(httpError);

    await expect(getNlgInsightsFromWidget(mockChartWidgetProps, mockHttpClient)).rejects.toThrow(
      'Network error',
    );
  });

  it('handles filters in WidgetProps', async () => {
    const propsWithFilters: WidgetProps = {
      ...mockChartWidgetProps,
      filters: [filterFactory.members(DM.Commerce.Condition, ['New'])],
    };

    await getNlgInsightsFromWidget(propsWithFilters, mockHttpClient);

    expect(mockHttpClientPost).toHaveBeenCalledWith(
      LEGACY_NARRATIVE_ENDPOINT,
      expect.objectContaining({
        jaql: expect.objectContaining({
          metadata: expect.arrayContaining([
            expect.objectContaining({
              jaql: expect.objectContaining({
                filter: expect.objectContaining({
                  members: ['New'],
                }),
              }),
            }),
          ]),
        }),
      }),
    );
  });

  it('handles dataSource as object with type', async () => {
    const propsWithDataSourceObject: WidgetProps = {
      ...mockChartWidgetProps,
      dataSource: { title: 'My Data Source', type: 'live' },
    };

    const result = await getNlgInsightsFromWidget(propsWithDataSourceObject, mockHttpClient);

    expect(result).toBe('This is a summary of the chart data');
    expect(mockHttpClientPost).toHaveBeenCalledTimes(1);
  });

  it('handles table chart type with columns containing attributes and measures', async () => {
    const tableWidgetProps: WidgetProps = {
      widgetType: 'chart',
      id: 'test-table-widget',
      chartType: 'table',
      dataSource: 'Sample ECommerce',
      dataOptions: {
        columns: [
          DM.Commerce.AgeRange,
          measureFactory.sum(DM.Commerce.Revenue),
          DM.Commerce.Date.Months,
        ],
      },
    };

    const result = await getNlgInsightsFromWidget(tableWidgetProps, mockHttpClient);

    expect(result).toBe('This is a summary of the chart data');
    expect(mockHttpClientPost).toHaveBeenCalledTimes(1);
    expect(mockHttpClientPost).toHaveBeenCalledWith(
      LEGACY_NARRATIVE_ENDPOINT,
      expect.objectContaining({
        jaql: expect.objectContaining({
          datasource: expect.any(Object),
          metadata: expect.any(Array),
        }),
      }),
    );
  });
});
