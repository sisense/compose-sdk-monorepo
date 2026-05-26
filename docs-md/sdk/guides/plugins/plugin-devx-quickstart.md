---
title: Plugin DevX Quickstart Guide
hidden: true
---

# Plugin DevX — Quick Start

Create, develop, and build a custom widget plugin for Compose SDK.

> **Want to understand the plugin API in depth?** See the [Widget Plugins Tutorial](../../tutorials/tutorial-widget-plugins/index.md) for a progressive walkthrough of visualization, data fetching, design panels, and event handling.
>
> **Need the full CLI reference, all framework examples, or Fusion deployment?** See the [Plugin DevX Reference](./plugin-devx-reference.md).

---

## Prerequisites

- **Node.js** >= 20.19.0
- **A Sisense instance** with a URL and API token — needed for live data. Not required to start; you can develop the UI without it.

---

## 1. Create a Plugin

```bash
npx @sisense/sdk-cli@latest create-plugin
```

The interactive prompt asks for a name and template:

```
? What name would you like to give the plugin? (my-custom-plugin) >
? How would you like to start?
> Empty Project
  Line Chart
  Simple Table
```

Use **Empty** to start from scratch, or **Line Chart** for a working reference implementation.

You can also skip prompts with flags:

```bash
npx @sisense/sdk-cli@latest create-plugin --name my-custom-chart --template line-chart
```

See the [CLI Reference](./plugin-devx-reference.md#cli-reference) for all options.

---

## 2. Set Up Environment Variables

```bash
cd my-custom-chart
# npm
npm install
# yarn
yarn install

cp .env.local.example .env.local
```

Edit `.env.local` with your Sisense credentials:

```bash
VITE_APP_SISENSE_URL=https://your-instance.sisense.com
VITE_APP_SISENSE_TOKEN=your-api-token
```

Without these values, the dev server starts but shows a "Configuration required" warning instead of live data.

**Note:** To deploy the plugin to your Sisense Fusion instance, use an API token for a user with the 'Admin' role (see [Step 7](#7-deploy-to-sisense-fusion)).

---

## 3. Start the Dev Server

```bash
# npm
npm run dev
# yarn
yarn dev
```

Opens at `http://localhost:3000` with a split layout — your visualization on the left, design panel on the right:

![Plugin dev server split layout](../../img/plugins-guide/plugin-devx-dev-server.png 'Plugin dev server')

Changes to files in `src/` are reflected instantly via hot module replacement.

---

## 4. Edit Your Components

The two files you'll spend most time in:

**`src/components/Visualization.tsx`** — your visualization. Implements [`CustomVisualization`](../../modules/sdk-ui/type-aliases/type-alias.CustomVisualization.md) with [`CustomVisualizationProps`](../../modules/sdk-ui/interfaces/interface.CustomVisualizationProps.md):

```tsx
import type { CustomVisualization, CustomVisualizationProps } from '@sisense/sdk-ui';

import type { DataOptions, StyleOptions } from '../types.js';

export type VisualizationProps = CustomVisualizationProps<DataOptions, StyleOptions>;

export const Visualization: CustomVisualization<VisualizationProps> = ({
  dataSource,
  dataOptions,
  filters,
  styleOptions,
}) => {
  return <div>...</div>;
};
```

**`src/components/DesignPanels.tsx`** — style configuration UI. Implements [`DesignPanelProps`](../../modules/sdk-ui/interfaces/interface.DesignPanelProps.md):

```tsx
import type { DesignPanelProps } from '@sisense/sdk-ui';

import type { StyleOptions } from '../types.js';

export const DesignPanels = ({ styleOptions, onChange }: DesignPanelProps<StyleOptions>) => {
  return <div>{/* your configuration controls */}</div>;
};
```

Edit `src/dev-preview-props.ts` to provide sample data that matches your `DataOptions` type.

---

## 5. Build

```bash
# npm
npm run build
# yarn
yarn build
```

Produces framework-aware outputs:

| Export path   | Target  | Output                         |
| ------------- | ------- | ------------------------------ |
| `"."`         | React   | `dist/react/main.js`           |
| `"./vue"`     | Vue     | `dist/cross-framework/main.js` |
| `"./angular"` | Angular | `dist/cross-framework/main.js` |

---

## 6. Register in Your App

Install the plugin (published to npm or from a local path):

```bash
# npm
npm install my-custom-chart
# yarn
yarn add my-custom-chart

# from local path (run build first)
# npm
npm install ./path/to/my-custom-chart
# yarn
yarn add file:./path/to/my-custom-chart
```

Then register it via the `plugins` prop. See [`WidgetPlugin`](../../modules/sdk-ui/interfaces/interface.WidgetPlugin.md) for the full plugin object shape:

```tsx
import { Dashboard, SisenseContextProvider } from '@sisense/sdk-ui';
import myPlugin from 'my-custom-chart';

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

The `customWidgetType` in your widget config must match the `name` field in `src/index.tsx`.

For Vue and Angular integration, see the [Framework Integration](./plugin-devx-reference.md#framework-integration) section in the reference.

---

## 7. Deploy to Sisense Fusion

Once your plugin is built, you can deploy it directly to a Sisense Fusion instance.

Make sure `.env.local` contains your Sisense URL and an API token for a user with the 'Admin' role (see [Step 2](#2-set-up-environment-variables)), then run:

```bash
# npm
npm run deploy
# yarn
yarn deploy
```

This command builds the Fusion bundle (`dist-fusion/plugin.zip`) and uploads it to your instance in one step. After a successful deploy the plugin is available immediately — no manual upload needed.

For details on the Fusion bundle format, `plugin.json` metadata, and what the deploy script does under the hood, see [Deploying to Sisense Fusion](./plugin-devx-reference.md#deploying-to-sisense-fusion) in the reference.

---

## Next Steps

- **[Widget Plugins Tutorial](../../tutorials/tutorial-widget-plugins/index.md)** — learn the plugin API: visualization props, data fetching, data panel, design panel, event handling
- **[Plugin DevX Reference](./plugin-devx-reference.md)** — full CLI options, project structure, testing, all framework examples, Fusion deployment
