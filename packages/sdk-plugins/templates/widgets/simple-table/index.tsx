import type { WidgetPlugin } from '@sisense/sdk-ui';

import { SimpleTable } from './simple-table';
import { SimpleTableDesignPanel } from './simple-table-design-panel';

export const simpleTablePlugin: WidgetPlugin = {
  name: 'PLUGIN_NAME',
  version: '1.0.0',
  requiredApiVersion: '^2.0.0',
  pluginType: 'widget',
  customWidget: {
    name: 'PLUGIN_NAME',
    displayName: 'PLUGIN_NAME',
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
