import merge from 'lodash-es/merge';

import type { WidgetStyle } from '../types.js';
import type { UnsupportedStyleOptions } from './extract-unsupported-style-options.js';

/**
 * Layers the unsupported style fields snapshot from the original Fusion DTO over the
 * freshly rebuilt style. The snapshot comes from {@link extractUnsupportedStyleOptions};
 * the rebuilt style comes from a `to*WidgetStyle` translator.
 *
 * Values in `partialStyle` win. They are fields the CSDK model does not capture, such as
 * axis `inactive`, `ticks` and `labels.rotation`, for which `rebuiltStyle` holds only the
 * Fusion defaults. So a value set in Fusion (a hidden `y2Axis`, say) survives the rebuild
 * instead of being reset to the default. Every value the model derives from the current
 * props still comes from `rebuiltStyle`, because the snapshot never holds such a value.
 *
 * Implemented with `lodash-es/merge`, which performs a deep merge (arrays by index) and
 * skips `undefined` source values.
 *
 * @param rebuiltStyle - The style rebuilt from the widget model.
 * @param partialStyle - The unsupported style fields snapshot from the original DTO.
 * @returns The rebuilt style with the snapshot values restored.
 * @internal
 */
export function applyPartialDtoStyle<T extends WidgetStyle>(
  rebuiltStyle: T,
  partialStyle?: UnsupportedStyleOptions,
): T {
  if (!partialStyle || Object.keys(partialStyle).length === 0) return rebuiltStyle;
  return merge({}, rebuiltStyle, partialStyle) as T;
}
