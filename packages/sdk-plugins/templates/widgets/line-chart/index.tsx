import type { WidgetPlugin } from '@sisense/sdk-ui';

import { DesignPanel } from './components/DesignPanel.js';
import { Visualization, VisualizationProps } from './components/Visualization.js';

const plugin: WidgetPlugin<VisualizationProps> = {
  name: 'PLUGIN_NAME',
  version: '1.0.0',
  requiredApiVersion: '^2.0.0',
  pluginType: 'widget',
  customWidget: {
    name: 'PLUGIN_NAME',
    displayName: 'PLUGIN_DISPLAY_NAME',
    visualization: {
      Component: Visualization,
    },
    designPanel: {
      Component: DesignPanel,
    },
    dataPanel: {
      config: {
        inputs: [
          {
            name: 'category',
            displayName: 'Category',
            type: 'dimension',
            maxItems: 2,
          },
          {
            name: 'value',
            displayName: 'Value',
            type: 'measure',
            maxItems: 50,
            canColor: true,
          },
          {
            name: 'breakBy',
            displayName: 'Break By',
            type: 'dimension',
            maxItems: 1,
          },
        ],
      },
    },
  },
};

export default plugin;
