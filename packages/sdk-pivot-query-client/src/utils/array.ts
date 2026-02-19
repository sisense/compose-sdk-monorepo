/**
 * Helper for finding first element index from array that meets check condition
 *
 * @param {Array<any>} arr - target array
 * @param {Function} check - check function
 * @param {number} [startFrom=0] - index from which to start search
 * @returns {number} - found element index
 */
export function findIndex(arr: Array<any>, check: Function, startFrom = 0) {
  for (let i = startFrom; i < arr.length; i += 1) {
    const value = arr[i];
    const isFound = !!check(value, i, arr);
    if (isFound) {
      return i;
    }
  }
  return -1;
}

export default {
  findIndex,
};
