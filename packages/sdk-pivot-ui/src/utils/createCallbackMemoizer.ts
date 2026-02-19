type StringAnyMap = { [s: string]: any };

/**
 * Helper utility that updates the specified callback whenever any of the specified
 * indices have changed.
 *
 * @param {boolean} [requireAllKeys=true] - defines if wait for all properties in indices
 * to be initiated
 * @returns {function({callback: Function, indices: object})} - wrapped function
 */
export function createCallbackMemoizer(requireAllKeys: boolean = true) {
  let cachedIndices: StringAnyMap = {};
  let cachedResult: any = null;

  return ({ callback, indices }: { callback: Function; indices: any }) => {
    const keys = Object.keys(indices);
    const allInitialized =
      !requireAllKeys ||
      keys.every((key) => {
        const value = indices[key];
        return Array.isArray(value) ? value.length > 0 : value >= 0;
      });
    const indexChanged =
      keys.length !== Object.keys(cachedIndices).length ||
      keys.some((key) => {
        const cachedValue = cachedIndices[key];
        const value = indices[key];

        return Array.isArray(value)
          ? cachedValue.join(',') !== value.join(',')
          : cachedValue !== value;
      });

    cachedIndices = indices;

    if (allInitialized && indexChanged) {
      cachedResult = callback(indices);
    }

    return cachedResult;
  };
}
export default createCallbackMemoizer;
