import {
  FORECAST_PREFIX,
  isForecastMeasure,
  isTrendMeasure,
  Measure,
  parseComposeCodeToFunctionCall,
  TREND_PREFIX,
} from '@sisense/sdk-data';

import type { ExecuteQueryParams } from '@/domains/query-execution/index.js';

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
import type { QueryJSON } from '../types.js';

/** Query-level styled measure: base Measure + optional trend/forecast (column is Measure, not MeasureColumn). */
type StyledMeasureColumnForQuery = {
  column: Measure;
  trend?: Record<string, unknown>;
  forecast?: Record<string, unknown>;
  [key: string]: unknown;
};

/**
 * Extracts trend/forecast options from a companion measure's composeCode (args[2]).
 * Returns undefined if parsing fails or args[2] is missing.
 */
function getCompanionOptions(composeCode: string): Record<string, unknown> | undefined {
  try {
    const parsed = parseComposeCodeToFunctionCall(composeCode.trim());
    return parsed.args[2] != null && typeof parsed.args[2] === 'object'
      ? (parsed.args[2] as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Collapses expanded [base, trend?, forecast?] measures back into StyledMeasureColumn
 * so that round-trip JSON → query → JSON reproduces the original structure.
 * Reverse of adaptMeasuresForQuery: matches companions by order and TREND_PREFIX/FORECAST_PREFIX naming.
 */
function collapseMeasuresForJSON(measures: Measure[]): (Measure | StyledMeasureColumnForQuery)[] {
  if (!measures?.length) return [];
  const consumed = new Set<number>();
  const result: (Measure | StyledMeasureColumnForQuery)[] = [];

  for (let i = 0; i < measures.length; i++) {
    if (consumed.has(i)) continue;
    const measure = measures[i];

    if (isTrendMeasure(measure) || isForecastMeasure(measure)) {
      result.push(measure);
      continue;
    }

    const baseName = measure.name ?? 'Measure';
    const expectedTrendName = `${TREND_PREFIX}_${baseName}`;
    const expectedForecastName = `${FORECAST_PREFIX}_${baseName}`;

    // Whether a companion was MATCHED (by position + TREND_PREFIX/FORECAST_PREFIX name) is tracked
    // separately from whether its composeCode's options object could be parsed — a companion built
    // with no explicit options (e.g. `trend: {}`, the default) has a 2-argument composeCode with no
    // options object at all, so `getCompanionOptions` correctly returns `undefined` for it. Losing
    // track of "matched" in that case (as the `trendOpts !== undefined` check below used to) drops
    // the companion silently instead of tagging it with empty options — the query round-trips into
    // JSON missing a real trend/forecast measure with no error anywhere.
    let trendMatched = false;
    let forecastMatched = false;
    let trendOpts: Record<string, unknown> | undefined;
    let forecastOpts: Record<string, unknown> | undefined;
    let nextIdx = i + 1;

    if (
      nextIdx < measures.length &&
      !consumed.has(nextIdx) &&
      isTrendMeasure(measures[nextIdx]) &&
      measures[nextIdx].name === expectedTrendName
    ) {
      const companionCode = measures[nextIdx].composeCode?.trim();
      if (companionCode) {
        trendMatched = true;
        trendOpts = getCompanionOptions(companionCode);
        consumed.add(nextIdx);
        nextIdx++;
      }
    }

    if (
      nextIdx < measures.length &&
      !consumed.has(nextIdx) &&
      isForecastMeasure(measures[nextIdx]) &&
      measures[nextIdx].name === expectedForecastName
    ) {
      const companionCode = measures[nextIdx].composeCode?.trim();
      if (companionCode) {
        forecastMatched = true;
        forecastOpts = getCompanionOptions(companionCode);
        consumed.add(nextIdx);
      }
    }

    if (trendMatched || forecastMatched) {
      result.push({
        column: measure,
        ...(trendMatched && { trend: trendOpts ?? {} }),
        ...(forecastMatched && { forecast: forecastOpts ?? {} }),
      });
    } else {
      result.push(measure);
    }
  }
  return result;
}

/**
 * Translates CSDK ExecuteQueryParams to NLQ JSON format.
 * Direction: CSDK → JSON
 *
 * Converts CSDK objects (Attribute[], Measure[], Filter[], FilterRelations) to NLQ FunctionCall format.
 *
 * @example
 * ```typescript
 * const query: ExecuteQueryParams = {
 *   dimensions: [DM.Category.Category, DM.Brand.Brand],
 *   measures: [
 *     measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
 *     measureFactory.sum(DM.Commerce.Cost, 'Total Cost'),
 *   ],
 *   filters: [
 *     filterFactory.members(DM.Commerce.Date.Years, ['2024-01-01T00:00:00']),
 *     filterFactory.topRanking(DM.Brand.Brand, measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'), 5),
 *   ],
 * };
 *
 * const result = translateQueryToJSON(query);
 * if (result.success) {
 *   // result.data contains:
 *   // {
 *   //   dimensions: ['DM.Category.Category', 'DM.Brand.Brand'],
 *   //   measures: [
 *   //     { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
 *   //     { function: 'measureFactory.sum', args: ['DM.Commerce.Cost', 'Total Cost'] },
 *   //   ],
 *   //   filters: [
 *   //     { function: 'filterFactory.members', args: ['DM.Commerce.Date.Years', ['2024-01-01T00:00:00']] },
 *   //     { function: 'filterFactory.topRanking', args: ['DM.Brand.Brand', {...}, 5] },
 *   //   ],
 *   // }
 * } else {
 *   // Handle errors: result.errors contains structured error information
 * }
 * ```
 *
 * @example
 * To translate only measures or shared formulas:
 * ```typescript
 * const result = translateQueryToJSON({
 *   measures: [measureFactory.sum(DM.Commerce.Revenue)],
 *   dimensions: [],
 *   filters: [],
 * });
 * ```
 *
 * @param query - ExecuteQueryParams object with CSDK objects
 * @returns NlqTranslationResult<QueryJSON> with FunctionCall format or structured errors
 * @internal
 */
export function translateQueryToJSON(query: ExecuteQueryParams): NlqTranslationResult<QueryJSON> {
  const translationErrors: NlqTranslationError[] = [];

  // Process each translation category
  const dimensions = collectTranslationErrors(
    () => translateDimensionsToJSON(query.dimensions || []),
    translationErrors,
  );

  const collapsedMeasures = collapseMeasuresForJSON(query.measures || []);
  const measures = collectTranslationErrors(
    () => translateMeasuresToJSON(collapsedMeasures),
    translationErrors,
  );

  const filters = collectTranslationErrors(
    () => translateFiltersToJSON(query.filters),
    translationErrors,
  );

  let highlights = null;
  if (query.highlights && query.highlights.length > 0) {
    highlights = collectTranslationErrors(
      () => translateHighlightsToJSON(query.highlights),
      translationErrors,
    );
  }

  // If any errors were collected, return structured error response
  if (translationErrors.length > 0) {
    return {
      success: false,
      errors: translationErrors,
    };
  }

  // Return successful result
  const result: QueryJSON = {
    dimensions: dimensions || [],
    measures: measures || [],
    filters: filters || [],
    ...(highlights && { highlights }),
  };

  return {
    success: true,
    // Strip [[delimiters]] from all strings to preserve original names with spaces
    data: stripDelimitersFromJson(result),
  };
}
