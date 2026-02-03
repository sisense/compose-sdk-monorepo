import { sliceFromMatched } from './array-utils';

describe('sliceFromMatched', () => {
  it('should return the slice from the matched value', () => {
    expect(sliceFromMatched([1, 2, 3, 4, 5], 3)).toEqual([3, 4, 5]);
  });

  it('should return an empty array if the match value is not found', () => {
    expect(sliceFromMatched([1, 2, 3, 4, 5], 6)).toEqual([]);
  });

  it('should handle an empty array', () => {
    expect(sliceFromMatched([], 1)).toEqual([]);
  });

  it('should handle arrays with duplicate elements', () => {
    expect(sliceFromMatched([1, 2, 3, 2, 4, 5], 2)).toEqual([2, 3, 2, 4, 5]);
  });

  it('should work with different data types', () => {
    expect(sliceFromMatched(['a', 'b', 'c', 'd'], 'c')).toEqual(['c', 'd']);
    expect(sliceFromMatched([true, false, true, false], false)).toEqual([false, true, false]);
  });

  it('should return an empty array if matchValue is undefined and not present', () => {
    expect(sliceFromMatched([1, 2, 3], undefined)).toEqual([]);
  });
});
