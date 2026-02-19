import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createSchemaIndex } from '../common.js';
import { FunctionContext } from '../types.js';
import { executeFunction } from './execute-function.js';
import { getCustomProcessor } from './factory-function-processors.js';
import {
  getFunctionSchema,
  getMaxArgCount,
  getRequiredArgCount,
} from './factory-function-schemas.js';
import { processArg } from './process-arg.js';
// Import after mocking
import { processNode } from './process-node.js';

// Mock dependencies
vi.mock('./factory-function-schemas.js', () => ({
  getFunctionSchema: vi.fn(),
  getRequiredArgCount: vi.fn(),
  getMaxArgCount: vi.fn(),
}));

vi.mock('./factory-function-processors.js', () => ({
  getCustomProcessor: vi.fn(),
}));

vi.mock('./execute-function.js', () => ({
  executeFunction: vi.fn(),
}));

vi.mock('./process-arg.js', () => ({
  processArg: vi.fn(),
}));

describe('processNode', () => {
  const mockContext: FunctionContext = {
    dataSource: { id: 'test', title: 'Test', address: 'localhost' } as any,
    schemaIndex: createSchemaIndex([]),
    pathPrefix: 'test',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up default mock returns
    vi.mocked(getFunctionSchema).mockReturnValue([{ type: 'string', required: true }]);
    vi.mocked(getRequiredArgCount).mockReturnValue(1);
    vi.mocked(getMaxArgCount).mockReturnValue(2);
    vi.mocked(getCustomProcessor).mockReturnValue(undefined);
    vi.mocked(executeFunction).mockReturnValue({ __serializable: 'DimensionalBaseMeasure' } as any);
    vi.mocked(processArg).mockReturnValue('processedArg');
  });

  it('should throw error for unknown function', () => {
    vi.mocked(getFunctionSchema).mockReturnValue(undefined);

    const input = {
      data: { function: 'unknownFunction', args: [] },
      context: mockContext,
    };

    expect(() => {
      processNode(input);
    }).toThrow('test.function: Unknown function "unknownFunction"');
  });

  it('should throw error for insufficient arguments', () => {
    vi.mocked(getRequiredArgCount).mockReturnValue(2);

    const input = {
      data: { function: 'testFunction', args: ['arg1'] },
      context: mockContext,
    };

    expect(() => {
      processNode(input);
    }).toThrow('test.function: Expected at least 2 arguments, got 1');
  });

  it('should throw error for too many arguments', () => {
    vi.mocked(getMaxArgCount).mockReturnValue(1);

    const input = {
      data: { function: 'testFunction', args: ['arg1', 'arg2'] },
      context: mockContext,
    };

    expect(() => {
      processNode(input);
    }).toThrow('test.function: Expected at most 1 arguments, got 2');
  });

  it('should throw error when custom processor fails', () => {
    const mockCustomProcessor = vi.fn().mockImplementation(() => {
      throw new Error('Custom processor failed');
    });
    vi.mocked(getCustomProcessor).mockReturnValue(mockCustomProcessor);

    const input = {
      data: { function: 'testFunction', args: ['arg1'] },
      context: mockContext,
    };

    expect(() => {
      processNode(input);
    }).toThrow('Custom processor failed');
  });

  it('should throw error when custom processor throws non-Error', () => {
    const mockCustomProcessor = vi.fn().mockImplementation(() => {
      throw 'String error';
    });
    vi.mocked(getCustomProcessor).mockReturnValue(mockCustomProcessor);

    const input = {
      data: { function: 'testFunction', args: ['arg1'] },
      context: mockContext,
    };

    expect(() => {
      processNode(input);
    }).toThrow('Unknown validation error');
  });
});
