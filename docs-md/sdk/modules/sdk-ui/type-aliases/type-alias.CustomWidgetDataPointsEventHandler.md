---
title: CustomWidgetDataPointsEventHandler
---

# Type alias CustomWidgetDataPointsEventHandler`<T>`

> **CustomWidgetDataPointsEventHandler**: <`T`> (`points`, `nativeEvent`) => `void`

Generic event handler for custom widget data points selection.

## Example

```ts
const handleSelect: CustomWidgetDataPointsEventHandler<MyDataPoint> = (points, event) => {
  console.log('Selected:', points.length, 'points');
};
```

## Type parameters

| Parameter | Default | Description |
| :------ | :------ | :------ |
| `T` *extends* [`AbstractDataPointWithEntries`](type-alias.AbstractDataPointWithEntries.md) | [`AbstractDataPointWithEntries`](type-alias.AbstractDataPointWithEntries.md) | The shape of the data point |

## Parameters

| Parameter | Type |
| :------ | :------ |
| `points` | [`CustomWidgetDataPoint`](type-alias.CustomWidgetDataPoint.md)\< `T` \>[] |
| `nativeEvent` | `MouseEvent` |

## Returns

`void`
