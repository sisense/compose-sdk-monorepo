import type { CustomVisualization } from './types.js';

interface WidgetRegistryEntry {
  widgetTypeName: string;
  component: CustomVisualization;
  source: 'plugin' | 'legacy';
}

/**
 * Central widget registration and lookup.
 * Plugin-sourced entries take priority over legacy-sourced entries.
 *
 * @internal
 */
export class WidgetPluginRegistry {
  private readonly entries = new Map<string, WidgetRegistryEntry>();

  /**
   * Register a widget component by type name.
   * Plugin-sourced entries take priority over legacy-sourced entries.
   * Within the same source, first-write-wins (no silent overwrites).
   */
  register(
    widgetTypeName: string,
    component: CustomVisualization,
    source: 'plugin' | 'legacy' = 'legacy',
  ): void {
    const existing = this.entries.get(widgetTypeName);

    if (existing) {
      if (existing.source === 'plugin' && source === 'legacy') {
        // Plugin registration takes priority — ignore legacy attempt
        return;
      }
      if (existing.source === source) {
        // Same source, first-write-wins — ignore duplicate
        return;
      }
    }

    this.entries.set(widgetTypeName, { widgetTypeName, component, source });
  }

  /**
   * Unregister a widget by type name and source.
   * Only removes the entry if it matches the given source.
   */
  unregister(widgetTypeName: string, source: 'plugin' | 'legacy'): void {
    const existing = this.entries.get(widgetTypeName);
    if (existing?.source === source) {
      this.entries.delete(widgetTypeName);
    }
  }

  /**
   * Get a widget component by type name.
   * When `source` is provided, returns the component only if the entry matches that source.
   * When omitted, returns the component for any source (plugin takes priority over legacy).
   */
  getComponent(
    widgetTypeName: string,
    source?: 'plugin' | 'legacy',
  ): CustomVisualization | undefined {
    const entry = this.entries.get(widgetTypeName);
    if (!entry) return undefined;
    if (source !== undefined && entry.source !== source) {
      return undefined;
    }
    return entry.component;
  }

  /**
   * Check if a widget is registered.
   * When `source` is provided, returns true only if an entry exists for that source.
   * When omitted, returns true for any registered entry.
   */
  has(widgetTypeName: string, source?: 'plugin' | 'legacy'): boolean {
    const entry = this.entries.get(widgetTypeName);
    if (!entry) return false;
    return source === undefined || entry.source === source;
  }
}
