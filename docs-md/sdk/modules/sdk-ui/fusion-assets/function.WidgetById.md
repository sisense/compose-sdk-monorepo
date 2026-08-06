---
title: WidgetById
---

# Function WidgetById <Badge type="fusionEmbed" text="Fusion Embed" />

> **WidgetById**(`props`): `Promise`\< `ReactNode` \> \| `ReactNode`

The WidgetById component, which is a thin wrapper on the [ChartWidget](../dashboards/function.ChartWidget.md) component,
is used to render a widget created in a Sisense Fusion instance.

To learn more about using Sisense Fusion Widgets in Compose SDK,
see [Sisense Fusion Widgets](/guides/sdk/guides/charts/guide-fusion-widgets.html).

**Note:** Widget extensions based on JS scripts and add-ons in Fusion are not supported.

## Example

Display two dashboard widgets from a Fusion instance.

<iframe
 src='https://csdk-playground.sisense.com/?example=fusion-assets%2Ffusion-widgets&mode=docs'
 width='100%'
 height='870'
 style='max-width:800px; border:none;'
/>

## Parameters

| Parameter | Type |
| :------ | :------ |
| `props` | [`WidgetByIdProps`](../interfaces/interface.WidgetByIdProps.md) |

## Returns

`Promise`\< `ReactNode` \> \| `ReactNode`
