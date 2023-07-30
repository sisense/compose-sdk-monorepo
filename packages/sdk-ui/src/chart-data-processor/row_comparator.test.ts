import { compareValues } from './row_comparator';

describe('compareValues', () => {
  const direction = 1;

  it('should compare values correctly', () => {
    // compare strings
    expect(compareValues('abc', 'def')).toBe(-1);

    // compare numbers
    expect(compareValues(2, 10, direction, 'number')).toBe(-1);
    expect(compareValues('2', '10', direction, 'number')).toBe(-1);

    // compare dates
    expect(compareValues('2023-06-29', '2023-06-30', direction, 'date')).toBe(-1);

    // compare numbers as strings
    expect(compareValues(2, 10, direction, 'string')).toBe(1);
    expect(compareValues('2', '10', direction, 'string')).toBe(1);

    // compare any value with undefined => undefined always last
    expect(compareValues('abc', undefined, direction, 'string')).toBe(-1);
    expect(compareValues(undefined, 2, direction, 'number')).toBe(1);
    expect(compareValues('2023-06-30', undefined, direction, 'date')).toBe(-1);

    // compare any value with null => null always last
    expect(compareValues('abc', null, direction, 'string')).toBe(-1);
    expect(compareValues(null, 2, direction, 'number')).toBe(1);
    expect(compareValues('2023-06-30', null, direction, 'date')).toBe(-1);

    // compare number with not convertible value => NaN always last
    expect(compareValues(4, 'not convertible into number', direction, 'number')).toBe(-1);
    expect(compareValues('not convertible into number', 5, direction, 'number')).toBe(1);

    // compare undefined with undefined
    expect(compareValues(undefined, undefined, direction)).toBe(0);

    // compare null with null
    expect(compareValues(null, null, direction)).toBe(0);

    // compare NaN with NaN
    expect(
      compareValues(
        'not convertible into number',
        'not convertible into number',
        direction,
        'number',
      ),
    ).toBe(0);
    expect(compareValues(NaN, NaN, direction, 'number')).toBe(0);

    // allows to specify direction
    expect(compareValues('def', 'abc', 1, 'string')).toBe(1);
    expect(compareValues('def', 'abc', 0, 'string')).toBe(0);
    expect(compareValues('def', 'abc', -1, 'string')).toBe(-1);
  });
});
