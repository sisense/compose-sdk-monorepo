import { SAMPLE_ECOMMERCE_PIVOT_TABLE } from '../../__mocks__/example-charts.js';
import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../../__mocks__/mock-data-sources.js';
import { translatePivotTableFromJSON } from './translate-pivot-table-from-json.js';
import { translatePivotTableToJSON } from './translate-pivot-table-to-json.js';

describe('translatePivotTableToJSON', () => {
  it('should round-trip pivot table JSON to props and back', () => {
    const fromResult = translatePivotTableFromJSON({
      data: SAMPLE_ECOMMERCE_PIVOT_TABLE,
      context: {
        dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
        tables: MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
      },
    });

    expect(fromResult.success).toBe(true);
    const pivotProps = fromResult.success ? fromResult.data : null;
    expect(pivotProps).not.toBeNull();

    const toResult = translatePivotTableToJSON(pivotProps!);

    expect(toResult.success).toBe(true);
    const pivotJSON = toResult.success ? toResult.data : null;
    expect(pivotJSON).not.toBeNull();
    expect(pivotJSON!.dataOptions.rows).toHaveLength(1);
    expect(pivotJSON!.dataOptions.columns).toHaveLength(1);
    expect(pivotJSON!.dataOptions.values).toHaveLength(1);
    expect(pivotJSON!.dataOptions.grandTotals).toEqual({ rows: true, columns: true });
  });

  it('should return error when dataOptions is missing', () => {
    const result = translatePivotTableToJSON({});

    expect(result.success).toBe(false);
    expect(result.success === false && result.errors[0].message).toBe('dataOptions is required');
  });
});
