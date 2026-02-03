/**
 * Input/Output Collection Decorator for Runtime Test Data Generation
 *
 * This module provides a decorator that collects unique input/output snapshots
 * of function calls during runtime. This is useful for generating unit test data
 * from actual application usage.
 *
 * Usage:
 * 1. Wrap your function with the decorator:
 *    ```ts
 *    // With configuration:
 *    const myFunction = withInputOutputCollection({ maxSnapshots: 100 })(originalFunction);
 *
 *    // With custom function name:
 *    const myFunction = withInputOutputCollection({
 *      maxSnapshots: 100,
 *      functionName: 'myCustomName'
 *    })(originalFunction);
 *

 *    ```
 *
 * 2. Run your application and exercise the function with various inputs
 *
 * 3. In the browser console (development only), call:
 *    - `printCollectedInfo()` - to view all collected data
 *    - `getCollectedData()` - to get data programmatically
 *    - `exportCollectedDataAsJson()` - to export as JSON string with function serialization
 *    - `parseCollectedDataFromJson(jsonString)` - to parse exported JSON and get function placeholders
 *    - `clearCollectedData()` - to clear collected data
 *    - `cleanup()` - to completely clean up the collector
 *
 * Features:
 * - Intelligent deduplication prevents collecting identical input/output pairs
 * - Robust deep equality checking handles functions, dates, and complex objects
 * - Statistics tracking shows total calls vs unique snapshots
 * - Configurable maximum number of snapshots
 * - Deep cloning of inputs and outputs to avoid reference issues
 * - Proper function serialization for unit test generation
 * - Browser console integration for easy access (development only)
 * - Automatic cleanup when no collected data remains
 */

// Using custom deep equality check to avoid external dependencies

interface CollectedData {
  id: string;
  timestamp: number;
  args: any[];
  result: any;
}

interface CollectionStore {
  functionName: string;
  data: CollectedData[];
  totalCalls: number;
  duplicateSkips: number;
}

// Global store for all collected data
const globalCollectionStore = new Map<string, CollectionStore>();

// Track if window utilities have been attached
let windowUtilitiesAttached = false;

/**
 * Checks if we're running in development environment
 */
function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Attaches utility functions to window object for browser access in development only
 */
function attachWindowUtilities(): void {
  if (windowUtilitiesAttached || typeof window === 'undefined' || !isDevelopmentEnvironment()) {
    return;
  }

  (window as any).printCollectedInfo = printCollectedInfo;
  (window as any).getCollectedData = getCollectedData;
  (window as any).clearCollectedData = clearCollectedData;
  (window as any).exportCollectedDataAsJson = exportCollectedDataAsJson;
  (window as any).parseCollectedDataFromJson = parseCollectedDataFromJson;
  (window as any).cleanup = cleanup;

  windowUtilitiesAttached = true;
}

/**
 * Removes utility functions from window object
 */
function detachWindowUtilities(): void {
  if (!windowUtilitiesAttached || typeof window === 'undefined') {
    return;
  }

  delete (window as any).printCollectedInfo;
  delete (window as any).getCollectedData;
  delete (window as any).clearCollectedData;
  delete (window as any).exportCollectedDataAsJson;
  delete (window as any).parseCollectedDataFromJson;
  delete (window as any).cleanup;

  windowUtilitiesAttached = false;
}

/**
 * Decorator that collects unique input/output snapshots for a function during runtime.
 * Useful for generating unit test data from actual application usage.
 *
 * Uses currying pattern: withInputOutputCollection(config)(functionToDecorate)
 *
 * @param options - Configuration options for the collector
 * @returns Function that takes the function to decorate and returns the decorated function
 */
