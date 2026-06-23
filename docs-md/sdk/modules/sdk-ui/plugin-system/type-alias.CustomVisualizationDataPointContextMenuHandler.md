---
title: CustomVisualizationDataPointContextMenuHandler
---

# Type alias CustomVisualizationDataPointContextMenuHandler <Badge type="beta" text="Beta" />`<T>`

> **CustomVisualizationDataPointContextMenuHandler**: <`T`> (`point`, `nativeEvent`) => `void`

Defines an event handler for a data point context-menu event in a custom visualization.

## Example

```ts
const handleContextMenu: CustomVisualizationDataPointContextMenuHandler<MyChartDataPoint> = (
  point,
  event,
) => {
  event.preventDefault();
  showContextMenu({ x: event.clientX, y: event.clientY, point });
};
```

## Type parameters

| Parameter | Default | Description |
| :------ | :------ | :------ |
| `T` *extends* [`AbstractDataPointWithEntries`](../type-aliases/type-alias.AbstractDataPointWithEntries.md) | [`AbstractDataPointWithEntries`](../type-aliases/type-alias.AbstractDataPointWithEntries.md) | The shape of the data point. |

## Parameters

| Parameter | Type |
| :------ | :------ |
| `point` | [`CustomVisualizationDataPoint`](type-alias.CustomVisualizationDataPoint.md)\< `T` \> |
| `nativeEvent` | `MouseEvent` |

## Returns

`void`
