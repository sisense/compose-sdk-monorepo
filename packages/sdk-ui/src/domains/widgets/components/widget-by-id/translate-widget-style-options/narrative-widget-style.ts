import type { WidgetContainerStyleOptions } from '@/types.js';

import type { WidgetStyle } from '../types.js';

/**
 * Extracts CSDK style options for the dashboard narrative widget from the Fusion DTO style.
 * The widget persists no style keys of its own: the container design (`widgetDesign`) is
 * flattened separately by the DTO pipeline, and the per-widget `narration` feature does not apply.
 * @returns The dashboard narrative widget style options for CSDK
 */
export function extractNarrativeWidgetStyleOptions(): WidgetContainerStyleOptions {
  return {};
}

/**
 * Encodes the dashboard narrative widget's CSDK style options into the Fusion DTO style.
 * Container design is appended generically by the DTO pipeline, and runtime-only style options
 * (header render props) must not reach the DTO.
 * @returns The widget style for DTO
 */
export function toNarrativeWidgetStyle(): WidgetStyle {
  return {};
}
