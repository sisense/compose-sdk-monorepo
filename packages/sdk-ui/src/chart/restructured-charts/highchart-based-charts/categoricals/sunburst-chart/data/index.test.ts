import { describe, it, expect } from 'vitest';
import { dataTranslators } from './index';
import { SunburstChartDataOptionsInternal } from '../types';
import { DataTable } from '@/chart-data-processor/table-processor';

describe('Sunburst Data Translators', () => {
  it('should have loadData function', () => {
    expect(typeof dataTranslators.loadData).toBe('function');
  });

  it('should transform data table to chart data', () => {
    const mockDataOptions: SunburstChartDataOptionsInternal = {
      y: [{ column: { name: 'Revenue' } } as any],
      breakBy: [{ column: { name: 'Category', type: 'text' } }],
    };

    const mockDataTable: DataTable = {
      columns: [
        { name: 'Category', type: 'text', index: 0, direction: 0 },
        { name: 'Revenue', type: 'number', index: 1, direction: 0 },
        { name: '$rownum', type: 'number', index: 2, direction: 0 },
      ],
      rows: [
        [{ displayValue: 'Electronics' }, { displayValue: '1000' }, { displayValue: '1' }],
        [{ displayValue: 'Clothing' }, { displayValue: '800' }, { displayValue: '2' }],
      ],
    };

    const result = dataTranslators.getChartData(mockDataOptions, mockDataTable);
    expect(result).toBeDefined();
    expect(result.type).toBe('categorical');
  });
});
