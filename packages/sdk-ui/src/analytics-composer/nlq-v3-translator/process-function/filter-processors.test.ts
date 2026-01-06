import { Attribute, Filter } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import { createSchemaIndex } from '../common.js';
import { FunctionContext } from '../types.js';
import {
  processExcludeFilter,
  processNumericFilter,
  processStringFilter,
  processStringOrNumericFilter,
} from './filter-processors.js';

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

const createMockContext = (pathPrefix = ''): FunctionContext => ({
  dataSource: {} as any,
  schemaIndex: createSchemaIndex([]),
  pathPrefix,
});

// Mock filter objects for testing
const createMockMembersFilter = (): Filter =>
  ({
    attribute: createMockAttribute('text-attribute'),
    __serializable: 'MembersFilter',
    members: ['value1', 'value2'],
    config: {},
  } as unknown as Filter);

const createMockDateRangeFilter = (): Filter =>
  ({
    attribute: createMockAttribute('datelevel'),
    __serializable: 'DateRangeFilter',
    config: {},
  } as unknown as Filter);

const createMockTextFilter = (): Filter =>
  ({
    attribute: createMockAttribute('text-attribute'),
    __serializable: 'TextFilter',
    config: {},
  } as unknown as Filter);

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

  describe('processExcludeFilter', () => {
    it('should not throw for members filter', () => {
      const membersFilter = createMockMembersFilter();
      const context = createMockContext();

      expect(() => {
        processExcludeFilter([membersFilter], context);
      }).not.toThrow();
    });

    it('should throw for dateRange filter', () => {
      const dateRangeFilter = createMockDateRangeFilter();
      const context = createMockContext();

      expect(() => {
        processExcludeFilter([dateRangeFilter], context);
      }).toThrow('args[0]: exclude filter only accepts members filter, got DateRangeFilter filter');
    });

    it('should throw for text filter', () => {
      const textFilter = createMockTextFilter();
      const context = createMockContext();

      expect(() => {
        processExcludeFilter([textFilter], context);
      }).toThrow('args[0]: exclude filter only accepts members filter, got TextFilter filter');
    });
  });
});
