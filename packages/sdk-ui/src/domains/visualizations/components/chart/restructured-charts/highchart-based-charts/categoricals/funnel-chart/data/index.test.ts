import { filterFactory, measureFactory } from '@sisense/sdk-data';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { QueryDescription } from '@/domains/query-execution/core/execute-query.js';
import { ClientApplication } from '@/infra/app/client-application';

import { loadCategoricalData } from '../../helpers/data.js';
import { FunnelChartDataOptionsInternal } from '../types.js';
import { dataTranslators } from './index.js';

// Mock the loadCategoricalData function
vi.mock('../../helpers/data', () => ({
  loadCategoricalData: vi.fn(),
  getCategoricalChartDataFromTable: vi.fn(),
}));

const mockLoadCategoricalData = vi.mocked(loadCategoricalData);

describe('Funnel Chart Data Loading', () => {
  beforeEach(() => {
    mockLoadCategoricalData.mockClear();
  });

  it('should limit funnel chart data to 50 points using the decorator', async () => {
    // Mock the promise return
    mockLoadCategoricalData.mockResolvedValue({
      rows: [],
      columns: [],
    });

    const mockApp = {} as ClientApplication;
    const mockDataOptions = {} as FunnelChartDataOptionsInternal;
    const mockQueryDescription: QueryDescription = {
      dataSource: DM.DataSource,
      dimensions: [],
      measures: [],
      count: 1000, // Original count is 1000
    };

    await dataTranslators.loadData({
      app: mockApp,
      chartDataOptionsInternal: mockDataOptions,
      queryDescription: mockQueryDescription,
    });

    // Verify that the decorator wrapped loadCategoricalData and limited count to 50
    expect(mockLoadCategoricalData).toHaveBeenCalledWith({
      app: mockApp,
      chartDataOptionsInternal: mockDataOptions,
      queryDescription: {
        dataSource: DM.DataSource,
        dimensions: [],
        measures: [],
        count: 50, // Should be limited to 50 by the decorator
      },
    });
  });

  it('should preserve other query description properties while the decorator limits count', async () => {
    mockLoadCategoricalData.mockResolvedValue({
      rows: [],
      columns: [],
    });

    const mockApp = {} as ClientApplication;
    const mockDataOptions = {} as FunnelChartDataOptionsInternal;

    // Create the filter and measure objects once to avoid GUID mismatches
    const testFilter = filterFactory.equals(DM.Commerce.Gender, 'Male');
    const testMeasure = measureFactory.sum(DM.Commerce.Revenue);

    const mockQueryDescription: QueryDescription = {
      dataSource: DM.DataSource,
      dimensions: [DM.Category.Category],
      measures: [testMeasure],
      filters: [testFilter],
      count: 1000,
      offset: 10,
    };

    await dataTranslators.loadData({
      app: mockApp,
      chartDataOptionsInternal: mockDataOptions,
      queryDescription: mockQueryDescription,
    });

    // Verify that the decorator preserves all properties except count
    expect(mockLoadCategoricalData).toHaveBeenCalledWith({
      app: mockApp,
      chartDataOptionsInternal: mockDataOptions,
      queryDescription: expect.objectContaining({
        dataSource: DM.DataSource,
        dimensions: [DM.Category.Category],
        measures: [testMeasure],
        filters: [testFilter],
        count: 50, // Should be limited to 50 by the decorator
        offset: 10, // Other properties preserved by the decorator
      }),
    });
  });

  it('should apply 50-point limit even when no count is specified in the original query', async () => {
    mockLoadCategoricalData.mockResolvedValue({
      rows: [],
      columns: [],
    });

    const mockApp = {} as ClientApplication;
    const mockDataOptions = {} as FunnelChartDataOptionsInternal;
    const mockQueryDescription: QueryDescription = {
      dataSource: DM.DataSource,
      dimensions: [],
      measures: [],
      // No count specified
    };

    await dataTranslators.loadData({
      app: mockApp,
      chartDataOptionsInternal: mockDataOptions,
      queryDescription: mockQueryDescription,
    });

    // Verify that the decorator sets count to 50 even when not originally specified
    expect(mockLoadCategoricalData).toHaveBeenCalledWith({
      app: mockApp,
      chartDataOptionsInternal: mockDataOptions,
      queryDescription: {
        dataSource: DM.DataSource,
        dimensions: [],
        measures: [],
        count: 50, // Should be set to 50 by the decorator
      },
    });
  });

  it('should work as a higher-order function that decorates any load data function', async () => {
    // This test verifies the decorator pattern works correctly
    mockLoadCategoricalData.mockResolvedValue({
      rows: [],
      columns: [],
    });

    const mockApp = {} as ClientApplication;
    const mockDataOptions = {} as FunnelChartDataOptionsInternal;
    const mockQueryDescription: QueryDescription = {
      dataSource: DM.DataSource,
      dimensions: [],
      measures: [],
      count: 500,
    };

    // Call the decorated function
    await dataTranslators.loadData({
      app: mockApp,
      chartDataOptionsInternal: mockDataOptions,
      queryDescription: mockQueryDescription,
    });

    // Verify the underlying function was called with the modified query
    expect(mockLoadCategoricalData).toHaveBeenCalledTimes(1);
    expect(mockLoadCategoricalData).toHaveBeenCalledWith({
      app: mockApp,
      chartDataOptionsInternal: mockDataOptions,
      queryDescription: {
        dataSource: DM.DataSource,
        dimensions: [],
        measures: [],
        count: 50, // Decorator should override any original count
      },
    });
  });
});