export function withInputOutputCollection<TFunction extends (...args: any[]) => any>(
  options: {
    /** Maximum number of unique snapshots to collect (default: 100) */
    maxSnapshots?: number;
    /** Custom equality function for comparing arguments (default: deep equality) */
    equalityFn?: (a: any[], b: any[]) => boolean;
    /** Optional custom function name (defaults to function.name) */
    functionName?: string;
  } = {},
) {
  const { maxSnapshots = 100, equalityFn = deepEquals, functionName: customFunctionName } = options;

  return function decorator(originalFunction: TFunction): TFunction {
    // Use custom function name or derive from the function itself
    const functionName = customFunctionName || originalFunction.name || 'anonymous';

    // Initialize store for this function if it doesn't exist
    if (!globalCollectionStore.has(functionName)) {
      globalCollectionStore.set(functionName, {
        functionName,
        data: [],
        totalCalls: 0,
        duplicateSkips: 0,
      });
    }

    // Attach window utilities when decorator is first used in development
    attachWindowUtilities();

    const store = globalCollectionStore.get(functionName)!;

    return function (this: any, ...args: any[]) {
      const result = (originalFunction as any).apply(this, args);

      // Track total calls
      store.totalCalls++;

      // Check if we already have this combination of arguments
      // Use a more reliable comparison by deep cloning args first, then comparing
      const clonedArgs = deepClone(args);
      const isDuplicate = store.data.some((entry) => equalityFn(entry.args, clonedArgs));

      if (!isDuplicate && store.data.length < maxSnapshots) {
        const snapshot: CollectedData = {
          id: generateSnapshotId(functionName, store.data.length),
          timestamp: Date.now(),
          args: clonedArgs, // Use already cloned args
          result: deepClone(result),
        };

        store.data.push(snapshot);
      } else if (isDuplicate) {
        store.duplicateSkips++;
      }

      return result;
    } as TFunction;
  };
}

/**
 * Prints all collected input/output data to the console.
 * This function is attached to the window object for easy access in the browser.
 */
export function printCollectedInfo(): void {
  if (globalCollectionStore.size === 0) {
    console.log('No input/output data has been collected yet.');
    return;
  }

  console.group('🔍 Collected Input/Output Snapshots');

  for (const [functionName, store] of globalCollectionStore.entries()) {
    console.group(`📊 Function: ${functionName}`);
    console.log(
      `📈 Statistics: ${store.data.length} unique snapshots | ${store.totalCalls} total calls | ${store.duplicateSkips} duplicates skipped`,
    );

    if (store.totalCalls > 0) {
      const uniqueRate = ((store.data.length / store.totalCalls) * 100).toFixed(1);
      console.log(`🎯 Uniqueness Rate: ${uniqueRate}%`);
    }

    store.data.forEach((snapshot, index) => {
      console.group(`📸 Snapshot ${index + 1} (${snapshot.id})`);
      console.log('🕒 Timestamp:', new Date(snapshot.timestamp).toISOString());
      console.log('📥 Input Arguments:', snapshot.args);
      console.log('📤 Output Result:', snapshot.result);
      console.groupEnd();
    });

    console.groupEnd();
  }

  console.groupEnd();
}

/**
 * Returns all collected data as a serializable object.
 * Useful for exporting test data programmatically.
 */
export function getCollectedData(): Record<string, CollectionStore> {
  const result: Record<string, CollectionStore> = {};

  for (const [functionName, store] of globalCollectionStore.entries()) {
    result[functionName] = {
      functionName: store.functionName,
      data: [...store.data], // Create a copy
      totalCalls: store.totalCalls,
      duplicateSkips: store.duplicateSkips,
    };
  }

  return result;
}

/**
 * Clears all collected data.
 * Useful for resetting the collection state.
 * Removes window utilities if no data remains.
 */
export function clearCollectedData(functionName?: string): void {
  if (functionName) {
    globalCollectionStore.delete(functionName);
    console.log(`Cleared collected data for function: ${functionName}`);
  } else {
    globalCollectionStore.clear();
    console.log('Cleared all collected data');
  }

  // Remove window utilities if no data is left
  if (globalCollectionStore.size === 0) {
    detachWindowUtilities();
  }
}

/**
 * Completely cleans up the input/output collector.
 * Clears all data and removes window utilities.
 * Useful for cleanup in test environments or when the collector is no longer needed.
 */
export function cleanup(): void {
  globalCollectionStore.clear();
  detachWindowUtilities();
  console.log('Input/Output collector cleaned up');
}

