---
title: KpiChartEventProps
---

# Interface KpiChartEventProps <Badge type="beta" text="Beta" />

Event props for the [KpiChart](../charts/function.KpiChart.md) component.

## Properties

### Callbacks

#### onBeforeRender

> **onBeforeRender**?: [`KpiBeforeRenderHandler`](../type-aliases/type-alias.KpiBeforeRenderHandler.md)

A callback that allows you to customize the computed KPI render options
before the card is rendered. The returned options are used for painting.

***

#### onDataPointClick

> **onDataPointClick**?: [`KpiDataPointEventHandler`](../type-aliases/type-alias.KpiDataPointEventHandler.md)

Click handler callback for the KPI card.

***

#### onDataPointContextMenu

> **onDataPointContextMenu**?: [`KpiDataPointEventHandler`](../type-aliases/type-alias.KpiDataPointEventHandler.md)

Context menu handler callback for the KPI card.

***

#### onDataReady

> **onDataReady**?: (`data`) => [`Data`](../../sdk-data/interfaces/interface.Data.md)

A callback that allows to modify data immediately after it has been retrieved.
It can be used to inject modification of queried data.

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `data` | [`Data`](../../sdk-data/interfaces/interface.Data.md) |

##### Returns

[`Data`](../../sdk-data/interfaces/interface.Data.md)
