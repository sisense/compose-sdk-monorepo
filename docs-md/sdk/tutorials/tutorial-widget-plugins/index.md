---
title: Widget Plugin Tutorial
hidden: true
---

# Widget Plugin Tutorial

Build custom visualizations for Compose SDK dashboards. Each lesson builds on the previous one, progressively adding data fetching, editor configuration, and cross-filtering to a plugin scaffold.

## Before You Begin

Scaffold a plugin project with the CLI before starting the tutorial:

```bash
npx @sisense/sdk-cli@latest create-plugin --name my-custom-chart --template empty
cd my-custom-chart
npm install
npm run dev
```

See the [Plugin DevX Quick Start](../../guides/plugins/plugin-devx-quickstart.md) for prerequisites and detailed setup instructions.

## Lessons

1. **[Getting Started](./01-getting-started.md)**
   Plugin anatomy, key files, registration, and how the pieces fit together. Introduces [`WidgetPlugin`](../../modules/sdk-ui/interfaces/interface.WidgetPlugin.md) and [`CustomVisualization`](../../modules/sdk-ui/type-aliases/type-alias.CustomVisualization.md).

2. **[Building a Visualization](./02-visualization.md)**
   [`CustomVisualizationProps`](../../modules/sdk-ui/interfaces/interface.CustomVisualizationProps.md) API and type parameterization.

3. **[Fetching Data](./03-fetching-data.md)**
   Query real data with the [`useExecuteCustomWidgetQuery`](../../modules/sdk-ui/queries/function.useExecuteCustomWidgetQuery.md) hook or [`useExecuteQuery`](../../modules/sdk-ui/queries/function.useExecuteQuery.md).

4. **[Data Panel Configuration](./04-data-panel.md)**
   Define dimension/measure inputs for the widget editor.

5. **[Design Panel](./05-design-panel.md)**
   Build a style configuration UI using [`DesignPanelProps`](../../modules/sdk-ui/interfaces/interface.DesignPanelProps.md).

6. **[Event Handling and Cross-Filtering](./06-event-handling.md)**
   Data point events, context menu, and cross-filtering integration.

---

**Start here:** [Getting Started](./01-getting-started.md)
