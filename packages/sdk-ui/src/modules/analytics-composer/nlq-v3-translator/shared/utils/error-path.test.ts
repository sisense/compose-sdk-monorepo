import { describe, expect, it } from 'vitest';

import type { NlqTranslationError } from '../../../types.js';
import { joinPathStrings, prefixPath, withFilterPath, withWidgetsArrayPath } from './error-path.js';

const baseError = (overrides: Partial<NlqTranslationError> = {}): NlqTranslationError => ({
  path: 'dataOptions.category[0]',
  input: 'DM.Commerce.Date.Monthss',
  message: "Invalid date level 'Monthss'",
  ...overrides,
});

describe('joinPathStrings', () => {
  it('returns suffix when prefix is empty', () => {
    expect(joinPathStrings('', 'dataOptions.category[0]')).toBe('dataOptions.category[0]');
  });

  it('returns prefix when suffix is empty', () => {
    expect(joinPathStrings('widgets[0]', undefined)).toBe('widgets[0]');
  });

  it('joins prefix and suffix with a dot', () => {
    expect(joinPathStrings('widgets[0]', 'dataOptions.category[0]')).toBe(
      'widgets[0].dataOptions.category[0]',
    );
  });
});

describe('withWidgetsArrayPath', () => {
  it('prefixes path with widgets[index]', () => {
    const result = withWidgetsArrayPath(0)(baseError({ path: 'dataOptions.category[0]' }));
    expect(result.path).toBe('widgets[0].dataOptions.category[0]');
  });
});

describe('withFilterPath', () => {
  it('prefixes path with filters[index]', () => {
    const result = withFilterPath(1)(baseError({ path: 'args[0]' }));
    expect(result.path).toBe('filters[1].args[0]');
  });
});

describe('prefixPath', () => {
  it('prefixes an existing path', () => {
    const result = prefixPath('widgets[0]')(baseError({ path: 'dataOptions.category[0]' }));
    expect(result.path).toBe('widgets[0].dataOptions.category[0]');
  });
});
