---
title: CustomVisualizationDataPointEventHandler
---

# Type alias CustomVisualizationDataPointEventHandler <Badge type="beta" text="Beta" />`<T>`

> **CustomVisualizationDataPointEventHandler**: <`T`> (`point`, `nativeEvent`) => `void`

Defines an event handler for a data point click in a custom visualization.

## Example

```ts
const handleClick: CustomVisualizationDataPointEventHandler<MyChartDataPoint> = (point, event) => {
  console.log('Clicked:', point.entries.category[0].value);
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
| `nativeEvent` | `MouseEvent` \| `PointerEvent` |

## Returns

`void`
