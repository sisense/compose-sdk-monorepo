---
title: Sisense Fusion Widgets
---

# Sisense Fusion Widgets

Sisense Fusion widgets are charts from dashboard widgets that already exist in your Sisense instance. You can reuse the charts you already have and customize them using Compose SDK.

You display charts from your existing Sisense instance using the `<WidgetById />` component in React/Vue projects or `WidgetByIdComponent` in Angular projects.

Note that you can also get the data from a dashboard widget and use it in a Compose SDK chart using the `useExecuteQueryByWidgetId()` hook in React/Vue projects or the `executeQueryByWidgetId()` query service method in Angular projects.

## WidgetById Properties

Many of the properties of dashboard widget component’s properties are the same as the properties for other Compose SDK charts. To learn more about those properties, see [Compose SDK charts](./guide-compose-sdk-charts.md).

There are also some properties which are specific to `WidgetById` components.

### dashboardOid and widgetOid

In addition to any other chart properties you want to use with a `WidgetById`, you need to specify the `dashboardOid` and `widgetOid`, which identify which widget from your Sisense instance is displayed in the `WidgetById`.

You can get the `dashboardOid` and `widgetOid` from the widget’s embed code in Sisense instance or using the Sisense REST API. You can also use the the `useGetDashboardModel` and `useGetDashboardModels` hooks in React/Vue or the `DashboardService` functions with the same names in Angular, to get `dashboardOid` and `widgetOid` values for a dashboard and its widgets.

For example, the following code snippets get a chart or charts from a Sisense dashboard:

##### React

Hardcoded dashboard and widget IDs

<iframe
 src='https://csdk-playground.sisense.com/?example=charts-guide/widget-component&mode=docs'
 width=800
 height=900
 style='border:none;'
/>

Retrieve widget IDs using hook

<iframe
 src='https://csdk-playground.sisense.com/?example=charts-guide/widget-hook&mode=docs'
 width=800
 height=975
 style='border:none;'
/>

##### Angular

```ts
// Hardcoded dashboard and widget IDs
// Component behavior in .component.ts

chart = {
  dashboardOid: '65536353a90176002a68e5aa',
  widgetOid: '6553637ea90176002a68e5ac',
};
```

```html
<!--Hardcoded dashboard and widget IDs-->
<!--Component HTML template in .component.html-->

<csdk-dashboard-widget [dashboardOid]="chart.dashboardOid" [widgetOid]="chart.widgetOid" />
```

### Widget Properties

Since the WidgetById component includes the widget wrapper over a chart, it has properties for customizing the widget, including:

- `title` - Widget title
- `description` - Widget description
- `styleOptions` - Configuration options that define the style of the widget

#### Additional Properties

In addition to the standard chart properties, widget properties, and properties to identify which widget to display, `WidgetById` also has properties that allow you to define the interplay between the widget as it is set up in your Sisense instance and customizations you apply in code.

These properties include:

- `includeDashboardFilters` - Whether to include dashboard filters and highlights that apply to the original widget in your Sisense instance
- `filtersMergeStrategy` - How to reconcile dashboard filters and highlights that apply to the original widget in your Sisense instance and filters and highlights set in code
