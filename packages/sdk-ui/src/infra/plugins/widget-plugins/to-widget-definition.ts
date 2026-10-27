import type { ErasedWidgetDefinition } from '@/domains/widgets/widget-definitions';
import { customWidgetKey } from '@/domains/widgets/widget-identity';

import { resolvePluginAbilities } from './resolve-plugin-abilities.js';
import type { AnyWidgetPlugin } from './types.js';

/**
 * Maps a widget plugin's `customWidget` declaration to a widget definition keyed
 * `custom:<name>`, with its abilities resolved over the plugin defaults. The plugin manifest itself
 * is unchanged.
 *
 * @param customWidget - The validated custom widget declaration of a widget plugin.
 * @param pluginName - The name of the plugin declaring the widget, for validation warnings.
 * @returns The widget definition to register in the plugin tier.
 * @internal
 */
export const toWidgetDefinition = (
  customWidget: NonNullable<AnyWidgetPlugin['customWidget']>,
  pluginName: string,
): ErasedWidgetDefinition => ({
  key: customWidgetKey(customWidget.name),
  displayName: customWidget.displayName,
  abilities: resolvePluginAbilities(customWidget.abilities, pluginName),
  ...(customWidget.icon && { icon: customWidget.icon }),
  ...(customWidget.config && { config: customWidget.config }),
  ...(customWidget.dataPanel && { dataPanel: customWidget.dataPanel }),
  visualization: { Component: customWidget.visualization.Component },
  ...(customWidget.designPanel && { designPanel: customWidget.designPanel }),
});
