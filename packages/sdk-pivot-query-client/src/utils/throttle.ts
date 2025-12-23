type Timeout = number | NodeJS.Timeout;

/**
 * Prevent too frequent function calling in time limit
 *
 * @param {Function} func - function to execute
 * @param {number} limit - time interval in which function should be called only once
 * @returns {Function} - throttled function
 */
export const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  let activeTimerID: Timeout;
  let lastCallArgs: Array<any> | null = null;
  const resultFn = (...args: Array<any>) => {
    if (inThrottle) {
      lastCallArgs = args;
    } else {
      func(...args);
      inThrottle = true;
      lastCallArgs = null;
      activeTimerID = setTimeout(() => {
        inThrottle = false;
        if (lastCallArgs) {
          func(...lastCallArgs);
          lastCallArgs = null;
        }
      }, limit);
    }
  };
  resultFn.cancel = () => {
    clearTimeout(activeTimerID as NodeJS.Timeout);
    inThrottle = false;
  };
  return resultFn;
};

export default throttle;
