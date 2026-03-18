import { describe, expect, it } from 'vitest';

import type { NlqTranslationError, NlqTranslationResult } from '../../../types.js';
import { collectTranslationErrors } from './translation-helpers.js';

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
          category: 'dimensions',
          index: 0,
          input: 'DM.Invalid.Attribute',
          message: 'Invalid attribute',
        },
      ],
    };

    const result = collectTranslationErrors(() => errorResult, errors);

    expect(result).toBeNull();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toEqual({
      category: 'dimensions',
      index: 0,
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
          category: 'dimensions',
          index: 0,
          input: 'DM.Invalid.Attribute1',
          message: 'Invalid attribute 1',
        },
      ],
    };
    const errorResult2: NlqTranslationResult<number> = {
      success: false,
      errors: [
        {
          category: 'measures',
          index: 1,
          input: 'measureFactory.invalid',
          message: 'Invalid measure',
        },
        {
          category: 'measures',
          index: 2,
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
          category: 'filters',
          index: 0,
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
          category: 'dimensions',
          index: 0,
          input: 'DM.Invalid.Attribute',
          message: 'Invalid attribute',
        },
      ],
    };

    const mapError = (e: NlqTranslationError): NlqTranslationError => ({
      ...e,
      category: 'dataOptions',
      index: 'category',
    });

    const result = collectTranslationErrors(() => errorResult, errors, mapError);

    expect(result).toBeNull();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toEqual({
      category: 'dataOptions',
      index: 'category',
      input: 'DM.Invalid.Attribute',
      message: 'Invalid attribute',
    });
  });
});
