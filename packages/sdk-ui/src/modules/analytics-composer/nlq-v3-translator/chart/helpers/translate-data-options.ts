/**
 * Translates dataOptions from JSON to CSDK format.
 * Delegates to dimension/measure translators for each axis.
 *
 * @internal
 */
import { Attribute, Measure } from '@sisense/sdk-data';

import type {
  StyledColumn,
  StyledMeasureColumn,
} from '@/domains/visualizations/core/chart-data-options/types.js';
import type { ChartDataOptions } from '@/types.js';

import { NlqTranslationError, NlqTranslationResult } from '../../../types.js';
import {
  toJSONArray,
  translateSingleAxisFromJSON,
  withAxisContext,
} from '../../shared/data-options/index.js';
import { findBestMatch, SUGGESTION_THRESHOLD } from '../../shared/utils/fuzzy-match.js';
import { collectTranslationErrors } from '../../shared/utils/translation-helpers.js';
import type {
  DataOptionsJSON,
  DimensionItemJSON,
  InternalDataSchemaContext,
  MeasureItemJSON,
} from '../../types.js';
import { isFunctionCall, isRecordStringUnknown } from '../../types.js';
import { isDimensionAxisType } from './axis-type-detection.js';
import { getChartTypeMetadata, VALID_DATA_OPTIONS_KEYS } from './chart-type-schemas.js';

/**
 * Translates a single table column item (dimension or measure) to CSDK format.
 * Returns NlqTranslationResult for use with collectTranslationErrors.
 */
function translateTableColumnItem(
  item: DimensionItemJSON | MeasureItemJSON,
  context: InternalDataSchemaContext,
): NlqTranslationResult<(Attribute | Measure | StyledColumn | StyledMeasureColumn)[]> {
  let column: unknown = undefined;
  if (isRecordStringUnknown(item) && 'column' in item) {
    column = (item as Record<string, unknown>).column;
  }
  const isDim = !(isFunctionCall(item) || (column !== undefined && isFunctionCall(column)));
  const axisType = isDim ? 'dimension' : 'measure';
  const errors: NlqTranslationError[] = [];
  const translated = translateSingleAxisFromJSON('columns', [item], axisType, context, errors);
  if (translated !== null) {
    return { success: true, data: translated };
  }
  return { success: false, errors };
}

function translateTableColumnsAxis(
  items: (DimensionItemJSON | MeasureItemJSON)[],
  context: InternalDataSchemaContext,
  translationErrors: NlqTranslationError[],
  mapError: (e: NlqTranslationError) => NlqTranslationError,
): (Attribute | Measure | StyledColumn | StyledMeasureColumn)[] {
  const columnsResult: (Attribute | Measure | StyledColumn | StyledMeasureColumn)[] = [];
  for (const item of items) {
    const translated = collectTranslationErrors(
      () => translateTableColumnItem(item, context),
      translationErrors,
      mapError,
    );
    if (translated) {
      columnsResult.push(...translated);
    }
  }
  return columnsResult;
}

/**
 * Translates dataOptions from JSON to CSDK format.
 * Delegates to dimension/measure translators for each axis.
 * Collects errors via collectTranslationErrors; never throws.
 */
