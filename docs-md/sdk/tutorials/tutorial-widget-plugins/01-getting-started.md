---
title: 1 | Getting Started
hidden: true
---

# Getting Started

> **Prerequisite:** Scaffold a plugin project with `@sisense/sdk-cli@latest create-plugin` and start the dev server. See the [Plugin DevX Quick Start](../../guides/plugins/plugin-devx-quickstart.md) if you haven't done this yet.

> **Using Claude Code?** After scaffolding, open the project and run `/design-custom-widget` — describe your chart in plain language and Claude implements everything (data inputs, library, chart code, style controls) in one step instead of following the tutorial manually. See [AI-Driven Development](../../guides/plugins/ai-driven-development.md).

## What Are Widget Plugins?

Widget plugins let you add custom visualizations to Compose SDK dashboards. A plugin renders any React component as a dashboard widget — custom charts, tables, KPI cards, or any visual you can build in React.

A plugin consists of up to four parts:

| Part                        | Purpose                                                     |
| --------------------------- | ----------------------------------------------------------- |
| **Plugin declaration**      | Metadata: name, version, compatibility range                |
| **Visualization component** | The React component that renders the widget                 |
| **Data panel config**       | Defines dimension/measure inputs shown in the widget editor |
| **Design panel component**  | UI for editing style options in the widget editor           |

## Understanding the Scaffolded Files

After running `@sisense/sdk-cli@latest create-plugin`, your `src/` directory contains all four parts. Let's walk through each one.

### Plugin Declaration — `src/index.tsx`

```tsx
import type { WidgetPlugin } from '@sisense/sdk-ui';

import { Visualization, VisualizationProps } from './components/Visualization';

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
    dataPanel: {
      config: {
        inputs: [
          { name: 'category', displayName: 'Category', type: 'dimension', maxItems: 1 },
          { name: 'value', displayName: 'Value', type: 'measure', maxItems: 1 },
        ],
      },
    },
  },
};

export default plugin;
```

Key fields of [`WidgetPlugin`](../../modules/sdk-ui/interfaces/interface.WidgetPlugin.md):

| Field                | Description                                                                                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`               | Unique plugin identifier                                                                                                                                                   |
| `version`            | Semantic version of your plugin                                                                                                                                            |
| `requiredApiVersion` | Semver range checked against the Compose SDK version (e.g. `^2.27.0`). If the running SDK version doesn't satisfy this range, the plugin is skipped with a console warning. |
| `pluginType`         | Always `'widget'` for widget plugins                                                                                                                                       |
| `customWidget.name`  | Unique widget type name used in dashboard configurations                                                                                                                   |

### Visualization — `src/components/Visualization.tsx`

```tsx
import type { CustomVisualization, CustomVisualizationProps } from '@sisense/sdk-ui';

import type { DataOptions, StyleOptions } from '../types';

export type VisualizationProps = CustomVisualizationProps<DataOptions, StyleOptions>;

export const Visualization: CustomVisualization<VisualizationProps> = (props) => {
  const { dataOptions } = props;

  return (
    <div style={{ padding: 16 }}>
      <h3>My Custom Chart</h3>
      <p>Categories: {dataOptions.category?.length ?? 0}</p>
      <p>Values: {dataOptions.value?.length ?? 0}</p>
    </div>
  );
};
```

[`CustomVisualization`](../../modules/sdk-ui/type-aliases/type-alias.CustomVisualization.md)`<Props>` is a function component type: `(props: Props) => ReactNode`. The SDK passes structured props (via [`CustomVisualizationProps`](../../modules/sdk-ui/interfaces/interface.CustomVisualizationProps.md)) to your component — data options, style options, filters, and event handlers (covered in [Building a Visualization](./02-visualization.md)).

### Types — `src/types.ts`

```tsx
import type {
  CustomVisualizationStyleOptions,
  GenericDataOptions,
  StyledColumn,
  StyledMeasureColumn,
} from '@sisense/sdk-ui';

export interface DataOptions extends GenericDataOptions {
  category: StyledColumn[];
  value: StyledMeasureColumn[];
}

