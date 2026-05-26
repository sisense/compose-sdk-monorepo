import type { NlqTranslationError } from '../../../types.js';

/**
 * Builds a translation error when widget JSON is missing a required `id`.
 *
 * @internal
 */
export const missingWidgetIdError = (input: unknown): NlqTranslationError => ({
  path: 'id',
  input,
  message: 'Widget id is required',
});

/**
 * Narrows widget JSON to require a present `id`.
 *
 * @internal
 */
export const hasRequiredWidgetId = <T extends { id?: string }>(
  widget: T,
): widget is T & { id: string } => Boolean(widget.id);
