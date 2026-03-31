import { JaqlDataSourceForDto } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import type { NormalizedTable } from '../../../types.js';
import { isDateLevelAttribute } from './attribute-helpers.js';
import { createAttributeFromName, createSchemaIndex } from './schema-index.js';

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
      {
        name: 'TimeColumn',
        dataType: 'time',
        expression: '[TestTable.TimeColumn]',
        description: 'Time Column',
      },
    ],
  },
];

const mockSchemaIndex = createSchemaIndex(mockTables);

describe('createAttributeFromName', () => {
  describe('date level validation for date-only columns', () => {
    it('should allow date-only levels on date columns', () => {
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
          `Invalid level '${level}' in dimensional element 'DM.TestTable.DateColumn.${level}'. Column 'TestTable.DateColumn' is only a date column, not a datetime column`,
        );
      }
    });

    it('should allow all levels on datetime columns', () => {
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

    it('should use inferredDateLevel when name has no level (datetime column)', () => {
      const attribute = createAttributeFromName(
        'DM.TestTable.DateTimeColumn',
        mockDataSource,
        mockSchemaIndex,
        { inferredDateLevel: 'Days' },
      );
      expect(attribute).toBeDefined();
      expect(isDateLevelAttribute(attribute)).toBe(true);
      expect((attribute as { granularity: string }).granularity).toBe('Days');
    });

    it('should throw for invalid inferredDateLevel', () => {
      expect(() => {
        createAttributeFromName('DM.TestTable.DateTimeColumn', mockDataSource, mockSchemaIndex, {
          inferredDateLevel: 'InvalidLevel',
        });
      }).toThrow("Invalid inferred date level 'InvalidLevel'");
    });

    it('should prefer explicit level in name over inferredDateLevel', () => {
      const attribute = createAttributeFromName(
        'DM.TestTable.DateTimeColumn.Years',
        mockDataSource,
        mockSchemaIndex,
        { inferredDateLevel: 'Days' },
      );
      expect((attribute as { granularity: string }).granularity).toBe('Years');
    });

    it('should reject inferredDateLevel time level on date-only column (matches explicit-name behavior)', () => {
      expect(() => {
        createAttributeFromName('DM.TestTable.DateColumn', mockDataSource, mockSchemaIndex, {
          inferredDateLevel: 'Hours',
        });
      }).toThrow(
        "Invalid level 'Hours' in dimensional element 'DM.TestTable.DateColumn.Hours'. Column 'TestTable.DateColumn' is only a date column, not a datetime column",
      );
    });

    it('should reject inferredDateLevel date level on time-only column (matches explicit-name behavior)', () => {
      expect(() => {
        createAttributeFromName('DM.TestTable.TimeColumn', mockDataSource, mockSchemaIndex, {
          inferredDateLevel: 'Days',
        });
      }).toThrow(
        "Invalid level 'Days' in dimensional element 'DM.TestTable.TimeColumn.Days'. Column 'TestTable.TimeColumn' is only a time column, not a date column",
      );
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

    it('should suggest similar table when table name has typo', () => {
      expect(() => {
        createAttributeFromName('DM.Comerce.Quantity.dollars', mockDataSource, schemaIndexWithDots);
      }).toThrow("Did you mean 'Commerce'?");
    });

    it('should throw error for non-existent column', () => {
      expect(() => {
        createAttributeFromName('DM.Brand.io.NonExistent', mockDataSource, schemaIndexWithDots);
      }).toThrow();
    });

    it('should suggest similar column when column name has typo', () => {
      expect(() => {
        createAttributeFromName('DM.Commerce.Quantity.dollr', mockDataSource, schemaIndexWithDots);
      }).toThrow("Did you mean 'Quantity.dollars'?");
    });

    it('should not suggest when no close match exists', () => {
      let thrown: Error | undefined;
      try {
        createAttributeFromName('DM.XYZ.Column', mockDataSource, schemaIndexWithDots);
      } catch (err) {
        thrown = err as Error;
      }
      expect(thrown).toBeDefined();
      expect(thrown?.message).not.toContain('Did you mean');
    });

    it('should not suggest same column name when only difference is trailing dot', () => {
      let thrown: Error | undefined;
      try {
        createAttributeFromName('DM.Commerce.Date.', mockDataSource, schemaIndexWithDots);
      } catch (err) {
        thrown = err as Error;
      }
      expect(thrown).toBeDefined();
      expect(thrown?.message).toContain("Column 'Date' not found in table 'Commerce'");
      expect(thrown?.message).not.toContain("Did you mean 'Date'?");
      expect(thrown?.message).toContain("Use 'Date' without a trailing dot.");
    });

    it('should suggest similar date level when date level has typo', () => {
      expect(() => {
        createAttributeFromName('DM.Commerce.Date.Yers', mockDataSource, schemaIndexWithDots);
      }).toThrow("Did you mean 'Years'?");
    });
  });

  describe('case-insensitive table and column segments', () => {
    const commerceBrandTables: NormalizedTable[] = [
      {
        name: 'Commerce',
        columns: [
          {
            name: 'Brand',
            dataType: 'text',
            expression: '[Commerce.Brand]',
            description: 'Brand',
          },
          {
            name: 'Date',
            dataType: 'datetime',
            expression: '[Commerce.Date]',
            description: 'Order date',
          },
        ],
      },
    ];
    const commerceBrandIndex = createSchemaIndex(commerceBrandTables);

    it('should resolve lowercase table/column against schema casing and keep canonical expression', () => {
      const attribute = createAttributeFromName(
        'DM.commerce.brand',
        mockDataSource,
        commerceBrandIndex,
      );
      expect(attribute.expression).toBe('[Commerce.Brand]');
    });

    it('should resolve mixed-case column with case-sensitive date level', () => {
      const attribute = createAttributeFromName(
        'DM.Commerce.date.Years',
        mockDataSource,
        commerceBrandIndex,
      );
      expect(attribute.expression).toBe('[Commerce.Date]');
      expect(isDateLevelAttribute(attribute)).toBe(true);
      expect((attribute as { granularity: string }).granularity).toBe('Years');
    });

    it('should reject date level with wrong case', () => {
      expect(() => {
        createAttributeFromName('DM.Commerce.Date.years', mockDataSource, commerceBrandIndex);
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
