import { describe, expect, it, vi } from 'vitest';

import { isFilterElement, isFilterRelationsElement, isMeasureElement } from '../types.js';
// Import after mocking
import { executeFunction } from './execute-function.js';

// Mock the SDK data module
vi.mock('@sisense/sdk-data', () => ({
  measureFactory: {
    sum: vi.fn().mockReturnValue({ __serializable: 'DimensionalBaseMeasure' }),
    nonExistentFunction: undefined,
  },
  filterFactory: {
    equals: vi.fn().mockReturnValue({ __serializable: 'DimensionalFilter' }),
    nonExistentFunction: undefined,
    logic: {
      and: vi.fn().mockReturnValue({ __serializable: 'DimensionalFilterRelations' }),
      nonExistentLogicFunction: undefined,
    },
  },
}));

// Mock the type guards
vi.mock('../types.js', () => ({
  isMeasureElement: vi.fn(),
  isFilterElement: vi.fn(),
  isFilterRelationsElement: vi.fn(),
}));

describe('executeFunction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mocks to return true by default
    vi.mocked(isMeasureElement).mockReturnValue(true);
    vi.mocked(isFilterElement).mockReturnValue(true);
    vi.mocked(isFilterRelationsElement).mockReturnValue(true);
  });

  it('should throw error for non-existent measureFactory function', () => {
    expect(() => {
      executeFunction('measureFactory.nonExistentFunction', []);
    }).toThrow('Function "nonExistentFunction" not found or is not a function');
  });

  it('should throw error for non-existent filterFactory function', () => {
    expect(() => {
      executeFunction('filterFactory.nonExistentFunction', []);
    }).toThrow('Function "nonExistentFunction" not found or is not a function');
  });

  it('should throw error for non-existent filterFactory.logic function', () => {
    expect(() => {
      executeFunction('filterFactory.logic.nonExistentLogicFunction', []);
    }).toThrow('Function "nonExistentLogicFunction" not found or is not a function');
  });

  it('should throw error for unsupported factory', () => {
    expect(() => {
      executeFunction('unsupportedFactory.someFunction', []);
    }).toThrow(
      'Unsupported factory: "unsupportedFactory". Supported factories: measureFactory, filterFactory',
    );
  });

  it('should throw error when measureFactory function returns invalid Measure', () => {
    vi.mocked(isMeasureElement).mockReturnValue(false);

    expect(() => {
      executeFunction('measureFactory.sum', []);
    }).toThrow('Function "measureFactory.sum" did not return a valid Measure');
  });

  it('should throw error when filterFactory.logic function returns invalid FilterRelations', () => {
    vi.mocked(isFilterRelationsElement).mockReturnValue(false);

    expect(() => {
      executeFunction('filterFactory.logic.and', []);
    }).toThrow('Function "filterFactory.logic.and" did not return a valid FilterRelations');
  });

  it('should throw error when filterFactory function returns invalid Filter or FilterRelations', () => {
    vi.mocked(isFilterElement).mockReturnValue(false);
    vi.mocked(isFilterRelationsElement).mockReturnValue(false);

    expect(() => {
      executeFunction('filterFactory.equals', []);
    }).toThrow('Function "filterFactory.equals" did not return a valid Filter or FilterRelations');
  });
});
