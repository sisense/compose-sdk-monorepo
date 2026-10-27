import type { WidgetProps, WidgetType } from '../components/widget/types';
import { BUILT_IN_WIDGET_DESCRIPTORS } from './descriptors';
import type { BuiltInWidgetKey } from './types';

/**
 * Key of a custom widget type in the widget definition registry: `custom:<customWidgetType>`.
 *
 * @internal
 */
export type CustomWidgetKey = `custom:${string}`;

/**
 * Registry key of a widget type: a {@link BuiltInWidgetKey}, or `custom:<customWidgetType>` for
 * every custom widget (plugin, legacy custom widget or the SDK-shipped tabber).
 *
 * The `custom:` prefix keeps the two namespaces apart, so a plugin named `line` does not collide
 * with the built-in `line`. It is internal to the registry and never reaches DTOs, tracking or
 * public types.
 *
 * @internal
 */
export type WidgetKey = BuiltInWidgetKey | CustomWidgetKey;

/**
 * Builds the registry key of a custom widget type.
 *
 * @param customWidgetType - The custom widget type name (`customWidgetType`), without prefix.
 * @returns The `custom:`-prefixed registry key.
 * @internal
 */
export const customWidgetKey = (customWidgetType: string): CustomWidgetKey =>
  `custom:${customWidgetType}`;

/**
 * Checks whether a registry key belongs to a custom widget type.
 *
 * @param key - The registry key to check.
 * @returns `true` when the key is `custom:`-prefixed.
 * @internal
 */
export const isCustomWidgetKey = (key: WidgetKey): key is CustomWidgetKey =>
  key.startsWith('custom:');

/**
 * Resolves the widget type family of a registry key: the descriptor's `widgetType` for built-in
 * keys and `'custom'` for custom keys.
 *
 * @param key - The registry key.
 * @returns The widget type family.
 * @internal
 */
export const familyOfKey = (key: WidgetKey): WidgetType =>
  isCustomWidgetKey(key) ? 'custom' : BUILT_IN_WIDGET_DESCRIPTORS[key].widgetType;

/**
 * Resolves the registry key of a widget from its props: the chart type for chart widgets,
 * `custom:<customWidgetType>` for custom widgets, and the widget type otherwise.
 *
 * @param widgetProps - The widget props.
 * @returns The registry key of the widget's type.
 * @internal
 */
export const widgetKeyOf = (widgetProps: WidgetProps): WidgetKey => {
  switch (widgetProps.widgetType) {
    case 'chart':
      return widgetProps.chartType;
    case 'custom':
      return customWidgetKey(widgetProps.customWidgetType);
    default:
      return widgetProps.widgetType;
  }
};
