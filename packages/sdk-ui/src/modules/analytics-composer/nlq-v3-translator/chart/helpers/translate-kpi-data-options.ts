/**
 * Translates the non-column KPI chart dataOptions keys (`valueMode`, `comparison`)
 * in both directions. Column axes (`value`, `category`) go through the regular axis translators.
 *
 * @internal
 */
import type { Measure } from '@sisense/sdk-data';

import type {
  KpiComparison,
  KpiValueMode,
  StyledMeasureColumn,
} from '@/domains/visualizations/core/chart-data-options/types.js';

import type { NlqTranslationError, NlqTranslationResult } from '../../../types.js';
import { translateMeasuresToJSON } from '../../constructs/measures/translate-measures-to-json.js';
import { translateSingleAxisFromJSON } from '../../shared/data-options/index.js';
import { dataOptionsPath } from '../../shared/utils/error-path.js';
import type { InternalDataSchemaContext, KpiComparisonJSON } from '../../types.js';
import { isRecordStringUnknown } from '../../types.js';

const KPI_VALUE_MODES: readonly KpiValueMode[] = ['last', 'total'];

const PREVIOUS_PERIOD = 'previous-period';

const KPI_COMPARISON_TYPES = [PREVIOUS_PERIOD, 'delta', 'target', 'value'] as const;

type KpiComparisonType = (typeof KPI_COMPARISON_TYPES)[number];

/**
 * Type guard: value is a valid {@link KpiValueMode}.
 *
 * @param value - Value to check.
 * @returns True when the value is 'last' or 'total'.
 */
export function isKpiValueMode(value: unknown): value is KpiValueMode {
  return typeof value === 'string' && (KPI_VALUE_MODES as readonly string[]).includes(value);
}

function isKpiComparisonType(value: unknown): value is KpiComparisonType {
  return typeof value === 'string' && (KPI_COMPARISON_TYPES as readonly string[]).includes(value);
}

type KpiBaselineComparisonType = Exclude<KpiComparisonType, typeof PREVIOUS_PERIOD>;

/**
 * Returns the key holding the comparison baseline for a measure- or target-backed comparison.
 *
 * @param type - Comparison type that carries a baseline.
 * @returns The baseline key.
 */
function getBaselineKey(type: KpiBaselineComparisonType): 'value' | 'target' {
  return type === 'target' ? 'target' : 'value';
}

const invalidComparisonTypeError = (input: unknown): NlqTranslationError => ({
  path: dataOptionsPath('comparison'),
  input,
  message: `Invalid comparison: 'type' must be one of: ${KPI_COMPARISON_TYPES.join(', ')}.`,
});

const missingBaselineError = (
  type: KpiBaselineComparisonType,
  baselineKey: 'value' | 'target',
  input: unknown,
): NlqTranslationError => ({
  path: dataOptionsPath(`comparison.${baselineKey}`),
  input,
  message: `Comparison of type '${type}' requires '${baselineKey}'.`,
});

/**
 * Validates `valueMode` from JSON.
 *
 * @param valueMode - Raw `valueMode` value.
 * @returns NlqTranslationResult with the validated value mode.
 */
export function translateKpiValueModeFromJSON(
  valueMode: unknown,
): NlqTranslationResult<KpiValueMode> {
  if (isKpiValueMode(valueMode)) {
    return { success: true, data: valueMode };
  }
  return {
    success: false,
    errors: [
      {
        path: dataOptionsPath('valueMode'),
        input: valueMode,
        message: `Invalid valueMode '${String(valueMode)}'. Valid values: ${KPI_VALUE_MODES.join(
          ', ',
        )}.`,
      },
    ],
  };
}

/**
 * Translates a CSDK KPI comparison to JSON.
 * Keeps `type`, translates measure baselines and keeps a numeric `target` as is.
 *
 * @param comparison - CSDK `KpiComparison`.
 * @returns NlqTranslationResult with KpiComparisonJSON or errors.
 */
export function translateKpiComparisonToJSON(
  comparison: unknown,
): NlqTranslationResult<KpiComparisonJSON> {
  if (!isRecordStringUnknown(comparison) || !isKpiComparisonType(comparison.type)) {
    return { success: false, errors: [invalidComparisonTypeError(comparison)] };
  }
  const { type } = comparison;
  if (type === PREVIOUS_PERIOD) {
    return { success: true, data: { type } };
  }

  const baselineKey = getBaselineKey(type);
  const baseline = comparison[baselineKey];
  if (baseline == null) {
    return { success: false, errors: [missingBaselineError(type, baselineKey, comparison)] };
  }
  if (baselineKey === 'target' && typeof baseline === 'number') {
    return { success: true, data: { type: 'target', target: baseline } };
  }

  const measureResult = translateMeasuresToJSON([
    baseline as Parameters<typeof translateMeasuresToJSON>[0][number],
  ]);
  if (!measureResult.success) {
    return {
      success: false,
      errors: measureResult.errors.map((e) => ({
        ...e,
        path: dataOptionsPath(`comparison.${baselineKey}`),
      })),
    };
  }
  const measure = measureResult.data[0];
  return {
    success: true,
    data: type === 'target' ? { type, target: measure } : { type, value: measure },
  };
}

/**
 * Translates a KPI comparison from JSON to CSDK.
 * Keeps `type`, translates measure baselines and keeps a numeric `target` as is.
 * Collects errors into `translationErrors`; never throws.
 *
 * @param comparisonJSON - Raw comparison JSON.
 * @param context - Schema context for measure translation.
 * @param translationErrors - Array to collect errors into.
 * @returns CSDK `KpiComparison`, or null if translation failed.
 */
export function translateKpiComparisonFromJSON(
  comparisonJSON: unknown,
  context: InternalDataSchemaContext,
  translationErrors: NlqTranslationError[],
): KpiComparison | null {
  if (!isRecordStringUnknown(comparisonJSON) || !isKpiComparisonType(comparisonJSON.type)) {
    translationErrors.push(invalidComparisonTypeError(comparisonJSON));
    return null;
  }
  const { type } = comparisonJSON;
  if (type === PREVIOUS_PERIOD) {
    return { type };
  }

  const baselineKey = getBaselineKey(type);
  const baseline = comparisonJSON[baselineKey];
  if (baseline == null) {
    translationErrors.push(missingBaselineError(type, baselineKey, comparisonJSON));
    return null;
  }
  if (baselineKey === 'target' && typeof baseline === 'number') {
    return { type: 'target', target: baseline };
  }

  const measureErrors: NlqTranslationError[] = [];
  const translated = translateSingleAxisFromJSON(
    `comparison.${baselineKey}`,
    baseline,
    'measure',
    context,
    measureErrors,
  );
  if (translated === null || translated.length === 0) {
    // A falsy non-null baseline (e.g. 0 or '') translates to nothing without reporting an error
    if (measureErrors.length === 0) {
      translationErrors.push(missingBaselineError(type, baselineKey, comparisonJSON));
      return null;
    }
    translationErrors.push(
      ...measureErrors.map((e) => ({
        ...e,
        path: dataOptionsPath(`comparison.${baselineKey}`),
      })),
    );
    return null;
  }
  const [measure] = translated as (Measure | StyledMeasureColumn)[];
  return type === 'target' ? { type, target: measure } : { type, value: measure };
}
