---
title: Migrating Compose SDK from 0.x.x to 1.0.0
---

# Migrating Compose SDK from 0.x.x to 1.0.0

Released in December 2023, Compose SDK (C-SDK) major version `1.0.0` introduces a number of breaking changes.
If your application is still using C-SDK version less than `1.0.0`, follow this guide to migrate.

>**Note**:
>This guide is for <img src="./../img/react-logo.png" height="18px" style="vertical-align: text-bottom; padding-bottom: 3px" /> React.
>As of December 2023, C-SDK for other frameworks including Angular and Vue are still under internal testing.

## Renamed

(1) For chart components in `@sisense/sdk-ui`,
   type alias `StyleOptions` has been renamed to `ChartStyleOptions`.
   If your app uses this type alias explicitly, do a simple search and replace in the code.

(2) For indicator chart in `@sisense/sdk-ui`,
    interface `IndicatorDataOptions` has been renamed to `IndicatorChartDataOptions`.
    If your app uses this interface explicitly, do a simple search and replace in the code.

(3) In `@sisense/sdk-data`, namespaces `measures` and `filters` have been renamed to
    `measureFactory` and `filterFactory`, respectively.
    Here is a code example to demonstrate the usage of `measureFactory` and `filterFactory`

BEFORE

```
  import { filters, measures } from '@sisense/sdk-data';
  import * as DM from './sample-ecommerce';
  const { data, isLoading, isError } = useExecuteQuery({
    dataSource: DM.DataSource,
    dimensions: [DM.Commerce.AgeRange],
    measures: [measures.sum(DM.Commerce.Revenue)],
    filters: [filters.greaterThan(DM.Commerce.Revenue, 1000)],
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }
  if (data) {
    return <div>{`Total Rows: ${data.rows.length}`}</div>;
  }
  return null;
```

AFTER
```
  import { filterFactory, measureFactory } from '@sisense/sdk-data';
  import * as DM from './sample-ecommerce';
  const { data, isLoading, isError } = useExecuteQuery({
    dataSource: DM.DataSource,
    dimensions: [DM.Commerce.AgeRange],
    measures: [measureFactory.sum(DM.Commerce.Revenue)],
    filters: [filterFactory.greaterThan(DM.Commerce.Revenue, 1000)],
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }
  if (data) {
    return <div>{`Total Rows: ${data.rows.length}`}</div>;
  }
  return null;
```

## Removed

(1) Parameter `widgetStyleOptions` has been removed from `ChartWidgetProps`, `TableWidgetProps`, and `DashboardWidgetProps`.
    Its options are now merged into the `styleOptions` prop to streamline the above mentioned props.
    This means that only `styleOptions` is needed to customize the look and feel of `*Chart`, `ChartWidget`, and `DashboardWidget` components.

Here is an example of `ChartWidget` with both `widgetStyleOptions` and `styleOptions` defined before and after the change:

Notice that `widgetStyleOptions` has been merged to `styleOptions`.

BEFORE
```
<ChartWidget
  title={'REVENUE vs.UNITS SOLD'}
  dataSource={DM.DataSource}
  chartType={'line'}
  dataOptions={{
    category: [
      {
        column: DM.Commerce.Date.Months,
        dateFormat: 'yy-MM',
      },
    ],
    value: [
      DM.Measures.SumRevenue,
      {
        column: DM.Measures.Quantity,
        showOnRightAxis: true,
        chartType: 'column',
      },
    ],
    breakBy: [],
  }}
  styleOptions={{
    subtype: 'line/spline',
    lineWidth: { width: 'bold' },
    yAxis: {
      title: { enabled: true, text: 'SALES' },
    },
    y2Axis: {
      title: { enabled: true, text: 'QUANTITY' },
    },
    markers: {
      enabled: true,
      fill: 'hollow',
    },
  }}
  widgetStyleOptions={{
    border: true,
    borderColor: 'lightgray',
    header: {
      dividerLine: true,
      dividerLineColor: 'lightgray',
    }
  }}
/>
```

AFTER

```
<ChartWidget
  title={'REVENUE vs.UNITS SOLD'}
  dataSource={DM.DataSource}
  chartType={'line'}
  dataOptions={{
    category: [
      {
        column: DM.Commerce.Date.Months,
        dateFormat: 'yy-MM',
      },
    ],
    value: [
      DM.Measures.SumRevenue,
      {
        column: DM.Measures.Quantity,
        showOnRightAxis: true,
        chartType: 'column',
      },
    ],
    breakBy: [],
  }}
  styleOptions={{
    subtype: 'line/spline',
    lineWidth: { width: 'bold' },
    yAxis: {
      title: { enabled: true, text: 'SALES' },
    },
    y2Axis: {
      title: { enabled: true, text: 'QUANTITY' },
    },
    markers: {
      enabled: true,
      fill: 'hollow',
    },
    border: true,
    borderColor: 'lightgray',
    header: {
      dividerLine: true,
      dividerLineColor: 'lightgray',
    },
  }}
/>
```

## Updated

(1) The return value of the `ExecuteQuery` component is now consistent with that of the `useExecuteQuery` hook.
    Specifically, `ExecuteQuery` returns `QueryState` instead of just `data`.

Here is a code example to demonstrate the usage of `ExecuteQuery` before and after the change:


BEFORE
```tsx
<ExecuteQuery
  dataSource={DM.DataSource}
  dimensions={[DM.Commerce.AgeRange]}
  measures={[measures.sum(DM.Commerce.Revenue)]}
  filters={[filters.greaterThan(DM.Commerce.Revenue, 1000)]}
>
  {
    (data) => {
      if (data) {
        console.log(data);
        return <div>{`Total Rows: ${data.rows.length}`}</div>;
      }
    }
  }
</ExecuteQuery>
```

AFTER
```tsx
<ExecuteQuery
  dataSource={DM.DataSource}
  dimensions={[DM.Commerce.AgeRange]}
  measures={[measures.sum(DM.Commerce.Revenue)]}
  filters={[filters.greaterThan(DM.Commerce.Revenue, 1000)]}
>
  {
    ( { data, isLoading, isError } ) => {
      if (isLoading) {
        return <div>Loading...</div>;
      }
      if (isError) {
        return <div>Error</div>;
      }
      if (data) {
        return <div>{`Total Rows: ${data.rows.length}`}</div>;
      }
      return null;
    }
  }
</ExecuteQuery>
```

(2) Similarly, the return value of the `ExecuteQueryByWidgetId` component is now consistent with that of the `useExecuteQueryByWidgetId` hook.
    Specifically, `ExecuteQueryByWidgetId` returns `QueryByWidgetIdState` instead of just `data` and `query`.

Here is a code example to demonstrate the usage of `ExecuteQueryByWidgetId` before and after the change:


BEFORE

```tsx
 <ExecuteQueryByWidgetId
   widgetOid={'64473e07dac1920034bce77f'}
   dashboardOid={'6441e728dac1920034bce737'}
 >
 {
   (data, query) => {
     if (data) {
       return <div>{`Total Rows: ${data.rows.length}`}</div>;
     }
   }
 }
 </ExecuteQueryByWidgetId>
 ```

AFTER

 ```tsx
<ExecuteQueryByWidgetId
  widgetOid={'64473e07dac1920034bce77f'}
  dashboardOid={'6441e728dac1920034bce737'}
>
{
  ({data, isLoading, isError}) => {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    if (isError) {
      return <div>Error</div>;
    }
    if (data) {
      console.log(data);
      return <div>{`Total Rows: ${data.rows.length}`}</div>;
    }
    return null;
  }
}
</ExecuteQueryByWidgetId>
```
