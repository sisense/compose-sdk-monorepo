---
title: DashboardWidget
---

# Function DashboardWidget

> **DashboardWidget**(`props`, `context`?): `null` \| `ReactElement`\< `any`, `any` \>

The Dashboard Widget component, which is a thin wrapper on the [ChartWidget](function.ChartWidget.md) component,
is used to render a widget created in a Sisense Fusion instance.

To learn more about using Sisense Fusion Widgets in Compose SDK,
see [Sisense Fusion Widgets](/guides/sdk/guides/charts/guide-fusion-widgets.html).

## Parameters

| Parameter | Type |
| :------ | :------ |
| `props` | [`DashboardWidgetProps`](../interfaces/interface.DashboardWidgetProps.md) |
| `context`? | `any` |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

## Example

The example below renders a dashboard widget with the specified widget and dashboard OIDs.
```ts
<DashboardWidget
  widgetOid={'64473e07dac1920034bce77f'}
  dashboardOid={'6441e728dac1920034bce737'}
/>
```
