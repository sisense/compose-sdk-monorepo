---
title: CustomWidgetEventProps
---

# Interface CustomWidgetEventProps`<DataPoint>`

Event props for custom widgets with generic data point type.

## Type parameters

| Parameter | Default | Description |
| :------ | :------ | :------ |
| `DataPoint` *extends* [`AbstractDataPointWithEntries`](../type-aliases/type-alias.AbstractDataPointWithEntries.md) | [`AbstractDataPointWithEntries`](../type-aliases/type-alias.AbstractDataPointWithEntries.md) | The shape of data points for this custom widget |

## Properties

### Callbacks

#### onDataPointClick

> **onDataPointClick**?: [`CustomWidgetDataPointEventHandler`](../type-aliases/type-alias.CustomWidgetDataPointEventHandler.md)\< `DataPoint` \>

Click handler callback for a data point

***

#### onDataPointContextMenu

> **onDataPointContextMenu**?: [`CustomWidgetDataPointContextMenuHandler`](../type-aliases/type-alias.CustomWidgetDataPointContextMenuHandler.md)\< `DataPoint` \>

Context menu handler callback for a data point

***

#### onDataPointsSelected

> **onDataPointsSelected**?: [`CustomWidgetDataPointsEventHandler`](../type-aliases/type-alias.CustomWidgetDataPointsEventHandler.md)\< `DataPoint` \>

Handler callback for selection of multiple data points
