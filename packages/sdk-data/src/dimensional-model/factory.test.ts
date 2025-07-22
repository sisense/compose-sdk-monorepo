import { describe, expect, test } from 'vitest';

import { TranslatableError } from '../translation/translatable-error.js';
import { DimensionalAttribute } from './attributes.js';
import { DimensionalDateDimension, DimensionalDimension } from './dimensions/dimensions.js';
import { create, createAll } from './factory.js';
import { MembersFilter, NumericFilter } from './filters/filters.js';
import { Element } from './interfaces.js';
import {
  DimensionalBaseMeasure,
  DimensionalCalculatedMeasure,
  DimensionalMeasureTemplate,
} from './measures/measures.js';

describe('factory', () => {
  describe('createAll', () => {
    test('should create array of elements from JSON array', () => {
      const items = [
        { type: 'attribute', name: 'Test Attribute', expression: '[Test.Attribute]' },
        {
          type: 'measure',
          name: 'Test Measure',
          agg: 'sum',
          attribute: { name: 'Cost', expression: '[Commerce.Cost]' },
        },
      ];

      const result = createAll(items);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(DimensionalAttribute);
      expect(result[1]).toBeInstanceOf(DimensionalBaseMeasure);
    });

    test('should handle empty array', () => {
      const result = createAll([]);

      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    test('should handle array with invalid elements', () => {
      const items = [
        { type: 'attribute', name: 'Valid Attribute', expression: '[Test.Attribute]' },
        { type: 'invalid-type', name: 'Invalid Element' },
      ];

      expect(() => createAll(items)).toThrow(TranslatableError);
    });
  });

  describe('create', () => {
    describe('array input', () => {
      test('should delegate to createAll when input is array', () => {
        const items = [
          { type: 'attribute', name: 'Test Attribute', expression: '[Test.Attribute]' },
        ];

        const result = create(items);

        expect(Array.isArray(result)).toBe(true);
        expect((result as Element[]).length).toBe(1);
        expect((result as Element[])[0]).toBeInstanceOf(DimensionalAttribute);
      });
    });

    describe('filter creation', () => {
      test('should create members filter', () => {
        const filterItem = {
          type: 'filter',
          name: 'Test Filter',
          attribute: {
            name: 'Category',
            expression: '[Category.Category]',
            type: 'text-attribute',
          },
          filterType: 'members',
          members: ['Apple', 'Samsung'],
        };

        const result = create(filterItem);

        expect(result).toBeInstanceOf(MembersFilter);
        expect((result as MembersFilter).filterType).toBe('members');
      });

      test('should create numeric filter', () => {
        const filterItem = {
          type: 'measurefilter',
          name: 'Measure Filter',
          attribute: {
            name: 'Revenue',
            expression: '[Commerce.Revenue]',
            type: 'numeric-attribute',
          },
          filterType: 'numeric',
          operatorA: 'from',
          valueA: 100,
          operatorB: 'to',
          valueB: 1000,
        };

        const result = create(filterItem);

        expect(result).toBeInstanceOf(NumericFilter);
        expect((result as NumericFilter).filterType).toBe('numeric');
      });
    });

    describe('measure creation', () => {
      test('should create base measure', () => {
        const measureItem = {
          type: 'measure',
          name: 'Test Measure',
          agg: 'sum',
          attribute: { name: 'Cost', expression: '[Commerce.Cost]' },
        };

        const result = create(measureItem);

        expect(result).toBeInstanceOf(DimensionalBaseMeasure);
        expect((result as DimensionalBaseMeasure).name).toBe('Test Measure');
        expect((result as DimensionalBaseMeasure).aggregation).toBe('sum');
      });

      test('should create calculated measure', () => {
        const measureItem = {
          type: 'calculatedmeasure',
          name: 'Calculated Measure',
          expression: '[Revenue] - [Cost]',
          context: {
            Revenue: {
              name: 'Revenue',
              expression: '[Commerce.Revenue]',
              type: 'attribute',
            },
            Cost: {
              name: 'Cost',
              expression: '[Commerce.Cost]',
              type: 'attribute',
            },
          },
        };

        const result = create(measureItem);

        expect(result).toBeInstanceOf(DimensionalCalculatedMeasure);
        expect((result as DimensionalCalculatedMeasure).name).toBe('Calculated Measure');
        expect((result as DimensionalCalculatedMeasure).expression).toBe('[Revenue] - [Cost]');
      });

      test('should create measure template', () => {
        const measureItem = {
          type: 'measuretemplate',
          name: 'Measure Template',
          agg: '*',
          attribute: { name: 'Cost', expression: '[Commerce.Cost]' },
        };

        const result = create(measureItem);

        expect(result).toBeInstanceOf(DimensionalMeasureTemplate);
        expect((result as DimensionalMeasureTemplate).name).toBe('Measure Template');
        expect((result as DimensionalMeasureTemplate).attribute.name).toBe('Cost');
      });
    });

    describe('attribute creation', () => {
      test('should create attribute', () => {
        const attributeItem = {
          type: 'attribute',
          name: 'Test Attribute',
          expression: '[Test.Attribute]',
        };

        const result = create(attributeItem);

        expect(result).toBeInstanceOf(DimensionalAttribute);
        expect((result as DimensionalAttribute).name).toBe('Test Attribute');
        expect((result as DimensionalAttribute).expression).toBe('[Test.Attribute]');
      });

      test('should create text attribute', () => {
        const attributeItem = {
          type: 'text-attribute',
          name: 'Text Attribute',
          expression: '[Category.Category]',
        };

        const result = create(attributeItem);

        expect(result).toBeInstanceOf(DimensionalAttribute);
        expect((result as DimensionalAttribute).name).toBe('Text Attribute');
        expect((result as DimensionalAttribute).type).toBe('text-attribute');
      });

      test('should create numeric attribute', () => {
        const attributeItem = {
          type: 'numeric-attribute',
          name: 'Numeric Attribute',
          expression: '[Commerce.Cost]',
        };

        const result = create(attributeItem);

        expect(result).toBeInstanceOf(DimensionalAttribute);
        expect((result as DimensionalAttribute).name).toBe('Numeric Attribute');
        expect((result as DimensionalAttribute).type).toBe('numeric-attribute');
      });
    });

    describe('dimension creation', () => {
      test('should create dimension', () => {
        const dimensionItem = {
          type: 'dimension',
          name: 'Test Dimension',
          expression: '[Test.Dimension]',
        };

        const result = create(dimensionItem);

        expect(result).toBeInstanceOf(DimensionalDimension);
        expect((result as DimensionalDimension).name).toBe('Test Dimension');
      });

      test('should create date dimension', () => {
        const dimensionItem = {
          type: 'datedimension',
          name: 'Date Dimension',
          expression: '[Commerce.Date]',
          level: 'Years',
        };

        const result = create(dimensionItem);

        expect(result).toBeInstanceOf(DimensionalDateDimension);
        expect((result as DimensionalDateDimension).name).toBe('Date Dimension');
      });

      test('should create dimension with dim property', () => {
        const dimensionItem = {
          name: 'Dimension with Dim',
          dim: '[Test.Dimension]',
        };

        const result = create(dimensionItem);

        expect(result).toBeInstanceOf(DimensionalDimension);
        expect((result as DimensionalDimension).name).toBe('Dimension with Dim');
      });

      test('should create dimension with id property', () => {
        const dimensionItem = {
          name: 'Dimension with ID',
          id: 'test-dimension-id',
          expression: '[Test.Dimension]',
        };

        const result = create(dimensionItem);

        expect(result).toBeInstanceOf(DimensionalDimension);
        expect((result as DimensionalDimension).name).toBe('Dimension with ID');
      });

      test('should create dimension with attributes', () => {
        const dimensionItem = {
          name: 'Dimension with Attributes',
          attributes: [
            { name: 'Attribute 1', expression: '[Test.Attr1]' },
            { name: 'Attribute 2', expression: '[Test.Attr2]' },
          ],
        };

        const result = create(dimensionItem);

        expect(result).toBeInstanceOf(DimensionalDimension);
        expect((result as DimensionalDimension).name).toBe('Dimension with Attributes');
        expect((result as DimensionalDimension).attributes).toHaveLength(2);
      });
    });

    describe('error handling', () => {
      test('should throw TranslatableError for unsupported element type', () => {
        const unsupportedItem = {
          type: 'unsupported-type',
          name: 'Unsupported Element',
        };

        expect(() => create(unsupportedItem)).toThrow(TranslatableError);
      });

      test('should throw error for empty object', () => {
        expect(() => create({})).toThrow(TranslatableError);
      });

      test('should throw error for object with only name', () => {
        const itemWithOnlyName = {
          name: 'Only Name',
        };

        expect(() => create(itemWithOnlyName)).toThrow(TranslatableError);
      });

      test('should throw error for primitive inputs', () => {
        expect(() => create('invalid-string')).toThrow();
        expect(() => create(123)).toThrow();
        expect(() => create(true)).toThrow();
        expect(() => create(null)).toThrow();
        expect(() => create(undefined)).toThrow();
      });
    });

    describe('type checking precedence', () => {
      test('should prioritize measure over dimension', () => {
        const measureWithDimProps = {
          type: 'measure',
          name: 'Measure with Dim Props',
          agg: 'sum',
          attribute: { name: 'Cost', expression: '[Commerce.Cost]' },
          dim: '[Test.Dimension]', // This would match dimension condition
        };

        const result = create(measureWithDimProps);
        expect(result).toBeInstanceOf(DimensionalBaseMeasure);
      });

      test('should prioritize attribute over dimension', () => {
        const attributeWithDimProps = {
          type: 'attribute',
          name: 'Attribute with Dim Props',
          expression: '[Test.Attribute]',
          dim: '[Test.Dimension]', // This would match dimension condition
        };

        const result = create(attributeWithDimProps);
        expect(result).toBeInstanceOf(DimensionalAttribute);
      });
    });
  });
});
