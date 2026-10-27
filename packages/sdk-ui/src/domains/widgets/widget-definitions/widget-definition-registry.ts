import type { AnyCustomVisualization } from '@/infra/plugins/widget-plugins/types';

import { PLUGIN_ABILITY_DEFAULTS } from '../widget-identity/ability-defaults';
import { customWidgetKey, type WidgetKey } from '../widget-identity/widget-key';
import { BUILT_IN_WIDGET_DEFINITIONS } from './built-in-definitions';
import type { ErasedWidgetDefinition } from './types';

/**
 * Registry tier a widget definition belongs to: the SDK's static built-ins (`'internal'`), a widget
 * plugin or a legacy custom widget registration. The tier is registry bookkeeping; it is not part of
 * the definition.
 *
 * @internal
 */
export type WidgetDefinitionSource = 'internal' | 'plugin' | 'legacy';

/**
 * Tier a definition can be registered into at runtime. The `'internal'` tier is static
 * (`BUILT_IN_WIDGET_DEFINITIONS`) and cannot be registered into.
 *
 * @internal
 */
export type RuntimeWidgetDefinitionSource = Exclude<WidgetDefinitionSource, 'internal'>;

/** A runtime registry entry: the definition and the tier it was registered into. */
type RuntimeEntry = {
  readonly definition: ErasedWidgetDefinition;
  readonly source: RuntimeWidgetDefinitionSource;
};

const includesInternal = (source: WidgetDefinitionSource | undefined): boolean =>
  source === undefined || source === 'internal';

const matchesRuntimeSource = (
  entry: RuntimeEntry,
  source: WidgetDefinitionSource | undefined,
): boolean => source === undefined || entry.source === source;

/**
 * Registry of widget definitions, one per `PluginProvider`.
 *
 * Lookups read the static built-in definitions (`'internal'`) first, then the runtime entries this
 * instance holds (`'plugin'` and `'legacy'`). Built-in definitions take precedence over plugins, and
 * plugins over legacy custom widgets; within a tier, the first registration wins.
 *
 * @internal
 */
export class WidgetDefinitionRegistry {
  /** Runtime entries: the plugin and legacy tiers only. */
  private readonly entries = new Map<WidgetKey, RuntimeEntry>();

  /**
   * Registers a widget definition into a runtime tier.
   *
   * A key held by a built-in definition is never replaced: a plugin registration there is ignored
   * with a warning, a legacy one is ignored silently (Angular and Vue seed the built-in tabber as a
   * legacy widget on every mount). A plugin registration replaces a legacy entry; any other
   * registration on an existing key is ignored.
   *
   * @param definition - The definition to register; its `key` is the registry key.
   * @param source - The runtime tier to register into.
   */
  register(definition: ErasedWidgetDefinition, source: RuntimeWidgetDefinitionSource): void {
    const { key } = definition;

    if (BUILT_IN_WIDGET_DEFINITIONS.has(key)) {
      if (source === 'plugin') {
        console.warn(
          `[Plugin] Widget key "${key}" is reserved by a built-in widget; the plugin widget is ignored.`,
        );
      }
      return;
    }

    const existing = this.entries.get(key);
    if (existing && !(existing.source === 'legacy' && source === 'plugin')) {
      return;
    }

    this.entries.set(key, { definition, source });
  }

  /**
   * Removes a runtime entry. Only removes it when it belongs to the given tier; built-in
   * definitions cannot be removed.
   *
   * @param key - The registry key.
   * @param source - The runtime tier the entry must belong to.
   */
  unregister(key: WidgetKey, source: RuntimeWidgetDefinitionSource): void {
    if (this.entries.get(key)?.source === source) {
      this.entries.delete(key);
    }
  }

  /**
   * Looks up a widget definition, reading the built-in definitions first.
   *
   * @param key - The registry key.
   * @param source - When set, returns the definition only if it belongs to this tier.
   * @returns The definition, or `undefined` when none matches.
   */
  get(key: WidgetKey, source?: WidgetDefinitionSource): ErasedWidgetDefinition | undefined {
    const builtIn = BUILT_IN_WIDGET_DEFINITIONS.get(key);
    if (builtIn) {
      return includesInternal(source) ? builtIn : undefined;
    }
    const entry = this.entries.get(key);
    return entry && matchesRuntimeSource(entry, source) ? entry.definition : undefined;
  }

  /**
   * Checks whether a widget definition is registered.
   *
   * @param key - The registry key.
   * @param source - When set, checks only this tier.
   * @returns `true` when {@link WidgetDefinitionRegistry.get} would return a definition.
   */
  has(key: WidgetKey, source?: WidgetDefinitionSource): boolean {
    return this.get(key, source) !== undefined;
  }

  /**
   * Lists the widget definitions visible through this registry: built-ins first, then runtime
   * entries in registration order.
   *
   * @param source - When set, lists only this tier.
   * @returns The matching definitions.
   */
  getAll(source?: WidgetDefinitionSource): readonly ErasedWidgetDefinition[] {
    const builtIns = includesInternal(source) ? [...BUILT_IN_WIDGET_DEFINITIONS.values()] : [];
    const runtime = [...this.entries.values()]
      .filter((entry) => matchesRuntimeSource(entry, source))
      .map((entry) => entry.definition);
    return [...builtIns, ...runtime];
  }

  /**
   * Registers a custom widget component under its `customWidgetType`, with the plugin default
   * abilities. Compatibility accessor over {@link WidgetDefinitionRegistry.register}.
   *
   * @param customWidgetType - The custom widget type name, without the `custom:` prefix.
   * @param component - The component rendering the custom widget.
   * @param source - The runtime tier to register into.
   */
  registerComponent(
    customWidgetType: string,
    component: AnyCustomVisualization,
    source: RuntimeWidgetDefinitionSource,
  ): void {
    this.register(
      {
        key: customWidgetKey(customWidgetType),
        displayName: customWidgetType,
        abilities: PLUGIN_ABILITY_DEFAULTS,
        visualization: { Component: component },
      },
      source,
    );
  }

  /**
   * Removes a custom widget registered under its `customWidgetType`.
   * Compatibility accessor over {@link WidgetDefinitionRegistry.unregister}.
   *
   * @param customWidgetType - The custom widget type name, without the `custom:` prefix.
   * @param source - The runtime tier the entry must belong to.
   */
  unregisterComponent(customWidgetType: string, source: RuntimeWidgetDefinitionSource): void {
    this.unregister(customWidgetKey(customWidgetType), source);
  }

  /**
   * Gets the component of a custom widget by its `customWidgetType`, including the built-in tabber.
   * Compatibility accessor over {@link WidgetDefinitionRegistry.get}.
   *
   * @param customWidgetType - The custom widget type name, without the `custom:` prefix.
   * @param source - When set, returns the component only if its entry belongs to this tier.
   * @returns The component, or `undefined` when none matches.
   */
  getComponent(
    customWidgetType: string,
    source?: RuntimeWidgetDefinitionSource,
  ): AnyCustomVisualization | undefined {
    return this.get(customWidgetKey(customWidgetType), source)?.visualization.Component;
  }

  /**
   * Checks whether a custom widget is registered under its `customWidgetType`.
   * Compatibility accessor over {@link WidgetDefinitionRegistry.has}.
   *
   * @param customWidgetType - The custom widget type name, without the `custom:` prefix.
   * @param source - When set, checks only this tier.
   * @returns `true` when a matching entry exists.
   */
  hasComponent(customWidgetType: string, source?: RuntimeWidgetDefinitionSource): boolean {
    return this.has(customWidgetKey(customWidgetType), source);
  }
}
