/**
 * Validates top-level WidgetJSON structure.
 * Detects missing or invalid `widgetType` before dispatching to sub-translators.
 *
 * @internal
 */
import type { WidgetType } from '@/domains/widgets/components/widget/types.js';

import type { NlqTranslationError } from '../../../types.js';
import { findBestMatch, SUGGESTION_THRESHOLD } from '../../shared/utils/fuzzy-match.js';
import { isRecordStringUnknown } from '../../types.js';

const VALID_WIDGET_TYPES: readonly WidgetType[] = ['chart', 'pivot', 'text', 'custom'];

const isValidWidgetType = (value: unknown): value is WidgetType =>
  typeof value === 'string' && VALID_WIDGET_TYPES.includes(value as WidgetType);

/**
 * Validates that widget JSON includes a supported `widgetType`.
 *
 * @param rawInput - Raw widget JSON object
 * @returns Validation error, or `null` when `widgetType` is present and valid
 */
export function validateWidgetType(rawInput: unknown): NlqTranslationError | null {
  if (!isRecordStringUnknown(rawInput)) {
    return {
      path: 'widgetType',
      input: rawInput,
      message: 'Expected an object',
    };
  }

  const widgetTypeValue = rawInput.widgetType;
  if (widgetTypeValue === undefined) {
    const inputKeys = Object.keys(rawInput);
    const match = findBestMatch('widgetType', inputKeys, (k) => k);
    const suggestion =
      match && match.distance <= SUGGESTION_THRESHOLD
        ? ` Did you mean 'widgetType'? (You may have typed '${match.best}')`
        : '';
    const input =
      match && match.distance <= SUGGESTION_THRESHOLD
        ? { [match.best]: rawInput[match.best] }
        : rawInput;
    return {
      path: 'widgetType',
      input,
      message: `widgetType is required.${suggestion}`,
    };
  }

  if (!isValidWidgetType(widgetTypeValue)) {
    const match = findBestMatch(String(widgetTypeValue), VALID_WIDGET_TYPES, (t) => t);
    const suggestion =
      match && match.distance <= SUGGESTION_THRESHOLD ? ` Did you mean '${match.best}'?` : '';
    const validList = VALID_WIDGET_TYPES.join(', ');
    return {
      path: 'widgetType',
      input: widgetTypeValue,
      message: `Invalid widgetType '${String(
        widgetTypeValue,
      )}'. Valid types: ${validList}${suggestion}`,
    };
  }

  return null;
}
