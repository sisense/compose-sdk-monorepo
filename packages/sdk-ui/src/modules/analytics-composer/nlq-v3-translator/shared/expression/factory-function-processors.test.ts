/**
 * Integration tests for the factory function processing registry system
 */
import { describe, expect, it, vi } from 'vitest';

import { FunctionContext, ProcessedArg } from '../../types.js';
import { createSchemaIndex } from '../utils/schema-index.js';
import {
  FUNCTION_PROCESSORS,
  getCustomProcessor,
  getFunctionsWithCustomProcessing,
  hasCustomProcessing,
} from './factory-function-processors.js';

// Mock the createAttributeFromName function (used by process-custom-formula)
vi.mock('../utils/schema-index.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/schema-index.js')>();
  return {
    ...actual,
    createAttributeFromName: vi
      .fn()
      .mockReturnValue({ type: 'numeric-attribute', name: 'mockProcessedAttribute' }),
  };
});

describe('factory-function-processors', () => {
  describe('processing registry', () => {
    it('should have customFormula processor registered', () => {
      expect(hasCustomProcessing('measureFactory.customFormula')).toBe(true);
      expect(getCustomProcessor('measureFactory.customFormula')).toBeDefined();
    });

    it('should have measuredValue processor registered', () => {
      expect(hasCustomProcessing('measureFactory.measuredValue')).toBe(true);
      expect(getCustomProcessor('measureFactory.measuredValue')).toBeDefined();
    });

    it('should return undefined for functions without custom processing', () => {
      expect(hasCustomProcessing('measureFactory.min')).toBe(false);
      expect(getCustomProcessor('measureFactory.min')).toBeUndefined();
    });

    it('should have numeric measure processors registered', () => {
      expect(hasCustomProcessing('measureFactory.sum')).toBe(true);
      expect(getCustomProcessor('measureFactory.sum')).toBeDefined();
    });

    it('should return list of functions with custom processing', () => {
      const functions = getFunctionsWithCustomProcessing();
      expect(functions).toContain('measureFactory.customFormula');
      expect(functions).toContain('measureFactory.measuredValue');
      expect(functions).toContain('filterFactory.equals');
      expect(functions).toContain('filterFactory.greaterThan');
      expect(functions).toContain('filterFactory.contains');
      expect(functions).toContain('filterFactory.exclude');
    });
  });

  describe('registry extensibility', () => {
    it('should be easy to add new processors', () => {
      const testContext: FunctionContext = {
        dataSource: {} as any,
        schemaIndex: createSchemaIndex([]),
        pathPrefix: 'test',
      };

      // Demonstrate how easy it would be to add a new processor
      const testProcessor = (args: ProcessedArg[], context: FunctionContext): ProcessedArg[] => {
        if (args.length === 0) {
          throw new Error(`${context.pathPrefix}: Test processing failed`);
        }
        return args;
      };

      // In real implementation, you would add to FUNCTION_PROCESSORS
      const extendedProcessors = {
        ...FUNCTION_PROCESSORS,
        'measureFactory.testFunction': testProcessor,
      };

      expect(extendedProcessors['measureFactory.testFunction']).toBeDefined();
      expect(() => {
        extendedProcessors['measureFactory.testFunction']([], testContext);
      }).toThrow('Test processing failed');
    });
  });
});