export function translateDataOptionsFromJSON(
  dataOptionsJSON: DataOptionsJSON | undefined,
  context: InternalDataSchemaContext,
  translationErrors: NlqTranslationError[],
): ChartDataOptions | null {
  if (!dataOptionsJSON || !isRecordStringUnknown(dataOptionsJSON)) {
    translationErrors.push({
      category: 'dataOptions',
      index: -1,
      input: dataOptionsJSON,
      message: 'dataOptions is required',
    });
    return null;
  }

  const result: Record<string, unknown> = {};
  const { chartType } = context;
  const errorsBefore = translationErrors.length;
  const dataOptionsRecord = dataOptionsJSON;

  // Phase 2: Validate axis keys (typos like categry -> category)
  const dataOptionsKeys = Object.keys(dataOptionsJSON);
  const typoKeyToSuggested = new Map<string, string>();
  for (const axisKey of dataOptionsKeys) {
    if (!VALID_DATA_OPTIONS_KEYS.has(axisKey)) {
      const match = findBestMatch(axisKey, [...VALID_DATA_OPTIONS_KEYS], (k) => k);
      const suggestion =
        match && match.distance <= SUGGESTION_THRESHOLD ? ` Did you mean '${match.best}'?` : '';
      if (match && match.distance <= SUGGESTION_THRESHOLD) {
        typoKeyToSuggested.set(axisKey, match.best);
      }
      translationErrors.push({
        category: 'dataOptions',
        index: axisKey,
        input: dataOptionsRecord[axisKey],
        message: `Unknown dataOptions key '${axisKey}'.${suggestion}`,
      });
    }
  }

  // Phase 3: Per-chart-type validation (invalid axis for chart type, missing required axes)
  const metadata = chartType ? getChartTypeMetadata(chartType) : undefined;
  if (metadata) {
    for (const axisKey of dataOptionsKeys) {
      if (axisKey === 'seriesToColorMap') continue;
      if (!metadata.validAxes.has(axisKey) && VALID_DATA_OPTIONS_KEYS.has(axisKey)) {
        const match = findBestMatch(axisKey, [...metadata.validAxes], (k) => k);
        const suggestion =
          match && match.distance <= SUGGESTION_THRESHOLD ? ` Did you mean '${match.best}'?` : '';
        const validList = [...metadata.validAxes].join(', ');
        translationErrors.push({
          category: 'dataOptions',
          index: axisKey,
          input: dataOptionsRecord[axisKey],
          message: `Axis '${axisKey}' is not valid for chart type '${chartType}'. Valid axes: ${validList}.${suggestion}`,
        });
      }
    }
    for (const required of metadata.requiredAxes) {
      const hasTypoThatMeantRequired = [...typoKeyToSuggested.values()].includes(required);
      if (hasTypoThatMeantRequired) {
        continue;
      }
      if (!(required in dataOptionsRecord) || dataOptionsRecord[required] == null) {
        translationErrors.push({
          category: 'dataOptions',
          index: required,
          input: null,
          message: `Chart type '${chartType}' requires '${metadata.requiredAxes.join(
            "' and '",
          )}'. Missing: ${required}.`,
        });
      }
    }
    // Indicator special case: at least one of value, secondary, min, max
    if (chartType === 'indicator') {
      const indicatorAxes = ['value', 'secondary', 'min', 'max'];
      const hasAny = indicatorAxes.some(
        (k) => k in dataOptionsRecord && dataOptionsRecord[k] != null,
      );
      if (!hasAny) {
        translationErrors.push({
          category: 'dataOptions',
          index: -1,
          input: dataOptionsJSON,
          message: 'Indicator chart requires at least one of: value, secondary, min, max.',
        });
      }
    }
    // Scatter special case: at least one of x or y
    if (chartType === 'scatter') {
      const hasXorY =
        ('x' in dataOptionsJSON && dataOptionsJSON.x != null) ||
        ('y' in dataOptionsJSON && dataOptionsJSON.y != null);
      if (!hasXorY) {
        translationErrors.push({
          category: 'dataOptions',
          index: -1,
          input: dataOptionsJSON,
          message: 'Scatter chart requires at least one of: x, y.',
        });
      }
    }
  }

  // If Phase 2 or 3 added errors, return null early (don't process invalid structure)
  if (translationErrors.length > errorsBefore) {
    return null;
  }

  type AxisValue = DimensionItemJSON | DimensionItemJSON[] | MeasureItemJSON | MeasureItemJSON[];
  const entries = Object.entries(dataOptionsJSON) as [string, AxisValue][];
  for (const [axisKey, axisValue] of entries) {
    if (!axisValue) continue;

    // Skip seriesToColorMap - it's not translated, just passed through
    if (axisKey === 'seriesToColorMap') {
      result[axisKey] = axisValue;
      continue;
    }

    if (axisKey === 'columns') {
      result[axisKey] = translateTableColumnsAxis(
        toJSONArray(axisValue) as (DimensionItemJSON | MeasureItemJSON)[],
        context,
        translationErrors,
        withAxisContext('columns'),
      );
      continue;
    }

    // Determine if axis contains dimensions or measures
    const axisType = isDimensionAxisType(axisKey, axisValue, chartType) ? 'dimension' : 'measure';

    const translated = translateSingleAxisFromJSON(
      axisKey,
      axisValue,
      axisType,
      context,
      translationErrors,
    );
    if (translated !== null) {
      // Calendar heatmap expects single value, not array
      const isCalendarHeatmapValue = chartType === 'calendar-heatmap' && axisKey === 'value';
      result[axisKey] =
        isCalendarHeatmapValue || !Array.isArray(axisValue) ? translated[0] : translated;
    }
  }

  // Object shape is produced by axis translators and matches ChartDataOptions.
  return translationErrors.length > errorsBefore ? null : (result as ChartDataOptions);
}
