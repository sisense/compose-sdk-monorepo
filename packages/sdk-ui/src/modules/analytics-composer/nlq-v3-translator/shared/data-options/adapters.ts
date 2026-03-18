import type { Attribute, Measure } from '@sisense/sdk-data';
import type { JSONArray } from '@sisense/sdk-data';

import type {
  StyledColumn,
  StyledMeasureColumn,
} from '@/domains/visualizations/core/chart-data-options/types.js';

import type { NlqTranslationError } from '../../../types.js';
import type {
  DimensionItemJSON,
  DimensionTranslationItem,
  MeasureItemJSON,
  MeasureTranslationItem,
} from '../../types.js';

/**
 * Shared adapters and utilities for data options translation.
 * Used by chart and pivot-table translators.
 *
 * @internal
 */

export type AxisType = 'dimension' | 'measure';

export function adaptDimensionsToStyledColumn(
  items: DimensionTranslationItem[],
): (Attribute | StyledColumn)[] {
  return items.map(({ attribute, style }) =>
    style ? ({ column: attribute, ...style } as StyledColumn) : attribute,
  );
}

export function adaptMeasuresToStyledMeasureColumn(
  items: MeasureTranslationItem[],
): (Measure | StyledMeasureColumn)[] {
  return items.map(({ measure, style }) =>
    style ? ({ column: measure, ...style } as StyledMeasureColumn) : measure,
  );
}

export function toJSONArray(
  value: DimensionItemJSON | DimensionItemJSON[] | MeasureItemJSON | MeasureItemJSON[],
): JSONArray {
  return (Array.isArray(value) ? value : [value]) as JSONArray;
}

/**
 * Maps inner translation errors to dataOptions axis context.
 */
export function withAxisContext(axisKey: string): (e: NlqTranslationError) => NlqTranslationError {
  return (e) => ({
    ...e,
    category: 'dataOptions',
    index: axisKey,
  });
}
