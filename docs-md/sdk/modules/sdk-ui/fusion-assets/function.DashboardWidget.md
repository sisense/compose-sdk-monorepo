---
title: DashboardWidget
---

# Function DashboardWidget <Badge type="fusionEmbed" text="Fusion Embed" />

> **DashboardWidget**(`props`): `ReactElement`\< `any`, `any` \> \| `null`

The Dashboard Widget component, which is a thin wrapper on the [ChartWidget](../dashboards/function.ChartWidget.md) component,
is used to render a widget created in a Sisense Fusion instance.

To learn more about using Sisense Fusion Widgets in Compose SDK,
see [Sisense Fusion Widgets](/guides/sdk/guides/charts/guide-fusion-widgets.html).

**Note:** Widget extensions based on JS scripts and add-ons in Fusion are not supported.

## Example

Display two dashboard widgets from a Fusion instance.

<iframe
 src='https://csdk-playground.sisense.com/?example=fusion-assets%2Ffusion-widgets&mode=docs'
 width=800
 height=870
 style='border:none;'
/>

## Parameters

| Parameter | Type |
| :------ | :------ |
| `props` | [`DashboardWidgetProps`](../interfaces/interface.DashboardWidgetProps.md) |

## Returns

`ReactElement`\< `any`, `any` \> \| `null`

::: warning Deprecated
Use [`WidgetById`](function.WidgetById.md) instead.
:::
