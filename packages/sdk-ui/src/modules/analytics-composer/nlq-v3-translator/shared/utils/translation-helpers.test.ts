import { describe, expect, it } from 'vitest';

import type { NlqTranslationError, NlqTranslationResult } from '../../../types.js';
import { withAxisContext } from '../data-options/adapters.js';
import {
  collectTranslationErrors,
  stripDelimitersFromJson,
  toNlqErrorInput,
  translateDataSourceToJSON,
  translateWidgetsOptionsToJSON,
} from './translation-helpers.js';

describe('toNlqErrorInput', () => {
  it('uses toJSON when available', () => {
    const input = toNlqErrorInput({
      toJSON: () => ({ name: 'Revenue' }),
    });
    expect(input).toEqual({ name: 'Revenue' });
  });

  it('returns the value as-is when toJSON is missing', () => {
    const measure = { name: 'Revenue', composeCode: 'measureFactory.sum(...)' };
    expect(toNlqErrorInput(measure)).toBe(measure);
  });
});

describe('translateDataSourceToJSON', () => {
  it('returns string data sources as-is', () => {
    expect(translateDataSourceToJSON('Sample ECommerce')).toBe('Sample ECommerce');
  });

  it('returns only the title from DataSourceInfo', () => {
    expect(
      translateDataSourceToJSON({
        title: 'Sample ECommerce',
        type: 'elasticube',
        id: 'ds-id',
        address: 'localhost',
      }),
    ).toBe('Sample ECommerce');
  });
});

describe('translateWidgetsOptionsToJSON', () => {
  it('keeps filtersOptions and partialDtoOptions only', () => {
    const result = translateWidgetsOptionsToJSON({
      'w-1': {
        filtersOptions: { applyMode: 'filter', shouldAffectFilters: false },
        partialDtoOptions: {
          options: { selector: true, dashboardFiltersMode: 'filter' },
        },
        jtdConfig: { targets: new Map() } as never,
      },
    });
    expect(result).toEqual({
      'w-1': {
        filtersOptions: { applyMode: 'filter', shouldAffectFilters: false },
        partialDtoOptions: {
          options: { selector: true, dashboardFiltersMode: 'filter' },
        },
      },
    });
  });

  it('returns undefined for empty options', () => {
    expect(translateWidgetsOptionsToJSON({})).toBeUndefined();
  });
});

describe('stripDelimitersFromJson', () => {
  it('strips delimiters from NLQ output shapes with Record<string, unknown> fields', () => {
    const chartJson = {
      chartType: 'column',
      dataOptions: { category: ['DM.[[Commerce]].[[Gender]]'] },
      styleOptions: { legend: { enabled: true } },
    };

    expect(stripDelimitersFromJson(chartJson)).toEqual({
      chartType: 'column',
      dataOptions: { category: ['DM.Commerce.Gender'] },
      styleOptions: { legend: { enabled: true } },
    });
  });
});

describe('collectTranslationErrors', () => {
  it('should return data when translation succeeds', () => {
    const errors: NlqTranslationError[] = [];
    const successResult: NlqTranslationResult<string> = {
      success: true,
      data: 'test-data',
    };

    const result = collectTranslationErrors(() => successResult, errors);

    expect(result).toBe('test-data');
    expect(errors).toHaveLength(0);
  });

  it('should return null and collect errors when translation fails', () => {
    const errors: NlqTranslationError[] = [];
    const errorResult: NlqTranslationResult<string> = {
      success: false,
      errors: [
        {
          path: 'dimensions[0]',
          input: 'DM.Invalid.Attribute',
          message: 'Invalid attribute',
        },
      ],
    };

    const result = collectTranslationErrors(() => errorResult, errors);

    expect(result).toBeNull();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toEqual({
      path: 'dimensions[0]',
      input: 'DM.Invalid.Attribute',
      message: 'Invalid attribute',
    });
  });

  it('should accumulate multiple errors from multiple failed translations', () => {
    const errors: NlqTranslationError[] = [];
    const errorResult1: NlqTranslationResult<string> = {
      success: false,
      errors: [
        {
          path: 'dimensions[0]',
          input: 'DM.Invalid.Attribute1',
          message: 'Invalid attribute 1',
        },
      ],
    };
    const errorResult2: NlqTranslationResult<number> = {
      success: false,
      errors: [
        {
          path: 'measures[1]',
          input: 'measureFactory.invalid',
          message: 'Invalid measure',
        },
        {
          path: 'measures[2]',
          input: 'measureFactory.anotherInvalid',
          message: 'Another invalid measure',
        },
      ],
    };

    collectTranslationErrors(() => errorResult1, errors);
    collectTranslationErrors(() => errorResult2, errors);

    expect(errors).toHaveLength(3);
    expect(errors[0].message).toBe('Invalid attribute 1');
    expect(errors[1].message).toBe('Invalid measure');
    expect(errors[2].message).toBe('Another invalid measure');
  });

  it('should handle mixed success and failure results', () => {
    const errors: NlqTranslationError[] = [];
    const successResult: NlqTranslationResult<string> = {
      success: true,
      data: 'success-data',
    };
    const errorResult: NlqTranslationResult<number> = {
      success: false,
      errors: [
        {
          path: 'filters[0]',
          input: 'filterFactory.invalid',
          message: 'Invalid filter',
        },
      ],
    };

    const success = collectTranslationErrors(() => successResult, errors);
    const failure = collectTranslationErrors(() => errorResult, errors);

    expect(success).toBe('success-data');
    expect(failure).toBeNull();
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('Invalid filter');
  });

  it('should work with generic types', () => {
    const errors: NlqTranslationError[] = [];
    const successResult: NlqTranslationResult<{ value: number }> = {
      success: true,
      data: { value: 42 },
    };

    const result = collectTranslationErrors(() => successResult, errors);

    expect(result).toEqual({ value: 42 });
    expect(errors).toHaveLength(0);
  });

  it('should map errors when mapError is provided', () => {
    const errors: NlqTranslationError[] = [];
    const errorResult: NlqTranslationResult<string> = {
      success: false,
      errors: [
        {
          path: 'dimensions[0]',
          input: 'DM.Invalid.Attribute',
          message: 'Invalid attribute',
        },
      ],
    };

    const result = collectTranslationErrors(() => errorResult, errors, withAxisContext('category'));

    expect(result).toBeNull();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toEqual({
      path: 'dataOptions.category[0]',
      input: 'DM.Invalid.Attribute',
      message: 'Invalid attribute',
    });
  });
});
