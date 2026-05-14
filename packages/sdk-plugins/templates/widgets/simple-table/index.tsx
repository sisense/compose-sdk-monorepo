import type { WidgetPlugin } from '@sisense/sdk-ui';

import { SimpleTableDesignPanel } from './components/DesignPanel.js';
import { SimpleTable } from './components/Visualization.js';

export const simpleTablePlugin: WidgetPlugin = {
  name: 'PLUGIN_NAME',
  version: '1.0.0',
  requiredApiVersion: '^2.0.0',
  pluginType: 'widget',
  customWidget: {
    name: 'PLUGIN_NAME',
    displayName: 'PLUGIN_DISPLAY_NAME',
    visualization: {
      Component: SimpleTable,
    },
    designPanel: {
      Component: SimpleTableDesignPanel,
    },
    dataPanel: {
      config: {
        inputs: [
          { name: 'category', displayName: 'Category', type: 'dimension' },
          { name: 'value', displayName: 'Value', type: 'measure' },
        ],
      },
    },
  },
};

export default simpleTablePlugin;
