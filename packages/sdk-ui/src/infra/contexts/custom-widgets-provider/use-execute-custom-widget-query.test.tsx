import { measureFactory, QueryResultData } from '@sisense/sdk-data';
import { renderHook } from '@testing-library/react';
import { Mock } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { useExecuteQuery } from '@/domains/query-execution/hooks/use-execute-query';
import {
  applyFormatPlainText,
  getCompleteNumberFormatConfig,
} from '@/domains/visualizations/core/chart-options-processor/translations/number-format-config';
import { GenericDataOptions } from '@/types';

import {
  extractDimensionsAndMeasures,
  useExecuteCustomWidgetQueryInternal,
} from './use-execute-custom-widget-query';

vi.mock('@/domains/query-execution/hooks/use-execute-query');
vi.mock(
  '@/domains/visualizations/core/chart-options-processor/translations/number-format-config',
  () => ({
    applyFormatPlainText: vi.fn(),
    getCompleteNumberFormatConfig: vi.fn((config) => config),
  }),
);

describe('useExecuteCustomWidgetQuery', () => {
  const mockUseExecuteQuery = useExecuteQuery as unknown as Mock;
  const applyFormatPlainTextMock = applyFormatPlainText as unknown as Mock;
  const getCompleteNumberFormatConfigMock = getCompleteNumberFormatConfig as unknown as Mock;

  const revenueMeasure = measureFactory.sum(DM.Commerce.Revenue, 'Revenue');
  const dataOptions: GenericDataOptions = {
    category: [{ column: DM.Category.Category }],
    value: [{ column: revenueMeasure, numberFormatConfig: { decimalScale: 2 } }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('extracts dimensions and measures from data options', () => {
    const { dimensions, measures } = extractDimensionsAndMeasures(dataOptions);

    expect(dimensions).toEqual([DM.Category.Category]);
    expect(measures).toEqual([revenueMeasure]);
  });

  it('skips empty arrays in data options', () => {
    const dataOptionsWithEmptyArrays: GenericDataOptions = {
      category: [{ column: DM.Category.Category }],
      value: [{ column: revenueMeasure }],
      emptyCategory: [],
      emptyValue: [],
      anotherEmpty: [],
    };

    const { dimensions, measures } = extractDimensionsAndMeasures(dataOptionsWithEmptyArrays);

    expect(dimensions).toEqual([DM.Category.Category]);
    expect(measures).toEqual([revenueMeasure]);
  });

  it('passes translated dimensions and measures to useExecuteQuery', () => {
    mockUseExecuteQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      isSuccess: false,
      status: 'idle',
      error: null,
    });

    renderHook(() =>
      useExecuteCustomWidgetQueryInternal({
        dataSource: DM.DataSource,
        dataOptions,
        filters: [],
        highlights: [],
      }),
    );

    expect(mockUseExecuteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        dataSource: DM.DataSource,
        dimensions: [DM.Category.Category],
        measures: [revenueMeasure],
      }),
    );
  });

  it('applies number formatting for configured columns', () => {
    applyFormatPlainTextMock.mockImplementation((_config, value) => `formatted:${value}`);
    getCompleteNumberFormatConfigMock.mockImplementation((config) => config);

    const rawData: QueryResultData = {
      columns: [
        { name: 'Revenue', type: 'number' },
        { name: 'Category', type: 'text' },
      ],
      rows: [
        [
          { data: 100, text: '100' },
          { data: 'A', text: 'A' },
        ],
      ],
    };

    mockUseExecuteQuery.mockReturnValue({
      data: rawData,
      isLoading: false,
      isError: false,
      isSuccess: true,
      status: 'success',
      error: null,
    });

    const { result } = renderHook(() =>
      useExecuteCustomWidgetQueryInternal({
        dataSource: DM.DataSource,
        dataOptions,
        filters: [],
        highlights: [],
      }),
    );

    expect(applyFormatPlainTextMock).toHaveBeenCalledTimes(1);
    expect(applyFormatPlainTextMock).toHaveBeenCalledWith(expect.anything(), 100);
    expect(result.current.data?.rows[0][0].text).toBe('formatted:100');
    expect(result.current.data?.rows[0][1].text).toBe('A');
  });
});
