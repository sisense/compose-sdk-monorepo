---
title: Plugin DevX Reference
---

# Plugin DevX — Reference

Complete reference for the Plugin DevX toolchain. For a guided first-time setup, see the [Quick Start](./plugin-devx-quickstart.md).

---

## CLI Reference

### Command

```bash
npx @sisense/sdk-cli@latest create-plugin [name] [options]
```

| Option                  | Description                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------- |
| `[name]`                | Plugin name (also used as the folder name). Defaults to `my-custom-plugin` if omitted. |
| `--name <name>`         | Plugin name. Alphanumeric, hyphens, and underscores only.                              |
| `--path <path>`         | Override the output directory. Defaults to `{cwd}/{name}` when not set.                |
| `--template <template>` | Template to use. See [Templates](#templates) below.                                    |
| `--force`               | Overwrite the target directory without prompting.                                      |

### Interactive Mode

Running `npx @sisense/sdk-cli@latest create-plugin` without flags starts an interactive session:

```
Welcome to the Sisense Compose SDK Plugin toolkit!

? What name would you like to give the plugin? (my-custom-plugin) >
? How would you like to start?
> Empty Project
  Line Chart
  Simple Table
```

**Plugin name rules:** Letters (`a-z`, `A-Z`), numbers (`0-9`), hyphens (`-`), and underscores (`_`) only. No spaces or special characters. Supplying an invalid name prints a warning and falls back to the interactive prompt.

The plugin is created in a subfolder named after the plugin inside the current directory. If a folder with that name already exists, the prompt suggests the next available name (e.g. `my-custom-plugin2`).

> **Note:** The plugin name is used as-is for the directory. In the generated `package.json` `"name"` field it is normalised for npm: lowercased and underscores replaced with hyphens (e.g. `My_Plugin` → directory `My_Plugin/`, package name `my-plugin`).

### Examples

```bash
# Fully interactive (creates my-custom-plugin/ in the current directory)
npx @sisense/sdk-cli@latest create-plugin

# Pass name as positional arg (creates my-awesome-plugin/)
npx @sisense/sdk-cli@latest create-plugin my-awesome-plugin

# Equivalent with --name flag
npx @sisense/sdk-cli@latest create-plugin --name my-awesome-plugin

# Skip all prompts
npx @sisense/sdk-cli@latest create-plugin --name my-widget --template line-chart

# Place plugin in a custom directory
npx @sisense/sdk-cli@latest create-plugin --name my-widget --path ./my-custom-charts/revenue-chart

# Overwrite an existing directory
npx @sisense/sdk-cli@latest create-plugin --name my-widget --template empty --force
```

### Templates

| Template       | Best for              | What's included                                                                                    |
| -------------- | --------------------- | -------------------------------------------------------------------------------------------------- |
| `empty`        | Starting from scratch | Minimal `Visualization.tsx` placeholder + `DesignPanels.tsx` stub                                  |
| `line-chart`   | Learning by example   | Full line chart with markers, line type/width, legend, axes, value labels, auto-zoom design panels |
| `simple-table` | Table visualizations  | MUI-based table component with design panel                                                        |

> **Tip:** Use `empty` if you know what you're building. Use `line-chart` if you want a reference implementation to learn from.

The `line-chart` and `simple-table` templates may fetch their source from the CSDK GitHub repository, so an internet connection is recommended when using them.

---

## Project Structure

After running `npx @sisense/sdk-cli@latest create-plugin`, your project looks like this:

```
my-custom-chart/
+-- src/
|   +-- index.tsx              # Plugin definition (the WidgetPlugin export)
|   +-- types.ts               # DataOptions and StyleOptions type definitions
|   +-- dev-preview-props.ts         # Sample data used in the dev server
|   +-- components/
|       +-- Visualization.tsx   # The visualization component
|       +-- DesignPanels.tsx    # The design panel component
|       +-- Visualization.test.tsx  # Tests for Visualization
|       +-- DesignPanels.test.tsx
+-- dev/
|   +-- main.tsx               # Dev server entry point (DevApp)
|   +-- index.html
|   +-- models/                # Data model helpers for the dev server
|   +-- vitest.setup.ts
+-- .env.local.example         # Template for environment variables
+-- vite.config.ts             # Vite configuration
+-- tsconfig.json
+-- package.json
```

### Key Files

**`src/index.tsx`** — The plugin definition. This is the [`WidgetPlugin`](../../modules/sdk-ui/interfaces/interface.WidgetPlugin.md) object you export and what gets registered in the host app:

```tsx
import type { WidgetPlugin } from '@sisense/sdk-ui';

import { DesignPanels } from './components/DesignPanels.js';
import { Visualization, VisualizationProps } from './components/Visualization.js';

const plugin: WidgetPlugin<VisualizationProps> = {
  name: 'my-custom-chart',
  version: '1.0.0',
  requiredApiVersion: '^2.27.0',
  pluginType: 'widget',
  customWidget: {
    name: 'my-custom-chart',
    displayName: 'My Custom Chart',
    visualization: {
      Component: Visualization,
    },
    designPanel: {
      Component: DesignPanels,
    },
    dataPanel: {
      config: {
        inputs: [
          { name: 'category', displayName: 'Category', type: 'dimension', maxItems: 1 },
          { name: 'value', displayName: 'Value', type: 'measure', maxItems: 1 },
          { name: 'breakBy', displayName: 'Break By', type: 'dimension', maxItems: 1 },
        ],
      },
    },
  },
};

export default plugin;
```

**`src/types.ts`** — Defines the shape of data and style options your plugin accepts. These are passed to your `Visualization` and `DesignPanels` components.

**`src/dev-preview-props.ts`** — Sample [`CustomVisualizationProps`](../../modules/sdk-ui/interfaces/interface.CustomVisualizationProps.md) used by the dev server. Edit this to match the data your visualization expects during development.

**`src/components/Visualization.tsx`** — Your visualization. Receives [`CustomVisualizationProps`](../../modules/sdk-ui/interfaces/interface.CustomVisualizationProps.md)`<DataOptions, StyleOptions>` and renders whatever you want.

**`src/components/DesignPanels.tsx`** — Optional configuration UI. Receives [`DesignPanelProps`](../../modules/sdk-ui/interfaces/interface.DesignPanelProps.md)`<StyleOptions>` and lets users control visual options.

**`dev/main.tsx`** — Wires your plugin into the `DevApp` component for local development. You typically don't need to edit this.

### Path Aliases

Two aliases are configured in `vite.config.ts` for the dev server:

| Alias     | Resolves to   |
| --------- | ------------- |
| `@plugin` | `src/`        |
| `@models` | `dev/models/` |

These are only active during `npm run dev` / `yarn dev` and are not included in the build output.

---

## Testing

Tests use [Vitest](https://vitest.dev/) with [Testing Library](https://testing-library.com/).

```bash
# npm
npm run test          # run all tests once
npm run test:watch    # watch mode
# yarn
yarn test
yarn test:watch
```

Tests live alongside components in `src/components/`. Recommended pattern — render the component with props, then assert on what was passed to the underlying chart:

```tsx
import React from 'react';

import type { CustomVisualizationProps } from '@sisense/sdk-ui';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DataOptions, StyleOptions } from '../types.js';
import { Visualization } from './Visualization.js';

const TestVisualization = Visualization as React.ComponentType<any>;

const { mockLineChart } = vi.hoisted(() => ({
  mockLineChart: vi.fn(() => null),
}));

vi.mock('@sisense/sdk-ui', () => ({
  LineChart: mockLineChart,
}));

function makeProps(overrides = {}) {
  return {
    dataSource: 'SampleECommerce',
    dataOptions: {
      category: [{ column: { name: 'Date', type: 'text-attribute' } }],
      value: [{ column: { name: 'Revenue', aggregation: 'sum' } }],
      breakBy: [],
    },
    filters: [],
    styleOptions: {},
    ...overrides,
  } as unknown as CustomVisualizationProps<DataOptions, StyleOptions>;
}

describe('Visualization', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders without error', () => {
    expect(() => render(<TestVisualization {...makeProps()} />)).not.toThrow();
  });

  it('passes dataSource to the underlying chart', () => {
    render(<TestVisualization {...makeProps({ dataSource: 'MyData' })} />);
    const props = mockLineChart.mock.lastCall![0] as Record<string, unknown>;
    expect(props).toMatchObject({ dataSet: 'MyData' });
  });
});
```

Test configuration is in `vite.config.ts` under the `test` key. The test environment is `jsdom` and setup is handled by `dev/vitest.setup.ts`.

---

## Building

### For CSDK Applications

```bash
# npm
npm run build          # builds both React and cross-framework targets
npm run build:fusion   # Fusion bundle only -> dist-fusion/plugin.zip
# yarn
yarn build
yarn build:fusion
```

The build produces a package with framework-aware exports:

```json
{
  "exports": {
    ".": { "import": "./dist/react/main.js" },
    "./vue": { "import": "./dist/cross-framework/main.js" },
    "./angular": { "import": "./dist/cross-framework/main.js" }
  }
}
```

TypeScript declarations are output to `dist/types/index.d.ts`.

### For Sisense Fusion

```bash
# npm
npm run build:fusion
# yarn
yarn build:fusion
```

This produces an IIFE bundle and deployment package in a separate `dist-fusion/` directory, leaving the CSDK build in `dist/` untouched:

```
dist-fusion/
+-- main.js         # The plugin bundle (IIFE format)
+-- plugin.json     # Plugin metadata
+-- plugin.zip      # Upload-ready package (main.js + plugin.json)
```

The generated `plugin.json`:

```json
{
  "name": "my-custom-chart",
  "folderName": "my-custom-chart",
  "isEnabled": true,
  "pluginInfraVersion": 3,
  "csdk": true,
  "main": "main.js",
  "version": "1.0.0",
  "skipCompilation": true
}
```

---

## Framework Integration

### Install the Plugin

```bash
# npm
npm install my-custom-chart
npm install ./path/to/my-custom-chart          # from local path (run build first)
# yarn
yarn add my-custom-chart
yarn add file:./path/to/my-custom-chart         # from local path (run build first)
```

### About the `/vue` and `/angular` export paths

The plugin build produces two separate bundles (see [Building](#building)):

- Default (`'my-custom-chart'`) — React bundle. Import this in React apps.
- `/vue` and `/angular` (`'my-custom-chart/vue'`, `'my-custom-chart/angular'`) — Cross-framework bundle. This wraps your React visualization components through a Preact bridge so they render correctly inside Vue and Angular host apps, without requiring React to be installed in the host app.

Always import from the matching path for your host framework.

### React

```tsx
import { createAttribute, measureFactory } from '@sisense/sdk-data';
import { Dashboard, SisenseContextProvider, type WidgetProps } from '@sisense/sdk-ui';
import myPlugin from 'my-custom-chart';

// React bundle

const AgeRange = createAttribute({
  name: 'AgeRange',
  type: 'text-attribute',
  expression: '[Commerce.Age Range]',
});
const Revenue = createAttribute({
  name: 'Revenue',
  type: 'numeric-attribute',
  expression: '[Commerce.Revenue]',
});
const Condition = createAttribute({
  name: 'Condition',
  type: 'text-attribute',
  expression: '[Commerce.Condition]',
});

const widgets: WidgetProps[] = [
  {
    id: 'my-custom-chart-widget-1',
    widgetType: 'custom',
    customWidgetType: 'my-custom-chart', // must match plugin.customWidget.name in src/index.tsx
    dataSource: 'Sample ECommerce',
    title: 'My Custom Chart',
    dataOptions: {
      category: [{ column: AgeRange }],
      value: [{ column: measureFactory.sum(Revenue) }],
      breakBy: [{ column: Condition }],
    },
  },
];

function App() {
  return (
    <SisenseContextProvider
      url="https://your-instance.sisense.com"
      token="your-api-token"
      plugins={[myPlugin]}
    >
      <Dashboard title="My Dashboard" widgets={widgets} />
    </SisenseContextProvider>
  );
}
```

### Vue

Import from the `/vue` export path (cross-framework bundle):

```vue
<script setup lang="ts">
import { createAttribute, measureFactory } from '@sisense/sdk-data';
import { Dashboard, SisenseContextProvider, type WidgetProps } from '@sisense/sdk-ui-vue';
import myPlugin from 'my-custom-chart/vue';

// cross-framework bundle

const AgeRange = createAttribute({
  name: 'AgeRange',
  type: 'text-attribute',
  expression: '[Commerce.Age Range]',
});
const Revenue = createAttribute({
  name: 'Revenue',
  type: 'numeric-attribute',
  expression: '[Commerce.Revenue]',
});
const Condition = createAttribute({
  name: 'Condition',
  type: 'text-attribute',
  expression: '[Commerce.Condition]',
});

const widgets: WidgetProps[] = [
  {
    id: 'my-custom-chart-widget-1',
    widgetType: 'custom',
    customWidgetType: 'my-custom-chart',
    dataSource: 'Sample ECommerce',
    title: 'My Custom Chart',
    dataOptions: {
      category: [{ column: AgeRange }],
      value: [{ column: measureFactory.sum(Revenue) }],
      breakBy: [{ column: Condition }],
    },
  },
];
</script>

<template>
  <SisenseContextProvider
    url="https://your-instance.sisense.com"
    token="your-api-token"
    :plugins="[myPlugin]"
  >
    <Dashboard title="My Dashboard" :widgets="widgets" />
  </SisenseContextProvider>
</template>
```

### Angular

In Angular, the plugin is registered via `SISENSE_CONTEXT_CONFIG_TOKEN`. Import from the `/angular` export path (cross-framework bundle).

This requires two files: the module where the plugin is registered, and the component that renders the dashboard.

**`app.module.ts`** — register the plugin in the Sisense context config:

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  SdkUiModule,
  SISENSE_CONTEXT_CONFIG_TOKEN,
  type SisenseContextConfig,
} from '@sisense/sdk-ui-angular';
import myPlugin from 'my-custom-chart/angular'; // cross-framework bundle

import { AppComponent } from './app.component';
import { PluginDemoComponent } from './plugin-demo.component';

export const SISENSE_CONTEXT_CONFIG: SisenseContextConfig = {
  url: 'https://your-instance.sisense.com',
  token: 'your-api-token',
  defaultDataSource: 'Sample ECommerce',
  plugins: [myPlugin],
};

@NgModule({
  imports: [BrowserModule, SdkUiModule],
  declarations: [AppComponent, PluginDemoComponent],
  providers: [
    { provide: SISENSE_CONTEXT_CONFIG_TOKEN, useValue: SISENSE_CONTEXT_CONFIG },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

**`plugin-demo.component.ts`** — use `csdk-dashboard` with your plugin widget:

```ts
import { Component } from '@angular/core';
import { createAttribute, measureFactory } from '@sisense/sdk-data';
import { type WidgetProps } from '@sisense/sdk-ui-angular';

const AgeRange = createAttribute({
  name: 'AgeRange',
  type: 'text-attribute',
  expression: '[Commerce.Age Range]',
});
const Revenue = createAttribute({
  name: 'Revenue',
  type: 'numeric-attribute',
  expression: '[Commerce.Revenue]',
});
const Condition = createAttribute({
  name: 'Condition',
  type: 'text-attribute',
  expression: '[Commerce.Condition]',
});

@Component({
  selector: 'app-plugin-demo',
  template: `
    <csdk-dashboard
      title="My Dashboard"
      [widgets]="widgets"
    />
  `,
})
export class PluginDemoComponent {
  readonly widgets: WidgetProps[] = [
    {
      id: 'my-custom-chart-widget-1',
      widgetType: 'custom',
      customWidgetType: 'my-custom-chart', // must match plugin.customWidget.name in src/index.tsx
      dataSource: 'Sample ECommerce',
      title: 'My Custom Chart',
      dataOptions: {
        category: [{ column: AgeRange }],
        value: [{ column: measureFactory.sum(Revenue) }],
        breakBy: [{ column: Condition }],
      },
    },
  ];
}
```

> **Note:** Angular's `dataOptions` type is [`GenericDataOptions`](../../modules/sdk-ui/type-aliases/type-alias.GenericDataOptions.md) (`Record<string, Array<`[`StyledColumn`](../../modules/sdk-ui/interfaces/interface.StyledColumn.md)` | `[`StyledMeasureColumn`](../../modules/sdk-ui/interfaces/interface.StyledMeasureColumn.md)`>>`). If TypeScript complains about the object literal not matching that type, cast via `dataOptions as GenericDataOptions` — do not use `as unknown as GenericDataOptions` as that suppresses unrelated type errors too.

---

## Deploying to Sisense Fusion

Ensure your `.env.local` contains the Sisense URL and API token (see [Quick Start](./plugin-devx-quickstart.md#2-set-up-environment-variables)), then run:

```bash
# npm
npm run deploy
# yarn
yarn deploy
```

This command:

1. Runs `npm run build:fusion` to produce `dist-fusion/plugin.zip`
2. Makes a `DELETE` request to `/api/v1/plugins/{pluginName}` to remove any existing version
3. Uploads `dist-fusion/plugin.zip` via `POST /api/v1/plugins/import`

After a successful deploy, the plugin is available in your Sisense instance immediately.
