import { WidgetModel } from '@/models';
import { CompleteThemeSettings } from '@/types';

/**
 * @internal
 */
export type ReactWidgetPlugin<P = {}> = {
  name: string;
  Plugin: any;
  createChartProps(w: WidgetModel, themeSettings: CompleteThemeSettings): P;
};

/**
 * POC - singleton plugin store. A widget from a Fusion dashboard can use this
 * store to look up and render a chart from a third-party plugin that matches its type.
 *
 * @internal
 */
export class PluginService {
  static pluginMap = new Map<string, ReactWidgetPlugin>();

  static get(pluginType: string): ReactWidgetPlugin | undefined {
    return PluginService.pluginMap.get(pluginType);
  }

  static register(pluginType: string, plugin: ReactWidgetPlugin): void {
    PluginService.pluginMap.set(pluginType, plugin);
  }
}
