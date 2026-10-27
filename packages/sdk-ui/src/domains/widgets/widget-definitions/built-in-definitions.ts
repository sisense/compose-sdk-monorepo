import {
  TabberButtonsWidget,
  type TabberButtonsWidgetProps,
} from '@/domains/widgets/components/tabber-buttons-widget';

import { freezeAbilities } from '../widget-identity/ability-defaults';
import type { WidgetAbilities } from '../widget-identity/types';
import { customWidgetKey, type WidgetKey } from '../widget-identity/widget-key';
import { eraseWidgetDefinition } from './erase-widget-definition';
import type { ErasedWidgetDefinition, VisualizationLikeProps, WidgetDefinition } from './types';

/**
 * What the tabber is: it runs no query, emits no data-point events and shows no highlights. Its
 * default size is the Fusion tabber widget's: a 32 px button bar (the width follows the layout row;
 * 512 is the stored default width).
 */
const TABBER_ABILITIES: WidgetAbilities = freezeAbilities({
  data: 'none',
  interactions: [],
  highlights: false,
  drilldown: false,
  layout: { autoHeight: false, defaultSize: { width: 512, height: 32 } },
});

const tabberButtonsDefinition: WidgetDefinition<TabberButtonsWidgetProps> = {
  key: customWidgetKey('tabber-buttons'),
  displayName: 'Tabber',
  abilities: TABBER_ABILITIES,
  visualization: { Component: TabberButtonsWidget },
};

/**
 * Erases the prop types of an authored built-in definition and freezes it.
 *
 * @param definition - The authored built-in definition.
 * @returns The frozen, erased definition.
 */
const asBuiltInDefinition = <Props extends VisualizationLikeProps>(
  definition: WidgetDefinition<Props>,
): ErasedWidgetDefinition => Object.freeze(eraseWidgetDefinition<Props>(definition));

const builtInWidgetDefinitions: readonly ErasedWidgetDefinition[] = [
  asBuiltInDefinition(tabberButtonsDefinition),
];

/**
 * Static, SDK-shipped widget definitions (the `'internal'` tier), keyed by registry key.
 *
 * Built once at module load and shared by every `PluginProvider`. The widget definition registry
 * reads it before its own plugin and legacy entries, so no registration can replace or remove these
 * definitions. `ReadonlyMap` blocks writes at the type level only: `Object.freeze` does not stop
 * `Map.prototype.set`, so never cast the map to a mutable one.
 *
 * @internal
 */
export const BUILT_IN_WIDGET_DEFINITIONS: ReadonlyMap<WidgetKey, ErasedWidgetDefinition> =
  Object.freeze(
    new Map(builtInWidgetDefinitions.map((definition) => [definition.key, definition] as const)),
  );
