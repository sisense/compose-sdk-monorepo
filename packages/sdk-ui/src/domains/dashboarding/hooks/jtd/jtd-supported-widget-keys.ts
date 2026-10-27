import type { FusionWidgetType } from '@/domains/widgets/components/widget-by-id/types.js';
import type { WidgetProps } from '@/domains/widgets/components/widget/types.js';
import {
  BUILT_IN_WIDGET_DESCRIPTORS,
  type BuiltInWidgetDescriptor,
  type BuiltInWidgetKey,
  fusionTypesOfKey,
} from '@/domains/widgets/widget-identity/index.js';

/**
 * Loading list: built-in widget types whose Jump To Dashboard (JTD) config is restored from a saved
 * Fusion dashboard.
 *
 * It mirrors the widget types the Fusion Jump to Dashboard add-on supports. A saved JTD config on any
 * other widget type is dropped on load ({@link widgetTypeSupportsJtd}), as Fusion ignores it too.
 *
 * It does not limit JTD at run time: a JTD config given in code applies to every type in
 * {@link JTD_APPLICABLE_WIDGET_KEYS}.
 *
 * Feature policy, not a property of the widget type: whether a widget can be clicked is a fact about
 * the widget, but which clickable types get JTD is decided here, by the JTD feature.
 *
 * @internal
 */
export const JTD_SUPPORTED_WIDGET_KEYS: readonly BuiltInWidgetKey[] = [
  'pie',
  'indicator',
  'text',
  'column',
  'bar',
  'line',
  'area',
  'pivot',
  'scatter',
  'polar',
];

/**
 * Fusion widget DTO types that support Jump To Dashboard (JTD), derived from
 * {@link JTD_SUPPORTED_WIDGET_KEYS}. Each key expands to its canonical type and aliases,
 * so `'pivot'` yields both `'pivot2'` and `'pivot'`.
 *
 * @internal
 */
export const JTD_SUPPORTED_WIDGET_TYPES: readonly FusionWidgetType[] =
  JTD_SUPPORTED_WIDGET_KEYS.flatMap(fusionTypesOfKey);

/**
 * Checks whether a Fusion widget DTO type supports Jump To Dashboard (JTD).
 *
 * @param fusionWidgetType - The Fusion widget DTO type.
 * @returns `true` if the widget type supports JTD, `false` otherwise.
 * @internal
 */
export function widgetTypeSupportsJtd(fusionWidgetType: FusionWidgetType): boolean {
  return JTD_SUPPORTED_WIDGET_TYPES.includes(fusionWidgetType);
}

/**
 * Run-time list: built-in widget types that a Jump To Dashboard (JTD) config applies to at run time,
 * whether it was loaded from a saved dashboard or given in code (dashboard widget options or
 * `useJtdWidget`). Every built-in chart type, plus pivot and text.
 *
 * Click and right-click navigation, the pointer cursor and the JTD header icon all read this list
 * (see {@link isJtdApplicableWidget}). Custom widgets, filter widgets and the narrative widget are
 * never in it. It is a superset of {@link JTD_SUPPORTED_WIDGET_KEYS}.
 *
 * @internal
 */
export const JTD_APPLICABLE_WIDGET_KEYS: readonly BuiltInWidgetKey[] = [
  ...Object.values<BuiltInWidgetDescriptor>(BUILT_IN_WIDGET_DESCRIPTORS)
    .filter((descriptor) => descriptor.widgetType === 'chart')
    .map((descriptor) => descriptor.key),
  'pivot',
  'text',
];

/**
 * Checks whether a Jump To Dashboard (JTD) config applies at run time to a built-in widget type.
 *
 * @param key - The built-in widget key.
 * @returns `true` if the key is in {@link JTD_APPLICABLE_WIDGET_KEYS}, `false` otherwise.
 * @internal
 */
export function isJtdApplicableWidgetKey(key: BuiltInWidgetKey): boolean {
  return JTD_APPLICABLE_WIDGET_KEYS.includes(key);
}

/**
 * Resolves the built-in widget key of widget props: the chart type for chart widgets, the widget
 * type for the other built-in widgets, `undefined` for custom widgets.
 *
 * @param widgetProps - The widget props.
 * @returns The built-in widget key, or `undefined` for custom widgets.
 */
const builtInWidgetKeyOf = (widgetProps: WidgetProps): BuiltInWidgetKey | undefined => {
  switch (widgetProps.widgetType) {
    case 'chart':
      return widgetProps.chartType;
    case 'custom':
      return undefined;
    default:
      return widgetProps.widgetType;
  }
};

/**
 * Checks whether a Jump To Dashboard (JTD) config applies to a widget at run time, by its built-in
 * widget key. Custom widgets never qualify.
 *
 * @param widgetProps - The widget props.
 * @returns `true` if the widget's key is in {@link JTD_APPLICABLE_WIDGET_KEYS}, `false` otherwise.
 * @internal
 */
export function isJtdApplicableWidget(widgetProps: WidgetProps): boolean {
  const key = builtInWidgetKeyOf(widgetProps);
  return key !== undefined && isJtdApplicableWidgetKey(key);
}
