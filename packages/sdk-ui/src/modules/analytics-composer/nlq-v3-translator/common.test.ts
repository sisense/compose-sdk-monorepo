import { Attribute, JaqlDataSourceForDto } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import { NlqTranslationError, NlqTranslationResult } from '../types.js';
import { NormalizedTable } from '../types.js';
import {
  collectTranslationErrors,
  createAttributeFromName,
  createSchemaIndex,
  isDateLevelAttribute,
  isNonDateLevelAttribute,
  isNumericAttribute,
  isTextAttribute,
  isTextOrNumericAttribute,
} from './common.js';

const mockDataSource: JaqlDataSourceForDto = {
  title: 'Test Data Source',
  address: 'LocalHost',
  id: 'test-datasource',
  live: false,
};

const mockTables: NormalizedTable[] = [
  {
    name: 'TestTable',
    columns: [
      {
        name: 'DateColumn',
        dataType: 'date',
        expression: '[TestTable.DateColumn]',
        description: 'Date Column',
      },
      {
        name: 'DateTimeColumn',
        dataType: 'datetime',
        expression: '[TestTable.DateTimeColumn]',
        description: 'DateTime Column',
      },
    ],
  },
];

const mockSchemaIndex = createSchemaIndex(mockTables);

describe('createAttributeFromName', () => {
  describe('date level validation for date-only columns', () => {
    it('should allow date-only levels on date columns', () => {
      // Test valid date-only levels
      const validDateLevels = ['Years', 'Quarters', 'Months', 'Weeks', 'Days'];

      for (const level of validDateLevels) {
        expect(() => {
          createAttributeFromName(
            `DM.TestTable.DateColumn.${level}`,
            mockDataSource,
            mockSchemaIndex,
          );
        }).not.toThrow();
      }
    });

    it('should throw error for time-only levels on date columns', () => {
      // Test invalid time-only levels on date columns
      const invalidTimeLevels = [
        'Hours',
        'MinutesRoundTo30',
        'MinutesRoundTo15',
        'Minutes',
        'Seconds',
        'AggHours',
        'AggMinutesRoundTo30',
        'AggMinutesRoundTo15',
        'AggMinutesRoundTo1',
      ];

      for (const level of invalidTimeLevels) {
        expect(() => {
          createAttributeFromName(
            `DM.TestTable.DateColumn.${level}`,
            mockDataSource,
            mockSchemaIndex,
          );
        }).toThrow(
          `Invalid level "${level}" in dimensional element "DM.TestTable.DateColumn.${level}". Column "TestTable.DateColumn" is only a date column, not a datetime column`,
        );
      }
    });

    it('should allow all levels on datetime columns', () => {
      // Test that datetime columns can use both date and time levels
      const allLevels = [
        'Years',
        'Quarters',
        'Months',
        'Weeks',
        'Days',
        'Hours',
        'MinutesRoundTo30',
        'MinutesRoundTo15',
        'Minutes',
        'Seconds',
        'AggHours',
        'AggMinutesRoundTo30',
        'AggMinutesRoundTo15',
        'AggMinutesRoundTo1',
      ];

      for (const level of allLevels) {
        expect(() => {
          createAttributeFromName(
            `DM.TestTable.DateTimeColumn.${level}`,
            mockDataSource,
            mockSchemaIndex,
          );
        }).not.toThrow();
      }
    });
  });

  describe('table and column names with dots', () => {
    const tablesWithDots: NormalizedTable[] = [
      {
        name: 'Brand.io',
        columns: [
          {
            name: 'Brand',
            dataType: 'text',
            expression: '[Brand.io.Brand]',
            description: 'Brand name',
          },
          {
            name: 'Brand.i.o.Name',
            dataType: 'text',
            expression: '[Brand.io.Brand.i.o.Name]',
            description: 'Brand name with multiple dots',
          },
        ],
      },
      {
        name: 'Commerce',
        columns: [
          {
            name: 'Quantity.dollars',
            dataType: 'numeric',
            expression: '[Commerce.Quantity.dollars]',
            description: 'Quantity in dollars',
          },
          {
            name: 'Date',
            dataType: 'datetime',
            expression: '[Commerce.Date]',
            description: 'Date column',
          },
        ],
      },
    ];
    const schemaIndexWithDots = createSchemaIndex(tablesWithDots);

    it('should parse table name with dots correctly', () => {
      const attribute = createAttributeFromName(
        'DM.Brand.io.Brand',
        mockDataSource,
        schemaIndexWithDots,
      );
      expect(attribute).toBeDefined();
      expect(attribute.expression).toBe('[Brand.io.Brand]');
    });

    it('should parse column name with dots correctly', () => {
      const attribute = createAttributeFromName(
        'DM.Commerce.Quantity.dollars',
        mockDataSource,
        schemaIndexWithDots,
      );
      expect(attribute).toBeDefined();
      expect(attribute.expression).toBe('[Commerce.Quantity.dollars]');
    });

    it('should parse multiple dots in both table and column names', () => {
      const attribute = createAttributeFromName(
        'DM.Brand.io.Brand.i.o.Name',
        mockDataSource,
        schemaIndexWithDots,
      );
      expect(attribute).toBeDefined();
      expect(attribute.expression).toBe('[Brand.io.Brand.i.o.Name]');
    });

    it('should parse date level with dotted table name', () => {
      const attribute = createAttributeFromName(
        'DM.Commerce.Date.Years',
        mockDataSource,
        schemaIndexWithDots,
      );
      expect(attribute).toBeDefined();
      expect(attribute.expression).toBe('[Commerce.Date]');
      expect(isDateLevelAttribute(attribute)).toBe(true);
    });

    it('should throw error for non-existent table', () => {
      expect(() => {
        createAttributeFromName('DM.NonExistent.Column', mockDataSource, schemaIndexWithDots);
      }).toThrow();
    });

    it('should throw error for non-existent column', () => {
      expect(() => {
        createAttributeFromName('DM.Brand.io.NonExistent', mockDataSource, schemaIndexWithDots);
      }).toThrow();
    });
  });
});

