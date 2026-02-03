import { describe, expect, test, vi } from 'vitest';

import { DataSourceInfo } from '../interfaces.js';
import { TranslatableError } from '../translation/translatable-error.js';
import { DimensionalAttribute } from './attributes.js';
import { DimensionalElement } from './base.js';
import { DimensionalDataModel } from './data-model.js';
import { DimensionalDimension } from './dimensions/dimensions.js';
import { Element } from './interfaces.js';
import { DimensionalBaseMeasure } from './measures/measures.js';

describe('DimensionalDataModel', () => {
  const mockDataSource: DataSourceInfo = {
    title: 'Sample ECommerce',
    type: 'elasticube',
  };

  const mockAttribute = new DimensionalAttribute(
    'Category',
    '[Category.Category]',
    'text-attribute',
    'Category attribute',
  );

  const mockMeasureAttribute = new DimensionalAttribute(
    'Revenue',
    '[Commerce.Revenue]',
    'numeric-attribute',
  );
  const mockMeasure = new DimensionalBaseMeasure('Total Revenue', mockMeasureAttribute, 'sum');

  const mockDimension = new DimensionalDimension(
    'Brand',
    '[Brand.Brand]',
    [mockAttribute],
    [],
    'dimension',
    'Brand dimension',
  );

  const mockMetadata: Element[] = [mockAttribute, mockMeasure, mockDimension];

  describe('constructor', () => {
    test('should create instance with valid parameters', () => {
      const model = new DimensionalDataModel('Test Model', mockDataSource, mockMetadata);

      expect(model.name).toBe('Test Model');
      expect(model.dataSource).toBe(mockDataSource);
      expect(model.metadata).toBe(mockMetadata);
      expect(model.metadata).toHaveLength(3);
    });

    test('should assign metadata elements as properties by name', () => {
      const model = new DimensionalDataModel('Test Model', mockDataSource, mockMetadata);

      expect(model.Category).toBe(mockAttribute);
      expect(model['Total Revenue']).toBe(mockMeasure); // Keep bracket notation for space in name
      expect(model.Brand).toBe(mockDimension);
    });

    test('should handle duplicate property names by adding random suffix', () => {
      const duplicateAttribute = new DimensionalAttribute(
        'Category',
        '[Category.Category2]',
        'text-attribute',
        'Duplicate category attribute',
      );

      const metadataWithDuplicate = [mockAttribute, duplicateAttribute];
      const model = new DimensionalDataModel('Test Model', mockDataSource, metadataWithDuplicate);

      expect(model.Category).toBe(mockAttribute);

      // Find the property with the random suffix
      const keys = Object.keys(model);
      const duplicateKey = keys.find((key) => key.startsWith('Category (') && key.endsWith(')'));
      expect(duplicateKey).toBeDefined();
      expect(model[duplicateKey!]).toBe(duplicateAttribute);
    });

    test('should handle empty metadata array', () => {
      const model = new DimensionalDataModel('Test Model', mockDataSource, []);

      expect(model.name).toBe('Test Model');
      expect(model.dataSource).toBe(mockDataSource);
      expect(model.metadata).toHaveLength(0);
    });

    test('should handle metadata with special characters in names', () => {
      const specialAttribute = new DimensionalAttribute(
        'Special-Name!@#$%',
        '[Special.Name]',
        'text-attribute',
      );

      const model = new DimensionalDataModel('Test Model', mockDataSource, [specialAttribute]);

      expect(model['Special-Name!@#$%']).toBe(specialAttribute);
    });

    test('should handle metadata with empty string name', () => {
      const emptyNameAttribute = new DimensionalAttribute('', '[Empty.Name]', 'text-attribute');

      const model = new DimensionalDataModel('Test Model', mockDataSource, [emptyNameAttribute]);

      expect(model['']).toBe(emptyNameAttribute);
    });

    test('should handle metadata with numeric-like names', () => {
      const numericAttribute = new DimensionalAttribute('123', '[Numeric.Name]', 'text-attribute');

      const model = new DimensionalDataModel('Test Model', mockDataSource, [numericAttribute]);

      expect(model['123']).toBe(numericAttribute);
    });

    test('should have readonly properties', () => {
      const model = new DimensionalDataModel('Test Model', mockDataSource, mockMetadata);

      // In TypeScript, readonly properties don't throw at runtime, they just prevent compilation
      // So we test that the properties are correctly set and accessible
      expect(model.name).toBe('Test Model');
      expect(model.dataSource).toBe(mockDataSource);
      expect(model.metadata).toBe(mockMetadata);

      // Test that the properties exist and are the correct values
      expect(model.name).toBeTypeOf('string');
      expect(model.dataSource).toBeTypeOf('object');
      expect(Array.isArray(model.metadata)).toBe(true);
    });
  });

  describe('fromConfig', () => {
    test('should create instance from valid config', () => {
      const config = {
        name: 'Test Model',
        dataSource: mockDataSource,
        metadata: [
          {
            type: 'attribute',
            name: 'Category',
            expression: '[Category.Category]',
          },
          {
            type: 'measure',
            name: 'Total Revenue',
            agg: 'sum',
            attribute: { name: 'Revenue', expression: '[Commerce.Revenue]' },
          },
        ],
      };

      const model = DimensionalDataModel.fromConfig(config);

      expect(model.name).toBe('Test Model');
      expect(model.dataSource).toBe(mockDataSource);
      expect(model.metadata).toHaveLength(2);
      expect(model.metadata[0]).toBeInstanceOf(DimensionalAttribute);
      expect(model.metadata[1]).toBeInstanceOf(DimensionalBaseMeasure);
    });

    test('should throw error when config is missing name', () => {
      const configWithoutName = {
        dataSource: mockDataSource,
        metadata: [
          {
            type: 'attribute',
            name: 'Category',
            expression: '[Category.Category]',
          },
        ],
      };

      expect(() => DimensionalDataModel.fromConfig(configWithoutName)).toThrow(TranslatableError);
      expect(() => DimensionalDataModel.fromConfig(configWithoutName)).toThrow(
        new TranslatableError('errors.dataModel.noName'),
      );
    });

    test('should throw error when config is missing metadata', () => {
      const configWithoutMetadata = {
        name: 'Test Model',
        dataSource: mockDataSource,
      };

      expect(() => DimensionalDataModel.fromConfig(configWithoutMetadata)).toThrow(
        TranslatableError,
      );
      expect(() => DimensionalDataModel.fromConfig(configWithoutMetadata)).toThrow(
        new TranslatableError('errors.dataModel.noMetadata'),
      );
    });

    test('should throw error when config name is empty string', () => {
      const configWithEmptyName = {
        name: '',
        dataSource: mockDataSource,
        metadata: [
          {
            type: 'attribute',
            name: 'Category',
            expression: '[Category.Category]',
          },
        ],
      };

      expect(() => DimensionalDataModel.fromConfig(configWithEmptyName)).toThrow(TranslatableError);
    });

    test('should throw error when config name is null', () => {
      const configWithNullName = {
        name: null,
        dataSource: mockDataSource,
        metadata: [
          {
            type: 'attribute',
            name: 'Category',
            expression: '[Category.Category]',
          },
        ],
      };

      expect(() => DimensionalDataModel.fromConfig(configWithNullName)).toThrow(TranslatableError);
    });

    test('should throw error when config metadata is null', () => {
      const configWithNullMetadata = {
        name: 'Test Model',
        dataSource: mockDataSource,
        metadata: null,
      };

      expect(() => DimensionalDataModel.fromConfig(configWithNullMetadata)).toThrow(
        TranslatableError,
      );
    });

    test('should handle config with empty metadata array', () => {
      const configWithEmptyMetadata = {
        name: 'Test Model',
        dataSource: mockDataSource,
        metadata: [],
      };

      const model = DimensionalDataModel.fromConfig(configWithEmptyMetadata);

      expect(model.name).toBe('Test Model');
      expect(model.dataSource).toBe(mockDataSource);
      expect(model.metadata).toHaveLength(0);
    });

    test('should handle config with mixed metadata types', () => {
      const config = {
        name: 'Mixed Model',
        dataSource: mockDataSource,
        metadata: [
          {
            type: 'attribute',
            name: 'Category',
            expression: '[Category.Category]',
          },
          {
            type: 'measure',
            name: 'Total Revenue',
            agg: 'sum',
            attribute: { name: 'Revenue', expression: '[Commerce.Revenue]' },
          },
          {
            type: 'dimension',
            name: 'Brand',
            expression: '[Brand.Brand]',
          },
          {
            type: 'filter',
            name: 'Category Filter',
            attribute: {
              name: 'Category',
              expression: '[Category.Category]',
              type: 'text-attribute',
            },
            filterType: 'members',
            members: ['Electronics', 'Clothing'],
          },
        ],
      };

      const model = DimensionalDataModel.fromConfig(config);

      expect(model.name).toBe('Mixed Model');
      expect(model.metadata).toHaveLength(4);
      expect(model.metadata[0]).toBeInstanceOf(DimensionalAttribute);
      expect(model.metadata[1]).toBeInstanceOf(DimensionalBaseMeasure);
      expect(model.metadata[2]).toBeInstanceOf(DimensionalDimension);
      // Filter would be created by the factory
    });

    test('should handle config with complex dimension structure', () => {
      const config = {
        name: 'Complex Model',
        dataSource: mockDataSource,
        metadata: [
          {
            type: 'dimension',
            name: 'Commerce',
            attributes: [
              {
                name: 'Revenue',
                expression: '[Commerce.Revenue]',
                type: 'numeric-attribute',
              },
              {
                name: 'Cost',
                expression: '[Commerce.Cost]',
                type: 'numeric-attribute',
              },
            ],
          },
        ],
      };

      const model = DimensionalDataModel.fromConfig(config);

      expect(model.name).toBe('Complex Model');
      expect(model.metadata).toHaveLength(1);
      expect(model.metadata[0]).toBeInstanceOf(DimensionalDimension);

      const commerceDimension = model.metadata[0] as DimensionalDimension;
      expect(commerceDimension.attributes).toHaveLength(2);
    });

    test('should handle null config', () => {
      // When config is null, it should throw immediately due to property access
      expect(() => DimensionalDataModel.fromConfig(null)).toThrow();
    });

    test('should handle undefined config', () => {
      // When config is undefined, it should throw immediately due to property access
      expect(() => DimensionalDataModel.fromConfig(undefined)).toThrow();
    });

    test('should handle config with large metadata array', () => {
      const largeMetadataArray = Array.from({ length: 1000 }, (_, i) => ({
        type: 'attribute',
        name: `Attribute ${i}`,
        expression: `[Table.Attribute${i}]`,
      }));

      const config = {
        name: 'Large Model',
        dataSource: mockDataSource,
        metadata: largeMetadataArray,
      };

      const model = DimensionalDataModel.fromConfig(config);

      expect(model.name).toBe('Large Model');
      expect(model.metadata).toHaveLength(1000);
      expect(model[`Attribute 0`]).toBeInstanceOf(DimensionalAttribute);
      expect(model[`Attribute 999`]).toBeInstanceOf(DimensionalAttribute);
    });

    test('should handle config with calculated measures', () => {
      const config = {
        name: 'Calculated Model',
        dataSource: mockDataSource,
        metadata: [
          {
            type: 'calculatedmeasure',
            name: 'Profit',
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
          },
        ],
      };

      const model = DimensionalDataModel.fromConfig(config);

      expect(model.name).toBe('Calculated Model');
      expect(model.metadata).toHaveLength(1);
      expect(model.metadata[0].name).toBe('Profit');
    });

    test('should handle config with date dimensions', () => {
      const config = {
        name: 'Date Model',
        dataSource: mockDataSource,
        metadata: [
          {
            type: 'datedimension',
            name: 'Order Date',
            expression: '[Orders.Date]',
            level: 'Years',
          },
        ],
      };

      const model = DimensionalDataModel.fromConfig(config);

      expect(model.name).toBe('Date Model');
      expect(model.metadata).toHaveLength(1);
      expect(model.metadata[0].name).toBe('Order Date');
    });
  });

  describe('property assignment edge cases', () => {
    test('should handle metadata with very long names', () => {
      const longName = 'A'.repeat(1000);
      const longNameAttribute = new DimensionalAttribute(longName, '[Long.Name]', 'text-attribute');

      const model = new DimensionalDataModel('Test Model', mockDataSource, [longNameAttribute]);

      expect(model[longName]).toBe(longNameAttribute);
    });

    test('should handle metadata with Unicode characters', () => {
      const unicodeAttribute = new DimensionalAttribute(
        '测试属性',
        '[Unicode.Test]',
        'text-attribute',
      );

      const model = new DimensionalDataModel('Test Model', mockDataSource, [unicodeAttribute]);

      expect(model['测试属性']).toBe(unicodeAttribute);
    });

    test('should handle metadata with JavaScript reserved words', () => {
      const reservedWordAttribute = new DimensionalAttribute(
        'constructor',
        '[Reserved.Constructor]',
        'text-attribute',
      );

      const model = new DimensionalDataModel('Test Model', mockDataSource, [reservedWordAttribute]);

      // 'constructor' is a reserved word, so it won't be overwritten
      expect(model.constructor).toBe(DimensionalDataModel);
      // But it should be in the metadata
      expect(model.metadata[0]).toBe(reservedWordAttribute);
    });

    test('should handle metadata with prototype pollution attempts', () => {
      const prototypeAttribute = new DimensionalAttribute(
        '__proto__',
        '[Prototype.Test]',
        'text-attribute',
      );

      const model = new DimensionalDataModel('Test Model', mockDataSource, [prototypeAttribute]);

      // __proto__ is a special property, so it won't be overwritten
      expect(model.__proto__).toBe(DimensionalDataModel.prototype);
      // But it should be in the metadata
      expect(model.metadata[0]).toBe(prototypeAttribute);
    });

    test('should handle multiple elements with same name after random suffix', () => {
      // Mock Math.random to return predictable values
      const originalRandom = Math.random;
      let callCount = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => {
        callCount++;
        return 0.123456789 * callCount; // Different values for each call
      });

      const attribute1 = new DimensionalAttribute('Same', '[Same.1]', 'text-attribute');
      const attribute2 = new DimensionalAttribute('Same', '[Same.2]', 'text-attribute');
      const attribute3 = new DimensionalAttribute('Same', '[Same.3]', 'text-attribute');

      const model = new DimensionalDataModel('Test Model', mockDataSource, [
        attribute1,
        attribute2,
        attribute3,
      ]);

      expect(model.Same).toBe(attribute1);

      // Find the properties with random suffixes
      const keys = Object.keys(model);
      const randomKeys = keys.filter((key) => key.startsWith('Same (') && key.endsWith(')'));
      expect(randomKeys).toHaveLength(2);

      // Restore original Math.random
      Math.random = originalRandom;
    });
  });

  describe('indexer property', () => {
    test('should allow dynamic property access', () => {
      const model = new DimensionalDataModel('Test Model', mockDataSource, mockMetadata);

      // Test that we can access properties dynamically
      const categoryKey = 'Category';
      expect(model[categoryKey]).toBe(mockAttribute);

      // Test that we can set new properties
      model.CustomProperty = 'custom value';
      expect(model.CustomProperty).toBe('custom value');
    });

    test('should handle non-string property keys', () => {
      const model = new DimensionalDataModel('Test Model', mockDataSource, mockMetadata);

      // Test numeric keys
      model[123] = 'numeric key';
      expect(model[123]).toBe('numeric key');

      // Test that we can access properties with bracket notation when needed
      expect(model['Total Revenue']).toBe(mockMeasure);
    });
  });

  describe('type compliance', () => {
    test('should implement DataModel interface', () => {
      const model = new DimensionalDataModel('Test Model', mockDataSource, mockMetadata);

      // Check that all required DataModel properties exist
      expect(typeof model.name).toBe('string');
      expect(typeof model.dataSource).toBe('object');
      expect(Array.isArray(model.metadata)).toBe(true);

      // Check that indexer works
      expect(typeof model.Category).toBe('object');
    });

    test('should have correct property types', () => {
      const model = new DimensionalDataModel('Test Model', mockDataSource, mockMetadata);

      expect(model.name).toBeTypeOf('string');
      expect(model.dataSource).toBeTypeOf('object');
      expect(Array.isArray(model.metadata)).toBe(true);

      // Check metadata elements are DimensionalElement instances
      model.metadata.forEach((element) => {
        expect(element).toBeInstanceOf(DimensionalElement);
      });
    });
  });

  describe('integration with factory', () => {
    test('should properly create elements through factory', () => {
      const config = {
        name: 'Factory Test Model',
        dataSource: mockDataSource,
        metadata: [
          {
            type: 'attribute',
            name: 'Test Attribute',
            expression: '[Test.Attribute]',
          },
        ],
      };

      const model = DimensionalDataModel.fromConfig(config);
      const createdElement = model.metadata[0];

      expect(createdElement).toBeInstanceOf(DimensionalAttribute);
      expect(createdElement.name).toBe('Test Attribute');
      expect((createdElement as DimensionalAttribute).expression).toBe('[Test.Attribute]');
    });

    test('should handle factory errors gracefully', () => {
      const config = {
        name: 'Error Test Model',
        dataSource: mockDataSource,
        metadata: [
          {
            type: 'invalid-type',
            name: 'Invalid Element',
          },
        ],
      };

      expect(() => DimensionalDataModel.fromConfig(config)).toThrow(TranslatableError);
    });
  });
});
