/**
 * Utility for decorating HighchartsOptionsBuilder objects with input/output collection.
 * This enables comprehensive runtime data collection for all builder methods,
 * making it easier to generate unit tests and understand builder behavior.
 */

import {
  HighchartsOptionsBuilder,
  HighchartBasedChartTypes,
} from '@/chart/restructured-charts/highchart-based-charts/types';
import { withInputOutputCollection } from './input-output-collector.js';

/**
 * Generic decorator that wraps all methods of an object with input/output collection.
 * Uses currying pattern: withMethodsInputOutputCollection(config)(objectToDecorate)
 *
 * This enables comprehensive runtime data collection for all object methods,
 * making it easier to generate unit tests and understand object behavior.
 *
 * @param options - Configuration options for the collection behavior
 * @returns Function that takes the object to decorate and returns the decorated object
 *
 * @example
 * ```ts
 * // Basic usage:
 * const instrumentedBuilder = withMethodsInputOutputCollection({
 *   objectName: 'myChartBuilder',
 *   maxSnapshots: 50
 * })(myChartBuilder);
 *
 * // After running the application:
 * printCollectedInfo(); // Shows data for all object methods
 * ```
 */
export function withMethodsInputOutputCollection<T extends Record<string, any>>(options: {
  /** Name identifier for the object (used in collection namespacing) */
  objectName: string;
  /** Maximum number of unique snapshots to collect per method (default: 100) */
  maxSnapshots?: number;
}) {
  const { objectName, maxSnapshots = 100 } = options;

  return function decorator(obj: T): T {
    const decoratedObj = {} as T;

    // Iterate over all enumerable properties of the object
    for (const key in obj) {
      if (typeof obj[key] === 'function') {
        (decoratedObj as any)[key] = withInputOutputCollection({
          functionName: `${objectName}.${key}`,
          maxSnapshots,
        })(obj[key]);
      } else {
        // Preserve non-function properties as-is
        (decoratedObj as any)[key] = obj[key];
      }
    }

    return decoratedObj;
  };
}

/**
 * Specific decorator for HighchartsOptionsBuilder that follows the generic pattern.
 * Uses currying pattern: withHighchartsOptionsBuilderCollection(config)(builderToDecorate)
 *
 * Each method gets its own collection namespace (e.g., "barBuilder.getChart", "barBuilder.getSeries")
 * to enable granular analysis of how different parts of the chart configuration are built.
 *
 * @param options - Configuration options for the collection behavior
 * @returns Function that takes the builder to decorate and returns the decorated builder
 *
 * @example
 * ```ts
 * const instrumentedBuilder = withHighchartsOptionsBuilderDataCollections({
 *   builderName: 'myChartBuilder',
 *   maxSnapshots: 50
 * })(myChartBuilder);
 *
 * // After running the application:
 * printCollectedInfo(); // Shows data for all builder methods
 * ```
 */
export function withHighchartsOptionsBuilderDataCollection<
  CT extends HighchartBasedChartTypes,
>(options: {
  /** Name identifier for the builder (used in collection namespacing) */
  builderName: string;
  /** Maximum number of unique snapshots to collect per method (default: 100) */
  maxSnapshots?: number;
}) {
  return function decorator(builder: HighchartsOptionsBuilder<CT>): HighchartsOptionsBuilder<CT> {
    return withMethodsInputOutputCollection<HighchartsOptionsBuilder<CT>>({
      objectName: options.builderName,
      maxSnapshots: options.maxSnapshots,
    })(builder);
  };
}
