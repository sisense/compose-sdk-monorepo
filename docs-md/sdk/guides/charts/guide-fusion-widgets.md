---
title: Sisense Fusion Widgets
---

# Sisense Fusion Widgets

Sisense Fusion widgets are charts from dashboard widgets that already exist in your Sisense instance. You can reuse the charts you already have and customize them using Compose SDK.

You display charts from your existing Sisense instance using the `<DashboardWidget />` component in React projects or `DashboardWidgetComponent` in Angular projects.

Note that you can also get the data from a dashboard widget and use it in a Compose SDK chart using the `useExecuteQueryByWidgetId()` hook in React projects or the `executeQueryByWidgetId()` query service method in Angular projects.

## DashboardWidget Properties

Many of the properties of dashboard widget component’s properties are the same as the properties for other Compose SDK charts. To learn more about those properties, see [Compose SDK charts](./guide-compose-sdk-charts.md).

There are also some properties which are specific to Dashboard Widget components.

### dashboardOid and widgetOid

In addition to any other chart properties you want to use with a `DashboardWidget`, you need to specify the `dashboardOid` and `widgetOid`, which identify which widget from your Sisense instance is displayed in the DashboardWidget.

You can get the `dashboardOid` and `widgetOid` from the widget’s embed code in Sisense instance or using the Sisense REST API. You can also use the the`getDashboardModel()` and `getDashboardModels()` hooks in React or the `DashboardService` functions with the same names in Angular, to get `dashboardOid` and `widgetOid` values for a dashboard and its widgets.

For example, the following code snippets get a chart or charts from a Sisense dashboard:

##### Chart

![Widget chart](../../img/chart-guides/dashboard-widget.png 'Widget chart')

##### React

```ts
// Hardcoded dashboard and widget IDs

import { DashboardWidget } from '@sisense/sdk-ui';

//...

<DashboardWidget
    dashboardOid="65536353a90176002a68e5aa"
    widgetOid="6553637ea90176002a68e5ac"
    title="Dashboard Widget"
/>;
```

```ts
// Retrieve dashboard and widget IDs using hook

import { DashboardWidget, useGetDashboardModel } from '@sisense/sdk-ui';

//...

const { dashboard, isLoading, isError } = useGetDashboardModel({
    dashboardOid: '65536353a90176002a68e5aa',
    includeWidgets: true,
});

//...

{
    isLoading && <div>Loading...</div>;
}
{
    isError && <div>Error</div>;
}
{
    dashboard && (
        <div>
            {dashboard.widgets?.map((widget) => (
                <DashboardWidget widgetOid={widget.oid} dashboardOid={dashboard.oid} title={widget.title} />
            ))}
        </div>
    );
}
```

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

Since the DashboardWidget component includes the widget wrapper over a chart, it has properties for customizing the widget, including:

-   `title` - Widget title
-   `description` - Widget description
-   `styleOptions` - Configuration options that define the style of the widget

#### Additional Properties

In addition to the standard chart properties, widget properties, and properties to identify which widget to display, DashboardWidgets also have properties that allow you to define the interplay between the widget as it is set up in your Sisense instance and customizations you apply in code.

These properties include:

-   `includeDashboardFilters` - Whether to include filters and highlights that are set in both the original widget in your Sisense instance
-   `filtersMergeStrategy` - How to reconcile filters and highlights that are set in both the original widget in your Sisense instance and filters and highlights set in code
