import type { WidgetPlugin } from '@sisense/sdk-ui';

import { Chart, LineChartProps } from './components/Chart.js';
import { DesignPanels } from './components/DesignPanels.js';
import { StyleOptions } from './types.js';

const plugin: WidgetPlugin<LineChartProps, StyleOptions> = {
  name: 'PLUGIN_NAME',
  version: '1.0.0',
  requiredApiVersion: '^2.0.0',
  pluginType: 'widget',
  customWidget: {
    name: 'PLUGIN_NAME',
    displayName: 'PLUGIN_DISPLAY_NAME',
    visualization: {
      Component: Chart,
    },
    designPanel: {
      Component: DesignPanels,
    },
    dataPanel: {
      config: {
        inputs: [
          {
            name: 'categories',
            displayName: 'Categories',
            type: 'dimension',
            maxItems: 2,
          },
          {
            name: 'values',
            displayName: 'Values',
            type: 'measure',
            maxItems: 50,
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
