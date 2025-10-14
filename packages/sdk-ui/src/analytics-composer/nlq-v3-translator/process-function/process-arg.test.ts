import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ArgInput, FunctionContext } from '../types.js';
import { processArg } from './process-arg.js';

// Mock dependencies
vi.mock('../common.js', () => ({
  createAttributeFromName: vi.fn().mockReturnValue({ __serializable: 'DimensionalAttribute' }),
}));

vi.mock('./process-node.js', () => ({
  processNode: vi.fn().mockReturnValue({ __serializable: 'ProcessedNode' }),
}));

// Mock context for testing
const createMockContext = (pathPrefix = 'test'): FunctionContext => ({
  dataSource: { id: 'test', title: 'Test', address: 'localhost' } as any,
  tables: [],
  pathPrefix,
});

describe('processArg', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic types', () => {
    it('should process string type', () => {
      const input: ArgInput = {
        data: 'test string',
        context: {
          argSchema: { type: 'string', required: true },
          ...createMockContext(),
        },
      };

      expect(processArg(input)).toBe('test string');
    });

    it('should throw error for invalid string type', () => {
      const input: ArgInput = {
        data: 123,
        context: {
          argSchema: { type: 'string', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow('testArg: Expected string, got number');
    });

    it('should process number type', () => {
      const input: ArgInput = {
        data: 42,
        context: {
          argSchema: { type: 'number', required: true },
          ...createMockContext(),
        },
      };

      expect(processArg(input)).toBe(42);
    });

    it('should throw error for invalid number type', () => {
      const input: ArgInput = {
        data: 'not a number',
        context: {
          argSchema: { type: 'number', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow('testArg: Expected number, got string');
    });

    it('should process boolean type', () => {
      const input: ArgInput = {
        data: true as any,
        context: {
          argSchema: { type: 'boolean', required: true },
          ...createMockContext(),
        },
      };

      expect(processArg(input)).toBe(true);
    });

    it('should throw error for invalid boolean type', () => {
      const input: ArgInput = {
        data: 'not a boolean' as any,
        context: {
          argSchema: { type: 'boolean', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow('testArg: Expected boolean, got string');
    });
  });

  describe('Array types', () => {
    it('should process string[] type', () => {
      const input: ArgInput = {
        data: ['string1', 'string2'],
        context: {
          argSchema: { type: 'string[]', required: true },
          ...createMockContext(),
        },
      };

      expect(processArg(input)).toEqual(['string1', 'string2']);
    });

    it('should throw error for invalid string[] type - not array', () => {
      const input: ArgInput = {
        data: 'not an array',
        context: {
          argSchema: { type: 'string[]', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow(
        'testArg: Expected array of strings, got string. Example: ["value1", "value2"]',
      );
    });

    it('should throw error for invalid string[] type - mixed types', () => {
      const input: ArgInput = {
        data: ['string1', 123 as any, 'string2'],
        context: {
          argSchema: { type: 'string[]', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow(
        'testArg: Expected array of strings, but contains non-string values',
      );
    });

    it('should process number[] type', () => {
      const input: ArgInput = {
        data: [1, 2, 3] as any,
        context: {
          argSchema: { type: 'number[]', required: true },
          ...createMockContext(),
        },
      };

      expect(processArg(input)).toEqual([1, 2, 3]);
    });

    it('should throw error for invalid number[] type - not array', () => {
      const input: ArgInput = {
        data: 123,
        context: {
          argSchema: { type: 'number[]', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow(
        'testArg: Expected array of numbers, got number. Example: [10, 20]',
      );
    });

    it('should throw error for invalid number[] type - mixed types', () => {
      const input: ArgInput = {
        data: [1, 'string' as any, 3],
        context: {
          argSchema: { type: 'number[]', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow(
        'testArg: Expected array of numbers, but contains non-number values',
      );
    });
  });

  describe('Union types', () => {
    it('should process string | number type with string', () => {
      const input: ArgInput = {
        data: 'test',
        context: {
          argSchema: { type: 'string | number', required: true },
          ...createMockContext(),
        },
      };

      expect(processArg(input)).toBe('test');
    });

    it('should process string | number type with number', () => {
      const input: ArgInput = {
        data: 42,
        context: {
          argSchema: { type: 'string | number', required: true },
          ...createMockContext(),
        },
      };

      expect(processArg(input)).toBe(42);
    });

    it('should throw error for invalid string | number type', () => {
      const input: ArgInput = {
        data: true as any,
        context: {
          argSchema: { type: 'string | number', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow('testArg: Expected string or number, got boolean');
    });
  });

  describe('Date | string type', () => {
    it('should accept valid ISO date strings', () => {
      const validDateStrings = [
        '2024-01-01',
        '2024-12-31',
        '2024-01-01T10:30:00',
        '2024-01-01T10:30:00Z',
        '2024-01-01T10:30:00.123Z',
        '2024-01-01T10:30:00+05:00',
        '2024-01-01T10:30:00-05:00',
        '2024-01-01T10:30:00.123+05:00',
        '2024-01-01T10:30:00.123-05:00',
      ];

      validDateStrings.forEach((dateString) => {
        const input: ArgInput = {
          data: dateString,
          context: {
            argSchema: { type: 'Date | string', required: true },
            ...createMockContext(),
          },
        };

        expect(() => processArg(input)).not.toThrow();
        expect(processArg(input)).toBe(dateString);
      });
    });

    it('should accept Date objects', () => {
      const date = new Date('2024-01-01T10:30:00Z');
      const input: ArgInput = {
        data: date as any,
        context: {
          argSchema: { type: 'Date | string', required: true },
          ...createMockContext(),
        },
      };

      expect(() => processArg(input)).not.toThrow();
      expect(processArg(input)).toBe(date);
    });

    it('should throw error for invalid date strings', () => {
      const invalidDateStrings = [
        '00:30:00',
        'not-a-date',
        '2024-13-01', // Invalid month
        '2024-01-32', // Invalid day
        '2024-01-01T25:00:00', // Invalid hour
        '2024-01-01T10:60:00', // Invalid minute
        '2024-01-01T10:30:60', // Invalid second
        '2024-01-01T10:30:00+25:00', // Invalid timezone
        '2024-01-01T10:30:00+05:60', // Invalid timezone minute
        'invalid-format',
        '2024/01/01', // Wrong separator
        '01-01-2024', // Wrong order
      ];

      invalidDateStrings.forEach((invalidDateString) => {
        const input: ArgInput = {
          data: invalidDateString,
          context: {
            argSchema: { type: 'Date | string', required: true },
            ...createMockContext('testArg'),
          },
        };

        expect(() => processArg(input)).toThrow(
          `testArg: Expected valid ISO date string or Date object, got invalid date string "${invalidDateString}"`,
        );
      });
    });
  });

  describe('Attribute types', () => {
    it('should process Attribute type with valid DM prefix', () => {
      const input: ArgInput = {
        data: 'DM.Commerce.Revenue',
        context: {
          argSchema: { type: 'Attribute', required: true },
          ...createMockContext(),
        },
      };

      const result = processArg(input);
      expect(result).toEqual({ __serializable: 'DimensionalAttribute' });
    });

    it('should throw error for Attribute type without DM prefix', () => {
      const input: ArgInput = {
        data: 'Commerce.Revenue',
        context: {
          argSchema: { type: 'Attribute', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow(
        'testArg: Invalid attribute "Commerce.Revenue". Expected format: "DM.TableName.ColumnName[.Level]"',
      );
    });

    it('should throw error for Attribute type with non-string', () => {
      const input: ArgInput = {
        data: 123,
        context: {
          argSchema: { type: 'Attribute', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow(
        'testArg: Expected attribute string, got number. Example: "DM.Commerce.Revenue"',
      );
    });

    it('should process Attribute[] type', () => {
      const input: ArgInput = {
        data: ['DM.Commerce.Revenue', 'DM.Commerce.Cost'] as any,
        context: {
          argSchema: { type: 'Attribute[]', required: true },
          ...createMockContext(),
        },
      };

      const result = processArg(input);
      expect(result).toEqual([
        { __serializable: 'DimensionalAttribute' },
        { __serializable: 'DimensionalAttribute' },
      ]);
    });

    it('should throw error for Attribute[] type with non-array', () => {
      const input: ArgInput = {
        data: 'DM.Commerce.Revenue',
        context: {
          argSchema: { type: 'Attribute[]', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow(
        'testArg: Expected array of attributes, got string. Example: ["DM.Commerce.AgeRange"]',
      );
    });

    it('should throw error for Attribute[] type with non-string item', () => {
      const input: ArgInput = {
        data: ['DM.Commerce.Revenue', 123 as any],
        context: {
          argSchema: { type: 'Attribute[]', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow('testArg[1]: Expected attribute string, got number');
    });
  });

  describe('Measure types', () => {
    it('should process Measure type with function call', () => {
      const input: ArgInput = {
        data: { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue'] },
        context: {
          argSchema: { type: 'Measure', required: true },
          ...createMockContext(),
        },
      };

      const result = processArg(input);
      expect(result).toEqual({ __serializable: 'ProcessedNode' });
    });

    it('should throw error for Measure type without function call', () => {
      const input: ArgInput = {
        data: 'not a function call',
        context: {
          argSchema: { type: 'Measure', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow(
        'testArg: Expected measure function call, got string. Example: {"function": "measureFactory.sum", "args": ["DM.Commerce.Revenue"]}',
      );
    });

    it('should process BaseMeasure type', () => {
      const input: ArgInput = {
        data: { function: 'measureFactory.avg', args: ['DM.Commerce.Revenue'] },
        context: {
          argSchema: { type: 'BaseMeasure', required: true },
          ...createMockContext(),
        },
      };

      const result = processArg(input);
      expect(result).toEqual({ __serializable: 'ProcessedNode' });
    });

    it('should process Measure[] type', () => {
      const input: ArgInput = {
        data: [
          { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue'] },
          { function: 'measureFactory.avg', args: ['DM.Commerce.Cost'] },
        ] as any,
        context: {
          argSchema: { type: 'Measure[]', required: true },
          ...createMockContext(),
        },
      };

      const result = processArg(input);
      expect(result).toEqual([
        { __serializable: 'ProcessedNode' },
        { __serializable: 'ProcessedNode' },
      ]);
    });

    it('should throw error for Measure[] type with non-array', () => {
      const input: ArgInput = {
        data: { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue'] },
        context: {
          argSchema: { type: 'Measure[]', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow(
        'testArg: Expected array of measure function calls, got object',
      );
    });

    it('should throw error for Measure[] type with non-function call item', () => {
      const input: ArgInput = {
        data: [
          { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue'] },
          'not a function call' as any,
        ] as any,
        context: {
          argSchema: { type: 'Measure[]', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow(
        'testArg[1]: Expected measure function call, got string',
      );
    });
  });

  describe('Filter types', () => {
    it('should process Filter type with function call', () => {
      const input: ArgInput = {
        data: { function: 'filterFactory.equals', args: ['DM.Brand.Brand', 'Apple'] },
        context: {
          argSchema: { type: 'Filter', required: true },
          ...createMockContext(),
        },
      };

      const result = processArg(input);
      expect(result).toEqual({ __serializable: 'ProcessedNode' });
    });

    it('should throw error for Filter type without function call', () => {
      const input: ArgInput = {
        data: 'not a function call',
        context: {
          argSchema: { type: 'Filter', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow(
        'testArg: Expected filter function call, got string. Example: {"function": "filterFactory.contains", "args": ["DM.Brand.Brand", "Apple"]}',
      );
    });

    it('should process Filter[] type', () => {
      const input: ArgInput = {
        data: [
          { function: 'filterFactory.equals', args: ['DM.Brand.Brand', 'Apple'] },
          { function: 'filterFactory.contains', args: ['DM.Category.Category', 'Electronics'] },
        ] as any,
        context: {
          argSchema: { type: 'Filter[]', required: true },
          ...createMockContext(),
        },
      };

      const result = processArg(input);
      expect(result).toEqual([
        { __serializable: 'ProcessedNode' },
        { __serializable: 'ProcessedNode' },
      ]);
    });

    it('should throw error for Filter[] type with non-array', () => {
      const input: ArgInput = {
        data: { function: 'filterFactory.equals', args: ['DM.Brand.Brand', 'Apple'] },
        context: {
          argSchema: { type: 'Filter[]', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow(
        'testArg: Expected array of filter function calls, got object',
      );
    });

    it('should process FilterRelationsNode type with single filter', () => {
      const input: ArgInput = {
        data: { function: 'filterFactory.equals', args: ['DM.Brand.Brand', 'Apple'] },
        context: {
          argSchema: { type: 'FilterRelationsNode', required: true },
          ...createMockContext(),
        },
      };

      const result = processArg(input);
      expect(result).toEqual({ __serializable: 'ProcessedNode' });
    });

    it('should process FilterRelationsNode type with array of filters', () => {
      const input: ArgInput = {
        data: [
          { function: 'filterFactory.equals', args: ['DM.Brand.Brand', 'Apple'] },
          { function: 'filterFactory.contains', args: ['DM.Category.Category', 'Electronics'] },
        ] as any,
        context: {
          argSchema: { type: 'FilterRelationsNode', required: true },
          ...createMockContext(),
        },
      };

      const result = processArg(input);
      expect(result).toEqual([
        { __serializable: 'ProcessedNode' },
        { __serializable: 'ProcessedNode' },
      ]);
    });

    it('should throw error for FilterRelationsNode type with invalid input', () => {
      const input: ArgInput = {
        data: 'not a filter',
        context: {
          argSchema: { type: 'FilterRelationsNode', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow(
        'testArg: Expected filter function call or array of filters, got string',
      );
    });
  });

  describe('Special attribute types', () => {
    it('should process DateDimension type', () => {
      const input: ArgInput = {
        data: 'DM.Commerce.Date.Years',
        context: {
          argSchema: { type: 'DateDimension', required: true },
          ...createMockContext(),
        },
      };

      const result = processArg(input);
      expect(result).toEqual({ __serializable: 'DimensionalAttribute' });
    });

    it('should process LevelAttribute type', () => {
      const input: ArgInput = {
        data: 'DM.Commerce.Date.Years',
        context: {
          argSchema: { type: 'LevelAttribute', required: true },
          ...createMockContext(),
        },
      };

      const result = processArg(input);
      expect(result).toEqual({ __serializable: 'DimensionalAttribute' });
    });

    it('should throw error for DateDimension type with non-string', () => {
      const input: ArgInput = {
        data: 123,
        context: {
          argSchema: { type: 'DateDimension', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow(
        'testArg: Expected date attribute string, got number. Example: "DM.Commerce.Date.Years"',
      );
    });
  });

  describe('Measure | number type', () => {
    it('should process Measure | number type with number', () => {
      const input: ArgInput = {
        data: 42,
        context: {
          argSchema: { type: 'Measure | number', required: true },
          ...createMockContext(),
        },
      };

      expect(processArg(input)).toBe(42);
    });

    it('should process Measure | number type with function call', () => {
      const input: ArgInput = {
        data: { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue'] },
        context: {
          argSchema: { type: 'Measure | number', required: true },
          ...createMockContext(),
        },
      };

      const result = processArg(input);
      expect(result).toEqual({ __serializable: 'ProcessedNode' });
    });

    it('should throw error for Measure | number type with invalid input', () => {
      const input: ArgInput = {
        data: 'not a number or measure',
        context: {
          argSchema: { type: 'Measure | number', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow(
        'testArg: Expected measure function call or number, got string',
      );
    });
  });

  describe('Config types', () => {
    it('should process BaseFilterConfig type', () => {
      const config = { some: 'config' };
      const input: ArgInput = {
        data: config as any,
        context: {
          argSchema: { type: 'BaseFilterConfig', required: true },
          ...createMockContext(),
        },
      };

      expect(processArg(input)).toBe(config);
    });

    it('should process MembersFilterConfig type', () => {
      const config = { members: ['member1', 'member2'] };
      const input: ArgInput = {
        data: config as any,
        context: {
          argSchema: { type: 'MembersFilterConfig', required: true },
          ...createMockContext(),
        },
      };

      expect(processArg(input)).toBe(config);
    });

    it('should process CustomFormulaContext type', () => {
      const context = { formula: 'x + y' };
      const input: ArgInput = {
        data: context as any,
        context: {
          argSchema: { type: 'CustomFormulaContext', required: true },
          ...createMockContext(),
        },
      };

      expect(processArg(input)).toBe(context);
    });

    it('should process any type', () => {
      const anyValue = { complex: 'object', with: [1, 2, 3] };
      const input: ArgInput = {
        data: anyValue as any,
        context: {
          argSchema: { type: 'any', required: true },
          ...createMockContext(),
        },
      };

      expect(processArg(input)).toBe(anyValue);
    });

    it('should throw error for required config type with null', () => {
      const input: ArgInput = {
        data: null as any,
        context: {
          argSchema: { type: 'BaseFilterConfig', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow('testArg: Required argument is null/undefined');
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined argument when not required', () => {
      const input: ArgInput = {
        data: undefined as any,
        context: {
          argSchema: { type: 'string', required: false },
          ...createMockContext(),
        },
      };

      expect(processArg(input)).toBeUndefined();
    });

    it('should throw error for undefined argument when required', () => {
      const input: ArgInput = {
        data: undefined as any,
        context: {
          argSchema: { type: 'string', required: true },
          ...createMockContext('testArg'),
        },
      };

      expect(() => processArg(input)).toThrow(
        'testArg: Required argument is missing (expected string)',
      );
    });

    it('should handle unknown type as fallback', () => {
      const input: ArgInput = {
        data: 'some value',
        context: {
          argSchema: { type: 'UnknownType' as any, required: true },
          ...createMockContext(),
        },
      };

      expect(processArg(input)).toBe('some value');
    });
  });
});
