/**
 * Translates a single data options axis from JSON to CSDK format.
 * Shared by chart and pivot-table translators.
 *
 * @internal
 */
import type { Attribute, Measure } from '@sisense/sdk-data';

import type {
  StyledColumn,
  StyledMeasureColumn,
} from '@/domains/visualizations/core/chart-data-options/types.js';

import type { NlqTranslationError } from '../../../types.js';
import { translateDimensionsFromJSON } from '../../constructs/dimensions/translate-dimensions-from-json.js';
import { translateMeasuresFromJSON } from '../../constructs/measures/translate-measures-from-json.js';
import type { InternalDataSchemaContext } from '../../types.js';
import { collectTranslationErrors } from '../utils/translation-helpers.js';
import {
  adaptDimensionsToStyledColumn,
  adaptMeasuresToStyledMeasureColumn,
  type AxisType,
  toJSONArray,
  withAxisContext,
} from './adapters.js';

export type { AxisType };

export type TranslatedAxis = (Attribute | StyledColumn)[] | (Measure | StyledMeasureColumn)[];

/**
 * Translates a single axis from JSON to CSDK format.
 *
 * @param axisKey - The axis key (e.g. 'category', 'value', 'rows', 'columns')
 * @param axisValue - The axis value (array or single item)
 * @param axisType - Whether the axis contains dimensions or measures
 * @param context - Schema context for translation
 * @param translationErrors - Array to collect errors into
 * @returns Translated array or null if translation failed
 */
export function translateSingleAxisFromJSON(
  axisKey: string,
  axisValue: unknown,
  axisType: AxisType,
  context: InternalDataSchemaContext,
  translationErrors: NlqTranslationError[],
): TranslatedAxis | null {
  const arr = axisValue
    ? toJSONArray(
        axisValue as
          | import('../../types.js').DimensionItemJSON
          | import('../../types.js').DimensionItemJSON[]
          | import('../../types.js').MeasureItemJSON
          | import('../../types.js').MeasureItemJSON[],
      )
    : [];
  if (arr.length === 0) {
    return [];
  }

  if (axisType === 'dimension') {
    const dimensionsData = collectTranslationErrors(
      () =>
        translateDimensionsFromJSON({
          data: arr,
          context,
        }),
      translationErrors,
      withAxisContext(axisKey),
    );
    return dimensionsData !== null ? adaptDimensionsToStyledColumn(dimensionsData) : null;
  }

  const measuresData = collectTranslationErrors(
    () =>
      translateMeasuresFromJSON({
        data: arr,
        context,
      }),
    translationErrors,
    withAxisContext(axisKey),
  );
  return measuresData !== null ? adaptMeasuresToStyledMeasureColumn(measuresData) : null;
}
