---
title: Chart Plugins
---

# Chart Plugins

> **Note**:
> This guide is for [<img src="../img/react-logo.png" height="18px" style="vertical-align: text-bottom; padding-bottom: 3px" /> React](./quickstart.md). Chart plugins are not currently supported in <img src="../img/angular-logo.png" height="18px" style="vertical-align: text-bottom; padding-bottom: 2px" /> Angular and <img src="../img/vue-logo.png" height="14px" /> Vue.

This guide explains how to define your own chart plugin component and register it in your application code, so that it will be automatically rendered (based on the corresponding widget type) when using the `DashboardById` component.

**Note:** It is assumed that the application is [already configured correctly](./quickstart.md) for use with Compose SDK.

## Sample dashboard

The `histogramwidget` plugin is included with Sisense Fusion, so we'll be using it as our example. We'll start by creating a dashboard in Fusion, containing a single `histogramwidget` widget with `Sample ECommerce` as its data source.

![Dashboard in Fusion](../img/plugins-guide/dashboard-in-fusion.png 'Dashboard in Fusion')

## Displaying the dashboard in your application

To display a dashboard using Compose SDK, we need the `oid` for the relevant dashboard. The simplest way to find this, is to copy the value from the end of the URL when viewing the dashboard in Fusion, e.g. `/app/main/dashboards/{dashboardOid}`.

The dashboard can be easily displayed using the `DashboardById` component, passing this value into the `dashboardOid` prop.

```ts
import { DashboardById } from '@sisense/sdk-ui';

function App() {
  return (
    <DashboardById dashboardOid={'66f23d1b202c89002abd64ac'} />;
  );
}

export default App;
```

Since Compose SDK does not support the `histogramwidget` plugin out of the box (nor any other Fusion plugin widget) it is expected that Compose SDK will display an error in place of the histogram widget.

![Dashboard in Compose SDK (no registered plugin)](../img/plugins-guide/dashboard-in-csdk-unregistered.png 'Dashboard in Compose SDK (no registered plugin)')

In order to resolve this, we will explore how to define a plugin component and register it with Compose SDK, so that it knows what to do when it encounters a `histogramwidget`.

## Defining a plugin using Compose SDK

Before registering our plugin, we first need to define a custom plugin component that will:
1. Receive the props that Compose SDK will pass to our plugin when rendering the `DashboardById` component
2. Run a data query using those props
3. Render a visualization with the results

Purely for the **simplicity** of this guide, we have chosen to define a custom plugin component which renders a table of the query results. In reality, you would more likely define a React implementation of a histogram chart, or however else you wish to represent the presence of this plugin in a dashboard.

This guide also aims to demonstrate the flexibility of the `registerPlugin` interface - as long as you provide a functional component that matches the shape of [`PluginComponent`](../modules/sdk-ui/type-aliases/type-alias.PluginComponent.md), Compose SDK will render that component for the designated plugin.

A note on the `dataOptions` prop that is passed to our component: For those familiar with the Fusion plugin / add-on architecture, `dataOptions` is the Compose SDK equivalent of `panels` on the [WidgetMetadata](https://sisense.dev/guides/customJs/jsApiRef/widgetClass/widget-metadata.html) object.

Compose SDK translates all widget metadata and filters to Compose SDK data structures (e.g. values inside [`dataOptions`](../modules/sdk-ui/type-aliases/type-alias.ChartDataOptions.md) are of type [`StyledColumn`](../modules/sdk-ui/interfaces/interface.StyledColumn.md) and [`StyledMeasureColumn`](../modules/sdk-ui/interfaces/interface.StyledMeasureColumn.md), the same types you'd expect for [`dataOptions`](../modules/sdk-ui/type-aliases/type-alias.ChartDataOptions.md) into the [`Chart`](../modules/sdk-ui/charts/function.Chart.md) component).

In the custom plugin component, we can use the props directly with the `useExecutePluginQuery` hook which runs a data query and applies some formatting on the results (defined by the `StyledColumn` information in `dataOptions`).

```ts
import { DashboardById, PluginComponent, useExecutePluginQuery } from '@sisense/sdk-ui';

const ResultsTable: PluginComponent = (props) => {
  const { data } = useExecutePluginQuery(props);

  if (!data) {
    return null;
  }

  return (
    <table style={{ margin: '20px' }}>
      <thead>
        <tr>
          {data.columns.map((column, columnIndex) => (
            <th key={columnIndex}>{column.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell.text}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

...
```

If you prefer to work with the raw data without any formatting applied, you can use `extractDimensionsAndMeasures` with `useExecuteQuery` instead.

```ts
import { useExecuteQuery, extractDimensionsAndMeasures } from '@sisense/sdk-ui';

const { dimensions, measures } = extractDimensionsAndMeasures(props.dataOptions);
const { data } = useExecuteQuery({
  dimensions,
  measures,
  filters: props.filters,
});
```

## Registering the plugin with Compose SDK

To register the plugin, we need to call `registerPlugin`, which is returned from the `usePlugins` hook.

```ts
import { DashboardById, PluginComponent, useExecutePluginQuery, usePlugins } from '@sisense/sdk-ui';

...

function App() {
  const { registerPlugin } = usePlugins();
  registerPlugin('histogramwidget', ResultsTable);
  return <DashboardById dashboardOid={'66f4d4dd384428002ae0a21d'} />;
};

...
```

If we refresh our application, instead of seeing the error in place of the widget as before, we should now see something like this:

![Dashboard in Compose SDK (registered plugin)](../img/plugins-guide/dashboard-in-csdk-registered.png 'Dashboard in Compose SDK (registered plugin)')

## Summary

Here's what we accomplished:
- Displayed an existing Fusion dashboard in our application by rendering a `DashboardById` component
- Created a React component that uses its props to execute a data query and display the results in a table
- Registered that table component to be shown in place of the `histogramwidget` when it is rendered inside of a `DashboardById` component

Obviously, we didn't end up with a new histogram component in React (yet), but hopefully the simplicity of this guide gives you the tools to you need to make that, or anything else, happen!
