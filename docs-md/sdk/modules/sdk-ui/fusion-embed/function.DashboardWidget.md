---
title: DashboardWidget
---

# Function DashboardWidget <Badge type="fusionEmbed" text="Fusion Embed" />

> **DashboardWidget**(`props`, `deprecatedLegacyContext`?): `null` \| `ReactElement`\< `any`, `any` \>

The Dashboard Widget component, which is a thin wrapper on the [ChartWidget](../chart-utilities/function.ChartWidget.md) component,
is used to render a widget created in a Sisense Fusion instance.

To learn more about using Sisense Fusion Widgets in Compose SDK,
see [Sisense Fusion Widgets](/guides/sdk/guides/charts/guide-fusion-widgets.html).

## Example

Display two dashboard widgets from a Fusion Embed instance.

<iframe
 src='https://csdk-playground.sisense.com/?example=fusion-assets%2Ffusion-widgets&mode=docs'
 width=800
 height=870
 style='border:none;'
/>

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`DashboardWidgetProps`](../interfaces/interface.DashboardWidgetProps.md) | - |
| `deprecatedLegacyContext`? | `any` | ::: warning Deprecated<br /><br />:::<br /><br />**See**<br /><br />[React Docs](https://legacy.reactjs.org/docs/legacy-context.html#referencing-context-in-lifecycle-methods) |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>
