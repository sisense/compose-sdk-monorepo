---
title: CustomVisualizationEventProps
---

# Interface CustomVisualizationEventProps <Badge type="beta" text="Beta" />`<DataPoint>`

Defines event handler props for a custom visualization component.

Included automatically via [CustomVisualizationProps](interface.CustomVisualizationProps.md). Extend to add custom event props.

## Example

```ts
interface MyEventProps extends CustomVisualizationEventProps<MyDataPoint> {
  onCustomAction?: (id: string) => void;
}
```

## Type parameters

| Parameter | Default | Description |
| :------ | :------ | :------ |
| `DataPoint` *extends* [`AbstractDataPointWithEntries`](../type-aliases/type-alias.AbstractDataPointWithEntries.md) | [`AbstractDataPointWithEntries`](../type-aliases/type-alias.AbstractDataPointWithEntries.md) | The shape of data points for this custom visualization. |

## Properties

### Callbacks

#### onDataPointClick

> **onDataPointClick**?: [`CustomVisualizationDataPointEventHandler`](type-alias.CustomVisualizationDataPointEventHandler.md)\< `DataPoint` \>

Click handler callback for a data point

***

#### onDataPointContextMenu

> **onDataPointContextMenu**?: [`CustomVisualizationDataPointContextMenuHandler`](type-alias.CustomVisualizationDataPointContextMenuHandler.md)\< `DataPoint` \>

Context menu handler callback for a data point

***

#### onDataPointsSelected

> **onDataPointsSelected**?: [`CustomVisualizationDataPointsEventHandler`](type-alias.CustomVisualizationDataPointsEventHandler.md)\< `DataPoint` \>

Handler callback for selection of multiple data points
