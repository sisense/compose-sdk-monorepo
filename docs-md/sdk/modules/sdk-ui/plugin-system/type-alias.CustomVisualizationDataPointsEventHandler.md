---
title: CustomVisualizationDataPointsEventHandler
---

# Type alias CustomVisualizationDataPointsEventHandler <Badge type="beta" text="Beta" />`<T>`

> **CustomVisualizationDataPointsEventHandler**: <`T`> (`points`, `nativeEvent`) => `void`

Defines an event handler for multi-point selection in a custom visualization.

## Example

```ts
const handleSelect: CustomVisualizationDataPointsEventHandler<MyChartDataPoint> = (
  points,
  event,
) => {
  console.log('Selected:', points.length, 'points');
};
```

## Type parameters

| Parameter | Default | Description |
| :------ | :------ | :------ |
| `T` *extends* [`AbstractDataPointWithEntries`](../type-aliases/type-alias.AbstractDataPointWithEntries.md) | [`AbstractDataPointWithEntries`](../type-aliases/type-alias.AbstractDataPointWithEntries.md) | The shape of the data point. |

## Parameters

| Parameter | Type |
| :------ | :------ |
| `points` | [`CustomVisualizationDataPoint`](type-alias.CustomVisualizationDataPoint.md)\< `T` \>[] |
| `nativeEvent` | `MouseEvent` |

## Returns

`void`