describe('createSchemaIndex', () => {
  it('should create schema index with sorted tables', () => {
    const tables: NormalizedTable[] = [
      { name: 'A', columns: [] },
      { name: 'LongTableName', columns: [] },
      { name: 'B', columns: [] },
    ];
    const index = createSchemaIndex(tables);
    expect(index.sortedTables[0].name).toBe('LongTableName');
    expect(index.sortedTables[1].name).toBe('A');
    expect(index.sortedTables[2].name).toBe('B');
  });

  it('should create schema index with sorted columns per table', () => {
    const tables: NormalizedTable[] = [
      {
        name: 'TestTable',
        columns: [
          { name: 'A', dataType: 'text', expression: '[TestTable.A]' },
          { name: 'LongColumnName', dataType: 'text', expression: '[TestTable.LongColumnName]' },
          { name: 'B', dataType: 'text', expression: '[TestTable.B]' },
        ],
      },
    ];
    const index = createSchemaIndex(tables);
    const sortedColumns = index.tableColumnMap.get('TestTable');
    expect(sortedColumns).toBeDefined();
    expect(sortedColumns![0].name).toBe('LongColumnName');
    expect(sortedColumns![1].name).toBe('A');
    expect(sortedColumns![2].name).toBe('B');
  });

  it('should create Maps for O(1) lookups', () => {
    const tables: NormalizedTable[] = [
      {
        name: 'TestTable',
        columns: [
          { name: 'Column1', dataType: 'text', expression: '[TestTable.Column1]' },
          { name: 'Column2', dataType: 'text', expression: '[TestTable.Column2]' },
        ],
      },
    ];
    const index = createSchemaIndex(tables);
    expect(index.tableMap.get('TestTable')).toBeDefined();
    expect(index.columnMap.get('TestTable')?.get('Column1')).toBeDefined();
    expect(index.columnMap.get('TestTable')?.get('Column2')).toBeDefined();
  });
});

