/**
 * Integration tests for the factory function processing registry system
 */
import { describe, expect, it, vi } from 'vitest';

import { createSchemaIndex } from '../../common.js';
import { type FunctionContext } from '../../types.js';
import { processCustomFormula } from './process-custom-formula.js';

// Mock the createAttributeFromName function
vi.mock('../common.js', () => ({
  createAttributeFromName: vi
    .fn()
    .mockReturnValue({ kind: 'attribute', name: 'mockProcessedAttribute' }),
}));

describe('processCustomFormula', () => {
  const mockProcessingContext: FunctionContext = {
    dataSource: { id: 'test', title: 'Test', address: 'localhost' } as any,
    schemaIndex: createSchemaIndex([
      {
        name: 'Commerce',
        columns: [
          {
            name: 'Revenue',
            dataType: 'numeric',
            expression: '[Commerce.Revenue]',
            description: 'Commerce.Revenue',
          },
          {
            name: 'Cost',
            dataType: 'numeric',
            expression: '[Commerce.Cost]',
            description: 'Commerce.Cost',
          },
        ],
      },
    ] as any),
    pathPrefix: 'test',
  };

  it('should process successful customFormula', () => {
    const processedArgs = [
      'Profit Ratio',
      '[revenue] - [cost]',
      {
        revenue: { kind: 'measure' }, // Mock QueryElement
        cost: { kind: 'measure' }, // Mock QueryElement
      },
    ];

    expect(() => {
      processCustomFormula(processedArgs, mockProcessingContext);
    }).not.toThrow();
  });

  it('should process customFormula with function calls and attribute strings', () => {
    const processedArgs = [
      'Profit Ratio',
      '[revenue] - [cost]',
      {
        revenue: { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue'] },
        cost: 'DM.Commerce.Cost',
      },
    ];

    expect(() => {
      processCustomFormula(processedArgs, mockProcessingContext);
    }).not.toThrow();

    // Verify that context transformation occurred
    const transformedContext = processedArgs[2] as Record<string, any>;
    expect(transformedContext.revenue).toBeDefined();
    expect(transformedContext.cost).toBeDefined();
    // The context should now contain processed SDK objects, not the raw strings/function calls
    expect(transformedContext.revenue).not.toEqual({
      function: 'measureFactory.sum',
      args: ['DM.Commerce.Revenue'],
    });
    expect(transformedContext.cost).not.toBe('DM.Commerce.Cost');
  });

  it('should process demo example: Profitability Ratio with nested function and attribute', () => {
    const processedArgs = [
      'Profitability Ratio',
      '([totalRevenue] - SUM([cost])) / [totalRevenue]',
      {
        totalRevenue: { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue'] },
        cost: 'DM.Commerce.Cost',
      },
    ];

    expect(() => {
      processCustomFormula(processedArgs, mockProcessingContext);
    }).not.toThrow();

    // Verify that context transformation occurred - both function call and attribute string were processed
    const transformedContext = processedArgs[2] as Record<string, any>;
    expect(transformedContext.totalRevenue).toBeDefined();
    expect(transformedContext.totalRevenue.__serializable).toBe('DimensionalBaseMeasure');
    expect(transformedContext.cost).toBeDefined();
    expect(transformedContext.cost.__serializable).toBe('DimensionalAttribute');
  });

  it('should throw for customFormula with missing references', () => {
    const processedArgs = [
      'Invalid Formula',
      '[revenue] + [missingRef]',
      { revenue: { kind: 'measure' } },
    ];

    expect(() => {
      processCustomFormula(processedArgs, mockProcessingContext);
    }).toThrow('missingRef');
  });

  it('should throw for customFormula with unused context', () => {
    const processedArgs = [
      'Simple Formula',
      '[revenue]',
      { revenue: { kind: 'measure' }, unusedCost: { kind: 'measure' } },
    ];

    expect(() => {
      processCustomFormula(processedArgs, mockProcessingContext);
    }).toThrow('Context keys [unusedCost] are defined but not used');
  });

  it('should throw for customFormula with empty context when formula has bracket references', () => {
    const processedArgs = ['Invalid Formula', '[revenue]', {}];

    expect(() => {
      processCustomFormula(processedArgs, mockProcessingContext);
    }).toThrow('Context cannot be empty');
  });

  it('should allow customFormula with empty context when formula has no bracket references', () => {
    const processedArgs = ['Remainder of 10 / 7', 'MOD(10, 7)', {}];

    expect(() => {
      processCustomFormula(processedArgs, mockProcessingContext);
    }).not.toThrow();

    // Verify that empty context is preserved
    const transformedContext = processedArgs[2] as Record<string, any>;
    expect(transformedContext).toEqual({});
  });

  it('should throw for customFormula with empty formula', () => {
    const processedArgs = ['Empty Formula', '', { revenue: { kind: 'measure' } }];

    expect(() => {
      processCustomFormula(processedArgs, mockProcessingContext);
    }).toThrow('Formula cannot be empty');
  });

  it('should throw for customFormula with insufficient arguments', () => {
    const processedArgs = ['Title Only'];

    expect(() => {
      processCustomFormula(processedArgs, mockProcessingContext);
    }).toThrow('Expected 3, 4, or 5 arguments for customFormula');
  });

  it('should accept optional 4th argument (format)', () => {
    const processedArgs = [
      'Profit Ratio',
      '[revenue] - [cost]',
      {
        revenue: { kind: 'measure' },
        cost: { kind: 'measure' },
      },
      '0.00%', // Optional format
    ];

    expect(() => {
      processCustomFormula(processedArgs, mockProcessingContext);
    }).not.toThrow();

    // Format is metadata only - doesn't affect processing
    // Verify that context processing still works correctly
    const transformedContext = processedArgs[2] as Record<string, any>;
    expect(transformedContext.revenue).toBeDefined();
    expect(transformedContext.cost).toBeDefined();
  });

  it('should accept optional 4th and 5th arguments (format and description)', () => {
    const processedArgs = [
      'Profit Ratio',
      '[revenue] - [cost]',
      {
        revenue: { kind: 'measure' },
        cost: { kind: 'measure' },
      },
      '0.00%', // Optional format
      'This formula calculates profit ratio', // Optional description
    ];

    expect(() => {
      processCustomFormula(processedArgs, mockProcessingContext);
    }).not.toThrow();

    // Format and description are metadata only - don't affect processing
    // Verify that context processing still works correctly
    const transformedContext = processedArgs[2] as Record<string, any>;
    expect(transformedContext.revenue).toBeDefined();
    expect(transformedContext.cost).toBeDefined();
  });

  it('should reject more than 5 arguments', () => {
    const processedArgs = [
      'Profit Ratio',
      '[revenue] - [cost]',
      {
        revenue: { kind: 'measure' },
        cost: { kind: 'measure' },
      },
      '0.00%', // format
      'Description', // description
      'Extra argument', // 6th argument - should be rejected
    ];

    expect(() => {
      processCustomFormula(processedArgs, mockProcessingContext);
    }).toThrow('Expected 3, 4, or 5 arguments for customFormula');
  });

  it('should handle 3 arguments (backward compatibility)', () => {
    const processedArgs = [
      'Profit Ratio',
      '[revenue] - [cost]',
      {
        revenue: { kind: 'measure' },
        cost: { kind: 'measure' },
      },
    ];

    expect(() => {
      processCustomFormula(processedArgs, mockProcessingContext);
    }).not.toThrow();

    // Verify processing works correctly with 3 args
    const transformedContext = processedArgs[2] as Record<string, any>;
    expect(transformedContext.revenue).toBeDefined();
    expect(transformedContext.cost).toBeDefined();
  });

  it('should include error prefix in processing messages', () => {
    const contextWithPrefix = {
      ...mockProcessingContext,
      pathPrefix: 'args[0] → ',
    };
    const processedArgs = ['Test Formula', '[missing]', { revenue: { kind: 'measure' } }];

    expect(() => {
      processCustomFormula(processedArgs, contextWithPrefix);
    }).toThrow('args[0] → args[1]: Reference [missing] not found');
  });

  it('should throw error for invalid context value type', () => {
    const processedArgs = [
      'Test Formula',
      '[invalidValue]',
      { invalidValue: 123 }, // Invalid type - should be function call or attribute string
    ];

    expect(() => {
      processCustomFormula(processedArgs, mockProcessingContext);
    }).toThrow(
      "args[2].invalidValue: Invalid context value for key 'invalidValue'. Expected a function call or attribute reference (DM....), but got: number",
    );
  });

  it('should throw error for null context value', () => {
    const processedArgs = ['Test Formula', '[nullValue]', { nullValue: null }];

    expect(() => {
      processCustomFormula(processedArgs, mockProcessingContext);
    }).toThrow(
      "args[2].nullValue: Invalid context value for key 'nullValue'. Expected a function call or attribute reference (DM....), but got: object",
    );
  });

  it('should throw error for undefined context value', () => {
    const processedArgs = ['Test Formula', '[undefinedValue]', { undefinedValue: undefined }];

    expect(() => {
      processCustomFormula(processedArgs, mockProcessingContext);
    }).toThrow(
      "args[2].undefinedValue: Invalid context value for key 'undefinedValue'. Expected a function call or attribute reference (DM....), but got: undefined",
    );
  });
});
