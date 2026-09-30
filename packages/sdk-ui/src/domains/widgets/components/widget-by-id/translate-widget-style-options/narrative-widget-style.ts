import type { NarrativeWidgetStyleOptions } from '@/domains/widgets/components/narrative-widget/types.js';

import type { WidgetStyle } from '../types.js';

/** The dashboard narrative widget's own key in the Fusion DTO style. */
type NarrativeWidgetStyle = {
  automaticHeight?: boolean;
};

/**
 * Extracts CSDK style options for the dashboard narrative widget from the Fusion DTO style.
 * The container design (`widgetDesign`) is flattened separately by the DTO pipeline, and the
 * per-widget `narration` feature does not apply; the widget's own key is `automaticHeight`.
 * @param style - Fusion DTO style of the widget.
 * @returns The dashboard narrative widget style options for CSDK
 */
export function extractNarrativeWidgetStyleOptions(
  style: NarrativeWidgetStyle | undefined,
): NarrativeWidgetStyleOptions {
  return style?.automaticHeight === undefined ? {} : { isAutoHeight: style.automaticHeight };
}

/**
 * Encodes the dashboard narrative widget's CSDK style options into the Fusion DTO style.
 * Container design is appended generically by the DTO pipeline, and runtime-only style options
 * (header render props) must not reach the DTO.
 * @param styleOptions - Style options of the widget model.
 * @returns The widget style for DTO
 */
export function toNarrativeWidgetStyle(
  styleOptions: NarrativeWidgetStyleOptions | undefined,
): WidgetStyle {
  return styleOptions?.isAutoHeight === undefined
    ? {}
    : { automaticHeight: styleOptions.isAutoHeight };
}