export interface StyleOptions extends CustomVisualizationStyleOptions {}
```

- `DataOptions` describes the data your widget receives. Each key maps to a data panel input. Dimension inputs use [`StyledColumn[]`](../../modules/sdk-ui/interfaces/interface.StyledColumn.md), measure inputs use [`StyledMeasureColumn[]`](../../modules/sdk-ui/interfaces/interface.StyledMeasureColumn.md). Both wrap an underlying column (accessible via `.column`) with optional styling metadata such as color overrides and number formatting. For query purposes, you always unwrap via `.column`.
- `StyleOptions` describes appearance settings controlled by the design panel. Extend [`CustomVisualizationStyleOptions`](../../modules/sdk-ui/interfaces/interface.CustomVisualizationStyleOptions.md) to add your style options.

These types are reused in every subsequent lesson.

## Registering the Plugin

Pass the plugin to `SisenseContextProvider` via the `plugins` prop:

```tsx
// App.tsx
import { DashboardById, SisenseContextProvider } from '@sisense/sdk-ui';
import myCustomChartPlugin from 'my-custom-chart';

// your built plugin package

const App = () => (
  <SisenseContextProvider
    url="https://your-instance.sisense.com"
    token="your-api-token"
    plugins={[myCustomChartPlugin]}
  >
    <DashboardById dashboardOid="your-dashboard-oid" />
  </SisenseContextProvider>
);
```

When a dashboard widget has `customWidgetType: 'my-custom-chart'`, the SDK renders your `Visualization` component inside that widget.

You can register multiple plugins at once:

```tsx
<SisenseContextProvider plugins={[barPlugin, mapPlugin, kpiPlugin]} url="..." token="...">
```

Each plugin is validated independently. If one fails (version mismatch or duplicate name), the others still load.

## Angular and Vue

Widget plugins work across frameworks. The plugin object is always a plain TypeScript/JavaScript object with React components — the host framework doesn't matter.

Plugin packages expose separate export paths for Vue and Angular. These paths resolve to a cross-framework bundle that runs your React visualization through a Preact bridge, so the host app doesn't need React installed:

| Import path                 | Use in       |
| --------------------------- | ------------ |
| `'my-custom-chart'`         | React apps   |
| `'my-custom-chart/vue'`     | Vue apps     |
| `'my-custom-chart/angular'` | Angular apps |

**Vue** — pass the plugin via the `:plugins` prop on `SisenseContextProvider`:

```vue
<script setup>
import { DashboardById, SisenseContextProvider } from '@sisense/sdk-ui-vue';
import myPlugin from 'my-custom-chart/vue';
</script>

<template>
  <SisenseContextProvider
    url="https://your-instance.sisense.com"
    token="your-api-token"
    :plugins="[myPlugin]"
  >
    <DashboardById dashboardOid="your-dashboard-oid" />
  </SisenseContextProvider>
</template>
```

**Angular** — register the plugin via `SISENSE_CONTEXT_CONFIG_TOKEN` in your module, then use `csdk-dashboard` in a component:

```ts
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  SdkUiModule,
  SISENSE_CONTEXT_CONFIG_TOKEN,
  type SisenseContextConfig,
} from '@sisense/sdk-ui-angular';
import myPlugin from 'my-custom-chart/angular';

import { AppComponent } from './app.component';
import { MyDashboardComponent } from './my-dashboard.component';

@NgModule({
  imports: [BrowserModule, SdkUiModule],
  declarations: [AppComponent, MyDashboardComponent],
  providers: [
    {
      provide: SISENSE_CONTEXT_CONFIG_TOKEN,
      useValue: {
        url: 'https://your-instance.sisense.com',
        token: 'your-api-token',
        plugins: [myPlugin],
      } as SisenseContextConfig,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

```ts
// my-dashboard.component.ts
import { Component } from '@angular/core';
import { type WidgetProps } from '@sisense/sdk-ui-angular';

@Component({
  selector: 'app-my-dashboard',
  template: `<csdk-dashboard title="My Dashboard" [widgets]="widgets" />`,
})
export class MyDashboardComponent {
  readonly widgets: WidgetProps[] = [
    {
      id: 'widget-1',
      widgetType: 'custom',
      customWidgetType: 'my-custom-chart', // matches plugin.customWidget.name
      dataSource: 'Sample ECommerce',
      title: 'My Custom Chart',
      dataOptions: { category: [], value: [] },
    },
  ];
}
```

For complete working examples with data model attributes and layout options, see the [Plugin DevX Reference](../../guides/plugins/plugin-devx-reference.md#framework-integration).

**Next lesson:** [Building a Visualization](./02-visualization.md)
