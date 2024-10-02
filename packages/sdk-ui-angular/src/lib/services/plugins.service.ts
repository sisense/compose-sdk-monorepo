import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PluginComponent } from '@sisense/sdk-ui-preact';

/**
 * Service for working with plugins fetched from an external environment.
 *
 * Provides methods for registering, retrieving, and interacting with plugins.
 *
 * @internal
 * @group Contexts
 */
@Injectable({
  providedIn: 'root',
})
export class PluginsService {
  private pluginMap$: BehaviorSubject<Map<string, PluginComponent>>;

  constructor() {
    this.pluginMap$ = new BehaviorSubject(new Map<string, PluginComponent>());
  }

  /**
   * Registers a new plugin into the plugin map.
   *
   * @param pluginType - The unique identifier for the plugin type.
   * @param plugin - The plugin instance to register.
   */
  registerPlugin(pluginType: string, plugin: PluginComponent): void {
    const pluginMap = this.pluginMap$.value;
    if (!pluginMap.has(pluginType)) {
      pluginMap.set(pluginType, plugin);
      this.pluginMap$.next(pluginMap);
    }
  }

  /**
   * Retrieves a plugin by its type.
   *
   * @param pluginType - The unique identifier for the plugin type.
   * @returns The plugin instance if found, otherwise undefined.
   */
  getPlugin(pluginType: string): PluginComponent | undefined {
    return this.pluginMap$.value.get(pluginType);
  }

  /**
   * Retrieves a complete plugin map.
   *
   * @returns A plugin map.
   */
  getPlugins() {
    return this.pluginMap$;
  }
}
