import { JSONValue } from '@sisense/sdk-data';

import { ChartProps } from '@/props.js';

import { NlqTranslationError, NlqTranslationResult } from '../../types.js';
import { translateDimensionsToJSON } from '../constructs/dimensions/translate-dimensions-to-json.js';
import {
  translateFiltersToJSON,
  translateHighlightsToJSON,
} from '../constructs/filters/translate-filters-to-json.js';
import { translateMeasuresToJSON } from '../constructs/measures/translate-measures-to-json.js';
import {
  collectTranslationErrors,
  stripDelimitersFromJson,
} from '../shared/utils/translation-helpers.js';
import { ChartJSON, DataOptionsJSON, isRecordStringUnknown } from '../types.js';

/**
 * Translates CSDK chart props to NLQ ChartJSON format.
 * Direction: CSDK → JSON
 *
 * Translates CSDK ChartProps object to chart JSON format compatible with NLQ API.
 *
 * @example
 * Input:
 * {
 *   chartType: 'column',
 *   dataOptions: {
 *     category: [Attribute(...)],
 *     value: [Measure(...)],
 *     breakBy: [Attribute(...)]
 *   },
 *   filters: [Filter(...)]
 * }
 *
 * Output:
 * {
 *   chartType: 'column',
 *   dataOptions: {
 *     category: ['DM.Commerce.Date.Years'],
 *     value: [
 *       { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] }
 *     ],
 *     breakBy: [{ column: 'DM.Commerce.Gender', sortType: 'sortAsc' }]
 *   },
 *   filters: [
 *     { function: 'filterFactory.members', args: ['DM.Commerce.Date.Years', ['2024-01-01T00:00:00']] }
 *   ]
 * }
 *
 * @param chartProps - Partial chart props with chartType and dataOptions
 * @returns NlqTranslationResult with ChartJSON or errors
 * @internal
 */
export const translateChartToJSON = (
  chartProps: Partial<ChartProps>,
): NlqTranslationResult<ChartJSON> => {
  const translationErrors: NlqTranslationError[] = [];

  // Validate required fields
  if (!chartProps.chartType) {
    return {
      success: false,
      errors: [
        {
          category: 'dimensions',
          index: -1,
          input: chartProps,
          message: 'chartType is required',
        },
      ],
    };
  }

  if (!chartProps.dataOptions) {
    return {
      success: false,
      errors: [
        {
          category: 'dimensions',
          index: -1,
          input: chartProps,
          message: 'dataOptions is required',
        },
      ],
    };
  }

  // Translate dataOptions (structured result; merge errors preserving category/index/input/message)
  let dataOptionsJSON: DataOptionsJSON | null = null;
  const dataOptionsResult = translateDataOptionsToJSON(chartProps.dataOptions);
  if (!dataOptionsResult.success) {
    translationErrors.push(...dataOptionsResult.errors);
  } else {
    dataOptionsJSON = dataOptionsResult.data;
  }

  // Translate filters if present
  let filtersJSON: ChartJSON['filters'] = undefined;
  if (chartProps.filters) {
    const filtersResult = collectTranslationErrors(
      () => translateFiltersToJSON(chartProps.filters),
      translationErrors,
    );
    filtersJSON = (filtersResult ?? undefined) as ChartJSON['filters'];
  }

  // Translate highlights if present
  let highlightsJSON: ChartJSON['highlights'] = undefined;
  if (chartProps.highlights && chartProps.highlights.length > 0) {
    const highlightsResult = collectTranslationErrors(
      () => translateHighlightsToJSON(chartProps.highlights),
      translationErrors,
    );
    highlightsJSON = (highlightsResult ?? undefined) as ChartJSON['highlights'];
  }

  if (translationErrors.length > 0 || dataOptionsJSON === null) {
    return { success: false, errors: translationErrors };
  }

  // Strip delimiters from the entire JSON (chart structure is JSON-serializable at runtime)
  const chartJSONBase: ChartJSON = {
    chartType: chartProps.chartType,
    dataOptions: dataOptionsJSON,
    ...(chartProps.styleOptions && {
      styleOptions: chartProps.styleOptions as Record<string, unknown>,
    }),
    ...(filtersJSON && filtersJSON.length > 0 && { filters: filtersJSON }),
    ...(highlightsJSON && highlightsJSON.length > 0 && { highlights: highlightsJSON }),
  };

  // Type boundary: ChartJSON is JSON-serializable at runtime but TS does not infer assignability to JSONValue
  const strippedChartJSON = stripDelimitersFromJson(
    chartJSONBase as unknown as JSONValue,
  ) as unknown as ChartJSON;

  return {
    success: true,
    data: strippedChartJSON,
  };
};

