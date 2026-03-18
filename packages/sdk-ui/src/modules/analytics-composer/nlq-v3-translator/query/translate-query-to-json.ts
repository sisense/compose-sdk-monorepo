import { JSONArray, Measure } from '@sisense/sdk-data';

import { BaseQueryParams } from '@/domains/query-execution/index.js';

import { NlqResponseJSON, NlqTranslationError, NlqTranslationResult } from '../../types.js';
import { translateDimensionsToJSON } from '../constructs/dimensions/translate-dimensions-to-json.js';
import {
  translateFiltersToJSON,
  translateHighlightsToJSON,
} from '../constructs/filters/translate-filters-to-json.js';
import { translateMeasuresToJSON } from '../constructs/measures/translate-measures-to-json.js';
import { parseComposeCodeToFunctionCall } from '../shared/utils/parse-compose-code.js';
import {
  collectTranslationErrors,
  stripDelimitersFromJson,
} from '../shared/utils/translation-helpers.js';
import { FORECAST_PREFIX, TREND_PREFIX } from './constants.js';

/** Query-level styled measure: base Measure + optional trend/forecast (column is Measure, not MeasureColumn). */
type StyledMeasureColumnForQuery = {
  column: Measure;
  trend?: Record<string, unknown>;
  forecast?: Record<string, unknown>;
  [key: string]: unknown;
};

function isTrendMeasure(m: Measure): boolean {
  return (
    (m.composeCode?.includes('measureFactory.trend') ?? false) ||
    (m.name?.startsWith(TREND_PREFIX) ?? false)
  );
}

function isForecastMeasure(m: Measure): boolean {
  return (
    (m.composeCode?.includes('measureFactory.forecast') ?? false) ||
    (m.name?.startsWith(FORECAST_PREFIX) ?? false)
  );
}

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
        forecastOpts = getCompanionOptions(companionCode);
        consumed.add(nextIdx);
      }
    }

    if (trendOpts !== undefined || forecastOpts !== undefined) {
      result.push({
        column: measure,
        ...(trendOpts && Object.keys(trendOpts).length > 0 && { trend: trendOpts }),
        ...(forecastOpts && Object.keys(forecastOpts).length > 0 && { forecast: forecastOpts }),
      });
    } else {
      result.push(measure);
    }
  }
  return result;
}

/**
 * Translates CSDK BaseQueryParams to NLQ JSON format.
 * Direction: CSDK → JSON
 *
 * Converts CSDK objects (Attribute[], Measure[], Filter[], FilterRelations) to NLQ FunctionCall format.
 *
 * @example
 * ```typescript
 * const query: BaseQueryParams = {
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
 * @param query - BaseQueryParams object with CSDK objects
 * @returns NlqTranslationResult<NlqResponseJSON> with FunctionCall format or structured errors
 * @internal
 */
export function translateQueryToJSON(
  query: BaseQueryParams,
): NlqTranslationResult<NlqResponseJSON> {
  const translationErrors: NlqTranslationError[] = [];

  // Process each translation category
  const dimensions = collectTranslationErrors<JSONArray>(
    () => translateDimensionsToJSON(query.dimensions || []),
    translationErrors,
  );

  const collapsedMeasures = collapseMeasuresForJSON(query.measures || []);
  const measures = collectTranslationErrors<JSONArray>(
    () => translateMeasuresToJSON(collapsedMeasures),
    translationErrors,
  );

  const filters = collectTranslationErrors<JSONArray>(
    () => translateFiltersToJSON(query.filters),
    translationErrors,
  );

  let highlights = null;
  if (query.highlights && query.highlights.length > 0) {
    highlights = collectTranslationErrors<JSONArray>(
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
  const result: NlqResponseJSON = {
    dimensions: dimensions || [],
    measures: measures || [],
    filters: filters || [],
    ...(highlights && { highlights: highlights }),
  };

  return {
    success: true,
    // Strip [[delimiters]] from all strings to preserve original names with spaces
    data: stripDelimitersFromJson(result),
  };
}
