import { Sort } from '@sisense/sdk-data';

import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../../../__mocks__/mock-data-sources.js';
import { createSchemaIndex } from '../../shared/utils/schema-index.js';
import { getErrors, getSuccessData } from '../../shared/utils/translation-helpers.js';
import type { MeasureItemJSON } from '../../types.js';
import { translateMeasuresFromJSON } from './translate-measures-from-json.js';

const MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE = createSchemaIndex(
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
);

describe('translateMeasures', () => {
  describe('translateMeasuresFromJSON', () => {
    it('should return empty array when measuresJSON is null', () => {
      const result = translateMeasuresFromJSON({
        data: null as unknown as MeasureItemJSON[],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return empty array when measuresJSON is undefined', () => {
      const result = translateMeasuresFromJSON({
        data: undefined as unknown as MeasureItemJSON[],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return empty array when measuresJSON is false', () => {
      const result = translateMeasuresFromJSON({
        data: false as unknown as MeasureItemJSON[],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return empty array when measuresJSON is 0', () => {
      const result = translateMeasuresFromJSON({
        data: 0 as unknown as MeasureItemJSON[],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return empty array when measuresJSON is empty string', () => {
      const result = translateMeasuresFromJSON({
        data: '' as unknown as MeasureItemJSON[],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should translate empty array to empty array', () => {
      const result = translateMeasuresFromJSON({
        data: [],
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });
      expect(result.success).toBe(true);
      expect(getSuccessData(result)).toEqual([]);
    });

    it('should return error for array of strings instead of function calls', () => {
      const invalidMeasuresJSON = [
        'DM.Commerce.Revenue',
        'DM.Commerce.Cost',
      ] as unknown as MeasureItemJSON[];

      const result = translateMeasuresFromJSON({
        data: invalidMeasuresJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        "Invalid measure item. Expected a function call (function/args) or object with 'column' and optional 'sortType'.",
      );
    });

    it('should return error for array of objects missing function property', () => {
      const invalidMeasuresJSON = [
        { args: ['DM.Commerce.Revenue', 'Total Revenue'] },
      ] as unknown as MeasureItemJSON[];

      const result = translateMeasuresFromJSON({
        data: invalidMeasuresJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        "Invalid measure item. Expected a function call (function/args) or object with 'column' and optional 'sortType'.",
      );
    });

    it('should return error for array of objects missing args property', () => {
      const invalidMeasuresJSON = [
        { function: 'measureFactory.sum' },
      ] as unknown as MeasureItemJSON[];

      const result = translateMeasuresFromJSON({
        data: invalidMeasuresJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        "Invalid measure item. Expected a function call (function/args) or object with 'column' and optional 'sortType'.",
      );
    });

    it('should return error for array containing non-objects', () => {
      const invalidMeasuresJSON = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
        'not an object',
      ] as unknown as MeasureItemJSON[];

      const result = translateMeasuresFromJSON({
        data: invalidMeasuresJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        "Invalid measure item. Expected a function call (function/args) or object with 'column' and optional 'sortType'.",
      );
    });

    it('should return error for array containing null values', () => {
      const invalidMeasuresJSON = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
        null,
      ] as unknown as MeasureItemJSON[];

      const result = translateMeasuresFromJSON({
        data: invalidMeasuresJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        "Invalid measure item. Expected a function call (function/args) or object with 'column' and optional 'sortType'.",
      );
    });

    it('should return error for array containing boolean values', () => {
      const invalidMeasuresJSON = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
        true,
      ] as unknown as MeasureItemJSON[];

      const result = translateMeasuresFromJSON({
        data: invalidMeasuresJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(false);
      expect(getErrors(result)).toContain(
        "Invalid measure item. Expected a function call (function/args) or object with 'column' and optional 'sortType'.",
      );
    });

    it('should return enriched format for styled measure with sortType (measure has no sort applied)', () => {
      const mockMeasuresJSON = [
        {
          column: {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Cost', 'Total Cost'],
          },
          sortType: 'sortDesc' as const,
        },
      ];

      const result = translateMeasuresFromJSON({
        data: mockMeasuresJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(true);
      const data = getSuccessData(result);
      expect(data).toHaveLength(1);
      expect(data[0]).toHaveProperty('measure');
      expect(data[0].style).toMatchObject({ sortType: 'sortDesc' });
      expect(data[0].measure.getSort()).toBe(Sort.None);
    });

    it('should return enriched format for plain FunctionCall (no style)', () => {
      const mockMeasuresJSON = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
      ];

      const result = translateMeasuresFromJSON({
        data: mockMeasuresJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(true);
      const data = getSuccessData(result);
      expect(data).toHaveLength(1);
      expect(data[0]).toHaveProperty('measure');
      expect(data[0]).not.toHaveProperty('style');
    });

    it('should translate valid parsed function call array', () => {
      const validMeasuresJSON = [
        { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
        { function: 'measureFactory.count', args: ['DM.Commerce.Revenue'] },
      ];

      const result = translateMeasuresFromJSON({
        data: validMeasuresJSON,
        context: {
          dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
          schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
        },
      });

      expect(result.success).toBe(true);
      const data = getSuccessData(result);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(2);
    });

    describe('numeric measure type validation', () => {
      const NUMERIC_ONLY_FUNCTIONS = [
        'measureFactory.sum',
        'measureFactory.avg',
        'measureFactory.average',
        'measureFactory.stdev',
        'measureFactory.variance',
        'measureFactory.median',
      ];

      it.each(NUMERIC_ONLY_FUNCTIONS)('%s should succeed with a numeric attribute', (fn) => {
        const result = translateMeasuresFromJSON({
          data: [{ function: fn, args: ['DM.Commerce.Revenue'] }],
          context: {
            dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
            schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
          },
        });
        expect(result.success).toBe(true);
      });

      it.each(NUMERIC_ONLY_FUNCTIONS)('%s should error when given a text attribute', (fn) => {
        const result = translateMeasuresFromJSON({
          data: [{ function: fn, args: ['DM.Commerce.Gender'] }],
          context: {
            dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
            schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
          },
        });
        expect(result.success).toBe(false);
        expect(getErrors(result)).toEqual(
          expect.arrayContaining([expect.stringContaining('Attribute must be numeric type')]),
        );
      });

      it('measureFactory.count should accept a text attribute', () => {
        const result = translateMeasuresFromJSON({
          data: [{ function: 'measureFactory.count', args: ['DM.Commerce.Gender'] }],
          context: {
            dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
            schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
          },
        });
        expect(result.success).toBe(true);
      });

      it('measureFactory.min should accept a text attribute', () => {
        const result = translateMeasuresFromJSON({
          data: [{ function: 'measureFactory.min', args: ['DM.Commerce.Gender'] }],
          context: {
            dataSource: MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
            schemaIndex: MOCK_SCHEMA_INDEX_SAMPLE_ECOMMERCE,
          },
        });
        expect(result.success).toBe(true);
      });
    });
  });
});
