import {
  SAMPLE_ECOMMERCE_PIVOT_TABLE,
  SAMPLE_ECOMMERCE_PIVOT_TABLE_STYLED,
} from '../../__mocks__/example-charts.js';
import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../../__mocks__/mock-data-sources.js';
import { getErrors, getSuccessData } from '../shared/utils/translation-helpers.js';
import { translatePivotTableFromJSON } from './translate-pivot-table-from-json.js';

describe('translatePivotTableFromJSON', () => {
  it('should translate pivot table with rows, columns, values', () => {
    const result = translatePivotTableFromJSON({
      data: SAMPLE_ECOMMERCE_PIVOT_TABLE,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(true);
    const props = getSuccessData(result);
    expect(props.dataOptions).toBeDefined();
    const dataOptions = props.dataOptions as {
      rows?: unknown[];
      columns?: unknown[];
      values?: unknown[];
      grandTotals?: { rows?: boolean; columns?: boolean };
    };
    expect(dataOptions.rows).toHaveLength(1);
    expect(dataOptions.columns).toHaveLength(1);
    expect(dataOptions.values).toHaveLength(1);
    expect(dataOptions.grandTotals).toEqual({ rows: true, columns: true });
  });

  it('should translate styled dimensions and measures', () => {
    const result = translatePivotTableFromJSON({
      data: SAMPLE_ECOMMERCE_PIVOT_TABLE_STYLED,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(true);
    const props = getSuccessData(result);
    expect(props.dataOptions).toBeDefined();
    const dataOptions = props.dataOptions as { rows?: unknown[]; values?: unknown[] };
    expect(dataOptions.rows).toHaveLength(1);
    expect(dataOptions.rows![0]).toHaveProperty('column');
    expect(dataOptions.rows![0]).toHaveProperty('sortType', 'sortDesc');
    expect(dataOptions.values).toHaveLength(1);
    expect(dataOptions.values![0]).toHaveProperty('column');
    expect(dataOptions.values![0]).toHaveProperty('numberFormatConfig');
  });

  it('should return error when dataOptions is missing', () => {
    const result = translatePivotTableFromJSON({
      data: {} as Parameters<typeof translatePivotTableFromJSON>[0]['data'],
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(false);
    const errors = getErrors(result);
    expect(errors.some((e) => e.includes('dataOptions is required'))).toBe(true);
  });

  it('should pass through styleOptions', () => {
    const result = translatePivotTableFromJSON({
      data: SAMPLE_ECOMMERCE_PIVOT_TABLE,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(result.success).toBe(true);
    const props = getSuccessData(result);
    expect(props.styleOptions).toEqual({
      alternatingRowsColor: true,
      alternatingColumnsColor: false,
    });
  });
});
