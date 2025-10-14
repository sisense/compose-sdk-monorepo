import { Attribute } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import { FunctionContext } from '../types.js';
import {
  processDateFilter,
  processNumericFilter,
  processStringFilter,
  processStringOrNumericFilter,
} from './filter-processors.js';

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

const createMockContext = (pathPrefix = ''): FunctionContext => ({
  dataSource: {} as any,
  tables: [],
  pathPrefix,
});

describe('filter-processors', () => {
  describe('processStringOrNumericFilter', () => {
    it('should not throw for string attributes', () => {
      const stringAttr = createMockAttribute('text-attribute');
      const context = createMockContext();

      expect(() => {
        processStringOrNumericFilter([stringAttr, 'test'], context);
      }).not.toThrow();
    });

    it('should not throw for numeric attributes', () => {
      const numericAttr = createMockAttribute('numeric-attribute');
      const context = createMockContext();

      expect(() => {
        processStringOrNumericFilter([numericAttr, 123], context);
      }).not.toThrow();
    });

    it('should throw for date attributes', () => {
      const dateAttr = createMockAttribute('datelevel');
      const context = createMockContext();

      expect(() => {
        processStringOrNumericFilter([dateAttr, '2023-01-01'], context);
      }).toThrow('args[0]: Attribute must be string or numeric type, got date/datetime attribute');
    });
  });

  describe('processNumericFilter', () => {
    it('should not throw for numeric attributes', () => {
      const numericAttr = createMockAttribute('numeric-attribute');
      const context = createMockContext();

      expect(() => {
        processNumericFilter([numericAttr, 123], context);
      }).not.toThrow();
    });

    it('should throw for string attributes', () => {
      const stringAttr = createMockAttribute('text-attribute');
      const context = createMockContext();

      expect(() => {
        processNumericFilter([stringAttr, 'test'], context);
      }).toThrow('args[0]: Attribute must be numeric type, got text attribute');
    });

    it('should throw for date attributes', () => {
      const dateAttr = createMockAttribute('datelevel');
      const context = createMockContext();

      expect(() => {
        processNumericFilter([dateAttr, '2023-01-01'], context);
      }).toThrow('args[0]: Attribute must be numeric type, got date/datetime attribute');
    });
  });

  describe('processStringFilter', () => {
    it('should not throw for string attributes', () => {
      const stringAttr = createMockAttribute('text-attribute');
      const context = createMockContext();

      expect(() => {
        processStringFilter([stringAttr, 'test'], context);
      }).not.toThrow();
    });

    it('should throw for numeric attributes', () => {
      const numericAttr = createMockAttribute('numeric-attribute');
      const context = createMockContext();

      expect(() => {
        processStringFilter([numericAttr, 123], context);
      }).toThrow('args[0]: Attribute must be string type, got numeric attribute');
    });

    it('should throw for date attributes', () => {
      const dateAttr = createMockAttribute('datelevel');
      const context = createMockContext();

      expect(() => {
        processStringFilter([dateAttr, '2023-01-01'], context);
      }).toThrow('args[0]: Attribute must be string type, got date/datetime attribute');
    });
  });

  describe('processDateFilter', () => {
    it('should not throw for date attributes', () => {
      const dateAttr = createMockAttribute('datelevel');
      const context = createMockContext();

      expect(() => {
        processDateFilter([dateAttr, '2023-01-01'], context);
      }).not.toThrow();
    });

    it('should throw for string attributes', () => {
      const stringAttr = createMockAttribute('text-attribute');
      const context = createMockContext();

      expect(() => {
        processDateFilter([stringAttr, 'test'], context);
      }).toThrow('args[0]: Attribute must be date/datetime type, got text attribute');
    });

    it('should throw for numeric attributes', () => {
      const numericAttr = createMockAttribute('numeric-attribute');
      const context = createMockContext();

      expect(() => {
        processDateFilter([numericAttr, 123], context);
      }).toThrow('args[0]: Attribute must be date/datetime type, got numeric attribute');
    });
  });
});
