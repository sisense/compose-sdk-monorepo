import { Attribute, JaqlDataSourceForDto } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import { NormalizedTable } from '../types.js';
import {
  createAttributeFromName,
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

describe('createAttributeFromName', () => {
  describe('date level validation for date-only columns', () => {
    it('should allow date-only levels on date columns', () => {
      // Test valid date-only levels
      const validDateLevels = ['Years', 'Quarters', 'Months', 'Weeks', 'Days'];

      for (const level of validDateLevels) {
        expect(() => {
          createAttributeFromName(`DM.TestTable.DateColumn.${level}`, mockDataSource, mockTables);
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
          createAttributeFromName(`DM.TestTable.DateColumn.${level}`, mockDataSource, mockTables);
        }).toThrow(
          `Invalid level "${level}" in attribute "DM.TestTable.DateColumn.${level}". Column "TestTable.DateColumn" is only a date column, not a datetime column`,
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
            mockTables,
          );
        }).not.toThrow();
      }
    });
  });
});

describe('attribute-validators', () => {
  // Mock attribute objects for testing
  const createMockAttribute = (type: string): Attribute => ({
    name: 'TestAttribute',
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