/**
 * Exports collected data as JSON string with proper function serialization.
 * Functions are represented as `[[Function - {functionName}]]` strings for easy replacement in unit tests.
 *
 * Example output:
 * ```json
 * {
 *   "buildHighchartsOptions": {
 *     "functionName": "buildHighchartsOptions",
 *     "data": [{
 *       "args": [{ "onBeforeRender": "[[Function - customRenderer]]" }],
 *       "result": { "chart": { "type": "line" } }
 *     }]
 *   }
 * }
 * ```
 *
 * Useful for saving test data to files.
 */
export function exportCollectedDataAsJson(): string {
  return JSON.stringify(getCollectedData(), createFunctionReplacer());
}

/**
 * Parses JSON data exported by exportCollectedDataAsJson and provides a function map for mocking.
 * This is a utility function for unit tests to easily replace function placeholders with mocks.
 *
 * @param jsonData - The JSON string exported by exportCollectedDataAsJson
 * @returns Object containing parsed data and a list of function placeholders found
 */
export function parseCollectedDataFromJson(jsonData: string): {
  data: Record<string, CollectionStore>;
  functionPlaceholders: string[];
} {
  const data = JSON.parse(jsonData);
  const functionPlaceholders: string[] = [];

  // Recursively find all function placeholders
  function findFunctionPlaceholders(obj: any): void {
    if (typeof obj === 'string' && obj.startsWith('[[Function - ') && obj.endsWith(']]')) {
      if (!functionPlaceholders.includes(obj)) {
        functionPlaceholders.push(obj);
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          findFunctionPlaceholders(obj[key]);
        }
      }
    } else if (Array.isArray(obj)) {
      obj.forEach(findFunctionPlaceholders);
    }
  }

  findFunctionPlaceholders(data);

  return {
    data,
    functionPlaceholders,
  };
}

// Helper functions

/**
 * Creates a JSON.stringify replacer function that handles function serialization and circular references.
 * Functions are converted to `[[Function - {functionName}]]` strings.
 * Circular references are converted to `[[Circular]]` strings.
 */
function createFunctionReplacer(): (key: string, value: any) => any {
  const seen = new WeakSet();

  return function replacer(key: string, value: any): any {
    if (typeof value === 'function') {
      const functionName = value.name || 'anonymous';
      return `[[Function - ${functionName}]]`;
    }

    // Handle special cases that JSON.stringify doesn't handle well
    if (value === undefined) {
      return '[[undefined]]';
    }

    if (typeof value === 'symbol') {
      return `[[Symbol - ${value.toString()}]]`;
    }

    if (typeof value === 'bigint') {
      return `[[BigInt - ${value.toString()}]]`;
    }

    // Handle circular references by tracking seen objects
    if (value !== null && typeof value === 'object') {
      if (seen.has(value)) {
        return '[[Circular]]';
      }
      seen.add(value);
      return value;
    }

    return value;
  };
}

function deepEquals(a: any, b: any, visited?: WeakMap<object, Set<object>>): boolean {
  if (a === b) return true;

  if (a == null || b == null) return a === b;

  if (typeof a !== typeof b) return false;

  // Handle functions by comparing their string representations
  if (typeof a === 'function' && typeof b === 'function') {
    return a.toString() === b.toString() && a.name === b.name;
  }

  if (typeof a !== 'object') return a === b;

  // Handle Date objects
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Handle RegExp objects
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString();
  }

  // Initialize visited map on first call
  if (!visited) {
    visited = new WeakMap();
  }

  // Check for cycles - if we've seen this pair before, return true to avoid infinite recursion
  if (visited.has(a)) {
    const visitedSet = visited.get(a)!;
    if (visitedSet.has(b)) {
      return true;
    }
  }

  // Mark this pair as visited to prevent cycles
  if (!visited.has(a)) {
    visited.set(a, new Set());
  }
  visited.get(a)!.add(b);

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEquals(a[i], b[i], visited)) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEquals(a[key], b[key], visited)) return false;
  }

  return true;
}

function generateSnapshotId(functionName: string, index: number): string {
  const timestamp = Date.now().toString(36);
  return `${functionName}_${index}_${timestamp}`;
}

function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle functions by preserving them as-is for runtime use
  // They will be properly serialized later in exportCollectedDataAsJson
  if (typeof obj === 'function') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as T;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}