/**
 * Translates CSDK dataOptions to JSON format.
 * Delegates to dimension/measure translators for each axis.
 * Returns structured result with data or collected errors (never throws).
 *
 * @internal
 */
function translateDataOptionsToJSON(dataOptions: object): NlqTranslationResult<DataOptionsJSON> {
  const result: Record<string, unknown> = {};
  const translationErrors: NlqTranslationError[] = [];

  /** Keys that are primitive metadata, passed through as-is (not dimension/measure arrays) */
  const passthroughKeys = new Set(['seriesToColorMap', 'boxType', 'outliersEnabled', 'valueTitle']);

  for (const [axisKey, axisValue] of Object.entries(dataOptions)) {
    if (axisKey === 'seriesToColorMap' && axisValue) {
      result[axisKey] = axisValue;
      continue;
    }
    if (passthroughKeys.has(axisKey) || axisValue == null) {
      if (axisValue != null) {
        result[axisKey] = axisValue;
      }
      continue;
    }

    // Handle per-item so mixed dimension/measure axes translate correctly
    const items = Array.isArray(axisValue) ? axisValue : [axisValue];
    const isArrayInput = Array.isArray(axisValue);
    const translated: unknown[] = [];
    const axisErrors: NlqTranslationError[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const isDim = isDimensionAxisContent(item);
      const itemResult = isDim
        ? translateDimensionsToJSON([
            item as Parameters<typeof translateDimensionsToJSON>[0][number],
          ])
        : translateMeasuresToJSON([item as Parameters<typeof translateMeasuresToJSON>[0][number]]);
      if (!itemResult.success) {
        itemResult.errors.forEach((e) => {
          axisErrors.push({ ...e, index: i, input: e.input ?? item });
        });
      } else {
        translated.push(...itemResult.data);
      }
    }

    if (axisErrors.length > 0) {
      translationErrors.push(...axisErrors);
      continue;
    }
    result[axisKey] = isArrayInput ? translated : translated[0];
  }

  if (translationErrors.length > 0) {
    return { success: false, errors: translationErrors };
  }
  return { success: true, data: result as DataOptionsJSON };
}

/**
 * Determines if axis content contains dimensions (vs measures).
 * Inspects the actual objects to detect Attribute vs Measure.
 * Handles StyledColumn/StyledMeasureColumn by inspecting the wrapped column.
 * @internal
 */
function isDimensionAxisContent(axisValue: unknown): boolean {
  const firstItem = Array.isArray(axisValue) ? axisValue[0] : axisValue;
  if (!firstItem || !isRecordStringUnknown(firstItem)) {
    return true; // Default to dimensions
  }

  // When item is StyledColumn or StyledMeasureColumn, inspect the column
  const itemToCheck =
    'column' in firstItem && firstItem.column != null && isRecordStringUnknown(firstItem.column)
      ? firstItem.column
      : firstItem;

  // Check for Attribute markers (composeCode starting with "DM.")
  if ('composeCode' in itemToCheck) {
    const composeCode = itemToCheck.composeCode;
    if (typeof composeCode === 'string' && composeCode.startsWith('DM.')) {
      // Attributes have "DM." prefix
      return true;
    }
    // Measure composeCode contains "measureFactory" or "Formula"
    if (
      typeof composeCode === 'string' &&
      (composeCode.includes('measureFactory') || composeCode.includes('Formula'))
    ) {
      return false;
    }
  }

  // Check for Measure markers (aggregation, attribute, or type === 'basemeasure'/'calculatedmeasure')
  if ('type' in itemToCheck) {
    const type = itemToCheck.type;
    if (type === 'basemeasure' || type === 'calculatedmeasure') {
      return false; // It's a measure
    }
  }

  // Default to dimensions (return false if it's a measure)
  return !(
    'aggregation' in itemToCheck ||
    ('attribute' in itemToCheck && 'aggregation' in itemToCheck)
  );
}
