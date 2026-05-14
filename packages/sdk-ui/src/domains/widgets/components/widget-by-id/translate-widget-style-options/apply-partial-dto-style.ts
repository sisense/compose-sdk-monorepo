import merge from 'lodash-es/merge';

import type { WidgetStyle } from '../types.js';
import type { UnsupportedStyleOptions } from './extract-unsupported-style-options.js';

/**
 * Layers `partialStyle` (the unsupported style fields snapshot from the original
 * Fusion DTO, see {@link extractUnsupportedStyleOptions}) underneath the freshly
 * `rebuiltStyle` produced by `to*WidgetStyle`.
 *
 * Priority (highest to lowest):
 *   1. `rebuiltStyle` — values produced by the SDK → DTO translation.
 *   2. `partialStyle` — values plucked from the original DTO.
 *
 * Implemented with `lodash-es/merge`, which performs a deep merge and skips
 * `undefined` source values, so any field the rebuild does emit takes precedence
 * while gap fields the rebuild leaves untouched are filled in from `partialStyle`.
 *
 * @internal
 */
export function applyPartialDtoStyle<T extends WidgetStyle>(
  rebuiltStyle: T,
  partialStyle?: UnsupportedStyleOptions,
): T {
  if (!partialStyle || Object.keys(partialStyle).length === 0) return rebuiltStyle;
  return merge({}, partialStyle, rebuiltStyle) as T;
}
