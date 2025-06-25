---
title: Custom Widgets (Vue)
---

# Custom Widgets

> **Note**:
> This guide is for [<img src="../../img/vue-logo.png" height="14px" /> Vue](../../getting-started/quickstart-vue.md). For other frameworks, see the [<img src="../../img/react-logo.png" height="18px" style="vertical-align: text-bottom; padding-bottom: 3px" /> React](custom-widgets-react.md) and [<img src="../../img/angular-logo.png" height="18px" style="vertical-align: text-bottom; padding-bottom: 2px" /> Angular](custom-widgets-angular.md) guides.

This guide explains how to define your own custom widget component and register it in your application code, so that it will be automatically rendered (based on the corresponding widget type) when using the `DashboardById` component. Custom widgets in Compose SDK can be used to replace Fusion plugins when displaying dashboards.

**Note:** It is assumed that the application is [already configured correctly](../../getting-started/quickstart-vue.md) for use with Compose SDK.

## Sample dashboard

The `histogramwidget` plugin is included with Sisense Fusion, so we'll be using it as our example. We'll start by creating a dashboard in Fusion, containing a single `histogramwidget` widget with `Sample ECommerce` as its data source.

![Dashboard in Fusion](../../img/plugins-guide/dashboard-in-fusion.png 'Dashboard in Fusion')

## Displaying the dashboard in your application

To display a dashboard using Compose SDK, we need the `oid` for the relevant dashboard. The simplest way to find this, is to copy the value from the end of the URL when viewing the dashboard in Fusion, e.g. `/app/main/dashboards/{dashboardOid}`.

The dashboard can be easily displayed using the `DashboardById` component, passing this value into the `dashboardOid` prop.

```vue
<template>
  <DashboardById :dashboardOid="'66f23d1b202c89002abd64ac'" />
</template>

<script setup>
import { DashboardById } from '@sisense/sdk-ui-vue';
</script>
```

Since Compose SDK does not support the `histogramwidget` plugin out of the box, it is expected that Compose SDK will display an error in place of the histogram widget.

![Dashboard in Compose SDK (no registered custom widget)](../../img/plugins-guide/dashboard-in-csdk-unregistered.png 'Dashboard in Compose SDK (no registered custom widget)')

In order to resolve this, we will explore how to define a custom widget component and register it with Compose SDK, so that it knows what to do when it encounters a `histogramwidget` plugin from Fusion.

## Defining a custom widget using Compose SDK

Before registering our custom widget, we first need to define a custom widget component that will replace the Fusion plugin. This component will:
1. Receive the props that Compose SDK will pass to our custom widget when rendering the `DashboardById` component
2. Run a data query using those props
3. Render a visualization with the results

Purely for the **simplicity** of this guide, we have chosen to define a custom widget component which renders a table of the query results. In reality, you would more likely define a Vue implementation of a histogram chart, or however else you wish to represent the Fusion plugin in your Compose SDK dashboard.

This guide also aims to demonstrate the flexibility of the `registerCustomWidget` interface - as long as you provide a component that matches the shape of [`CustomWidgetComponent`](../../modules/sdk-ui-vue/type-aliases/type-alias.CustomWidgetComponent.md), Compose SDK will render that component as a replacement for the designated Fusion plugin.

A note on the `dataOptions` prop that is passed to our component: For those familiar with the Fusion plugin / add-on architecture, `dataOptions` is the Compose SDK equivalent of `panels` on the [WidgetMetadata](https://sisense.dev/guides/customJs/jsApiRef/widgetClass/widget-metadata.html) object.

Compose SDK translates all widget metadata and filters to Compose SDK data structures (e.g. values inside [`dataOptions`](../../modules/sdk-ui-vue/type-aliases/type-alias.ChartDataOptions.md) are of type [`StyledColumn`](../../modules/sdk-ui-vue/interfaces/interface.StyledColumn.md) and [`StyledMeasureColumn`](../../modules/sdk-ui-vue/interfaces/interface.StyledMeasureColumn.md), the same types you'd expect for [`dataOptions`](../../modules/sdk-ui-vue/type-aliases/type-alias.ChartDataOptions.md) into the [`Chart`](../../modules/sdk-ui-vue/charts/class.Chart.md) component).

In the custom widget component, we can use the props directly with the `useExecuteCustomWidgetQuery` composable which runs a data query and applies some formatting on the results (defined by the `StyledColumn` information in `dataOptions`).

```vue
<template>
  <table v-if="data" style="margin: 20px;">
    <thead>
      <tr>
        <th v-for="(column, index) in data.columns" :key="index">
          {{ column.name }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, rowIndex) in data.rows" :key="rowIndex">
        <td v-for="(cell, cellIndex) in row" :key="cellIndex">
          {{ cell.text }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { defineComponent } from 'vue';
import { useExecuteCustomWidgetQuery } from '@sisense/sdk-ui-vue';

const props = defineProps({
  title: String,
  dataOptions: Object,
  filters: Array
});

const { data } = useExecuteCustomWidgetQuery(props);
</script>
```

If you prefer to work with the raw data without any formatting applied, you can use `extractDimensionsAndMeasures` with `useExecuteQuery` instead.

```vue
<script setup>
import { useExecuteQuery, extractDimensionsAndMeasures } from '@sisense/sdk-ui-vue';

const props = defineProps({
  title: String,
  dataOptions: Object,
  filters: Array
});

const { dimensions, measures } = extractDimensionsAndMeasures(props.dataOptions);
const { data } = useExecuteQuery({
  dimensions,
  measures,
  filters: props.filters,
});
</script>
```

## Registering the custom widget with Compose SDK

To register the custom widget, we need to use the `useCustomWidgets` composable and call `registerCustomWidget`.

```vue
<template>
  <DashboardById :dashboardOid="'66f4d4dd384428002ae0a21d'" />
</template>

<script setup>
import { onMounted } from 'vue';
import { DashboardById, useCustomWidgets } from '@sisense/sdk-ui-vue';
import ResultsTable from './ResultsTable.vue';

const { registerCustomWidget } = useCustomWidgets();
registerCustomWidget('histogramwidget', ResultsTable);

</script>
```

If we refresh our application, instead of seeing the error in place of the widget as before, we should now see something like this:

![Dashboard in Compose SDK (registered custom widget)](../../img/plugins-guide/dashboard-in-csdk-registered.png 'Dashboard in Compose SDK (registered custom widget)')

## Summary

Here's what we accomplished:
- Displayed an existing Fusion dashboard in our application by rendering a `DashboardById` component
- Created a Vue component that uses its props to execute a data query and display the results in a table
- Registered that table component as a custom widget to be shown in place of the `histogramwidget` Fusion plugin when it is rendered inside of a `DashboardById` component

Obviously, we didn't end up with a new histogram component in Vue (yet), but hopefully the simplicity of this guide gives you the tools to you need to make that, or anything else, happen!