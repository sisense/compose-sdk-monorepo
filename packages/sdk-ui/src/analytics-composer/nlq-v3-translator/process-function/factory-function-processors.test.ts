/**
 * Integration tests for the factory function processing registry system
 */
import { describe, expect, it, vi } from 'vitest';

import { FunctionContext } from '../types.js';
import {
  FUNCTION_PROCESSORS,
  getCustomProcessor,
  getFunctionsWithCustomProcessing,
  hasCustomProcessing,
} from './factory-function-processors.js';

// Mock the createAttributeFromName function
vi.mock('../common.js', () => ({
  createAttributeFromName: vi
    .fn()
    .mockReturnValue({ kind: 'attribute', name: 'mockProcessedAttribute' }),
}));

describe('factory-function-processors', () => {
  describe('processing registry', () => {
    it('should have customFormula processor registered', () => {
      expect(hasCustomProcessing('measureFactory.customFormula')).toBe(true);
      expect(getCustomProcessor('measureFactory.customFormula')).toBeDefined();
    });

    it('should return undefined for functions without custom processing', () => {
      expect(hasCustomProcessing('measureFactory.sum')).toBe(false);
      expect(getCustomProcessor('measureFactory.sum')).toBeUndefined();
    });

    it('should return list of functions with custom processing', () => {
      const functions = getFunctionsWithCustomProcessing();
      expect(functions).toContain('measureFactory.customFormula');
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
        tables: [] as any,
        pathPrefix: 'test',
      };

      // Demonstrate how easy it would be to add a new processor
      const testProcessor = (args: any[], context: FunctionContext) => {
        if (args.length === 0) {
          throw new Error(`${context.pathPrefix}: Test processing failed`);
        }
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
