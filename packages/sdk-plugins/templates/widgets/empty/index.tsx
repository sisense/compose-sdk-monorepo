import type { WidgetPlugin } from '@sisense/sdk-ui';

import { DesignPanel } from './components/DesignPanel.js';
import { Visualization, VisualizationProps } from './components/Visualization.js';

const plugin: WidgetPlugin<VisualizationProps> = {
  name: 'PLUGIN_NAME',
  version: '1.0.0',
  requiredApiVersion: '^2.27.0',
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
          // Design inputs to match the visual semantics of your chart type.
          // Use axis names (x, y), roles (color, size, breakBy), or data roles (lat, lon, path).
          // Avoid keeping generic names — name them after what they represent visually.
          // See .claude/docs/data-panel.md for chart-type-specific examples.
          // Each name must match a key in DataOptions (types.ts).
          // type: 'dimension' → StyledColumn[], type: 'measure' → StyledMeasureColumn[]
          { name: 'category', displayName: 'Category', type: 'dimension', maxItems: 1 },
          { name: 'value', displayName: 'Value', type: 'measure', maxItems: 1 },
        ],
      },
    },
  },
};

export default plugin;