describe('attribute-validators', () => {
  // Mock attribute objects for testing
  const createMockAttribute = (type: string): Attribute => ({
    name: 'TestAttribute',
    title: 'TestAttribute',
    type,
    description: 'Test attribute',
    id: 'test-id',
    expression: '[Test.Column]',
    getSort: () => 0,
    sort: () => createMockAttribute(type),
    serialize: () => ({}),
    toJSON: () => ({}),
    jaql: () => ({}),
    __serializable: 'DimensionalAttribute',
  });
  describe('isTextAttribute', () => {
    it('should return true for text attributes', () => {
      const textAttr = createMockAttribute('text-attribute');
      expect(isTextAttribute(textAttr)).toBe(true);
    });

    it('should return false for numeric attributes', () => {
      const numericAttr = createMockAttribute('numeric-attribute');
      expect(isTextAttribute(numericAttr)).toBe(false);
    });

    it('should return false for date level attributes', () => {
      const dateAttr = createMockAttribute('datelevel');
      expect(isTextAttribute(dateAttr)).toBe(false);
    });
  });

  describe('isNumericAttribute', () => {
    it('should return true for numeric attributes', () => {
      const numericAttr = createMockAttribute('numeric-attribute');
      expect(isNumericAttribute(numericAttr)).toBe(true);
    });

    it('should return false for text attributes', () => {
      const textAttr = createMockAttribute('text-attribute');
      expect(isNumericAttribute(textAttr)).toBe(false);
    });

    it('should return false for date level attributes', () => {
      const dateAttr = createMockAttribute('datelevel');
      expect(isNumericAttribute(dateAttr)).toBe(false);
    });
  });

  describe('isDateLevelAttribute', () => {
    it('should return true for date level attributes', () => {
      const dateAttr = createMockAttribute('datelevel');
      expect(isDateLevelAttribute(dateAttr)).toBe(true);
    });

    it('should return false for text attributes', () => {
      const textAttr = createMockAttribute('text-attribute');
      expect(isDateLevelAttribute(textAttr)).toBe(false);
    });

    it('should return false for numeric attributes', () => {
      const numericAttr = createMockAttribute('numeric-attribute');
      expect(isDateLevelAttribute(numericAttr)).toBe(false);
    });
  });

  describe('isTextOrNumericAttribute', () => {
    it('should return true for text attributes', () => {
      const textAttr = createMockAttribute('text-attribute');
      expect(isTextOrNumericAttribute(textAttr)).toBe(true);
    });

    it('should return true for numeric attributes', () => {
      const numericAttr = createMockAttribute('numeric-attribute');
      expect(isTextOrNumericAttribute(numericAttr)).toBe(true);
    });

    it('should return false for date level attributes', () => {
      const dateAttr = createMockAttribute('datelevel');
      expect(isTextOrNumericAttribute(dateAttr)).toBe(false);
    });
  });

  describe('isNonDateLevelAttribute', () => {
    it('should return true for text attributes', () => {
      const textAttr = createMockAttribute('text-attribute');
      expect(isNonDateLevelAttribute(textAttr)).toBe(true);
    });

    it('should return true for numeric attributes', () => {
      const numericAttr = createMockAttribute('numeric-attribute');
      expect(isNonDateLevelAttribute(numericAttr)).toBe(true);
    });

    it('should return false for date level attributes', () => {
      const dateAttr = createMockAttribute('datelevel');
      expect(isNonDateLevelAttribute(dateAttr)).toBe(false);
    });
  });
});

describe('collectTranslationErrors', () => {
  it('should return data when translation succeeds', () => {
    const errors: NlqTranslationError[] = [];
    const successResult: NlqTranslationResult<string> = {
      success: true,
      data: 'test-data',
    };

    const result = collectTranslationErrors(() => successResult, errors);

    expect(result).toBe('test-data');
    expect(errors).toHaveLength(0);
  });

  it('should return null and collect errors when translation fails', () => {
    const errors: NlqTranslationError[] = [];
    const errorResult: NlqTranslationResult<string> = {
      success: false,
      errors: [
        {
          category: 'dimensions',
          index: 0,
          input: 'DM.Invalid.Attribute',
          message: 'Invalid attribute',
        },
      ],
    };

    const result = collectTranslationErrors(() => errorResult, errors);

    expect(result).toBeNull();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toEqual({
      category: 'dimensions',
      index: 0,
      input: 'DM.Invalid.Attribute',
      message: 'Invalid attribute',
    });
  });

  it('should accumulate multiple errors from multiple failed translations', () => {
    const errors: NlqTranslationError[] = [];
    const errorResult1: NlqTranslationResult<string> = {
      success: false,
      errors: [
        {
          category: 'dimensions',
          index: 0,
          input: 'DM.Invalid.Attribute1',
          message: 'Invalid attribute 1',
        },
      ],
    };
    const errorResult2: NlqTranslationResult<number> = {
      success: false,
      errors: [
        {
          category: 'measures',
          index: 1,
          input: 'measureFactory.invalid',
          message: 'Invalid measure',
        },
        {
          category: 'measures',
          index: 2,
          input: 'measureFactory.anotherInvalid',
          message: 'Another invalid measure',
        },
      ],
    };

    collectTranslationErrors(() => errorResult1, errors);
    collectTranslationErrors(() => errorResult2, errors);

    expect(errors).toHaveLength(3);
    expect(errors[0].message).toBe('Invalid attribute 1');
    expect(errors[1].message).toBe('Invalid measure');
    expect(errors[2].message).toBe('Another invalid measure');
  });

  it('should handle mixed success and failure results', () => {
    const errors: NlqTranslationError[] = [];
    const successResult: NlqTranslationResult<string> = {
      success: true,
      data: 'success-data',
    };
    const errorResult: NlqTranslationResult<number> = {
      success: false,
      errors: [
        {
          category: 'filters',
          index: 0,
          input: 'filterFactory.invalid',
          message: 'Invalid filter',
        },
      ],
    };

    const success = collectTranslationErrors(() => successResult, errors);
    const failure = collectTranslationErrors(() => errorResult, errors);

    expect(success).toBe('success-data');
    expect(failure).toBeNull();
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('Invalid filter');
  });

  it('should work with generic types', () => {
    const errors: NlqTranslationError[] = [];
    const successResult: NlqTranslationResult<{ value: number }> = {
      success: true,
      data: { value: 42 },
    };

    const result = collectTranslationErrors(() => successResult, errors);

    expect(result).toEqual({ value: 42 });
    expect(errors).toHaveLength(0);
  });
});
