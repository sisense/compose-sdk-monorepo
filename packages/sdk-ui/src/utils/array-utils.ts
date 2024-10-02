/**
 * Returns a slice of the array starting from the first occurrence of the matched value.
 *
 * @template T - The type of elements in the array.
 * @param {T[]} array - The array to search through.
 * @param {T} matchValue - The value to match in the array.
 * @returns {T[]} - A new array starting from the matched value. Returns an empty array if the matchValue is not found.
 * @example
 * ```
 * const array = [1, 2, 3, 4, 5];
 * const result = sliceFromMatched(array, 3);
 * console.log(result); // Output: [3, 4, 5]
 * ```
 */
export function sliceFromMatched<T>(array: T[], matchValue: T): T[] {
  const index = array.findIndex((item) => item === matchValue);

  if (index === -1) {
    return [];
  }

  return array.slice(index);
}
