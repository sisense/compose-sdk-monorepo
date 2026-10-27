import type { WidgetProps } from '../components/widget/types';
import { PLUGIN_ABILITY_DEFAULTS } from './ability-defaults';
import { BUILT_IN_WIDGET_DESCRIPTORS } from './descriptors';
import type { WidgetAbilities } from './types';
import { isCustomWidgetKey, type WidgetKey, widgetKeyOf } from './widget-key';

/**
 * Where {@link abilitiesOfKey} reads the resolved abilities of custom widget types: a widget
 * definition registry (one per `PluginProvider`), or anything with the same `get`.
 *
 * @internal
 */
export interface WidgetAbilitiesLookup {
  /**
   * Looks up the definition registered under a key.
   *
   * @param key - The registry key.
   * @returns The definition, or `undefined` when none is registered.
   */
  get(key: WidgetKey): { readonly abilities: WidgetAbilities } | undefined;
}

/**
 * Resolves the declared abilities of a widget type.
 *
 * Built-in keys read the descriptor table and ignore the registry. `custom:` keys read the
 * definition registered in `registry`; an unknown custom widget type, or no registry, gets
 * {@link PLUGIN_ABILITY_DEFAULTS}.
 *
 * @param key - The registry key of the widget type.
 * @param registry - The registry holding the plugin and legacy custom widget definitions.
 * @returns The resolved, complete abilities.
 * @internal
 */
export const abilitiesOfKey = (key: WidgetKey, registry?: WidgetAbilitiesLookup): WidgetAbilities =>
  isCustomWidgetKey(key)
    ? registry?.get(key)?.abilities ?? PLUGIN_ABILITY_DEFAULTS
    : BUILT_IN_WIDGET_DESCRIPTORS[key].abilities;

/**
 * Resolves the declared abilities of a widget from its props. See {@link abilitiesOfKey}.
 *
 * @param widgetProps - The widget props.
 * @param registry - The registry holding the plugin and legacy custom widget definitions.
 * @returns The resolved, complete abilities.
 * @internal
 */
export const abilitiesOf = (
  widgetProps: WidgetProps,
  registry?: WidgetAbilitiesLookup,
): WidgetAbilities => abilitiesOfKey(widgetKeyOf(widgetProps), registry);
