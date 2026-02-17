---
title: CustomWidgetDataPointEventHandler
---

# Type alias CustomWidgetDataPointEventHandler`<T>`

> **CustomWidgetDataPointEventHandler**: <`T`> (`point`, `nativeEvent`) => `void`

Generic event handler for custom widget data point click.

## Example

```ts
const handleClick: CustomWidgetDataPointEventHandler<MyDataPoint> = (point, event) => {
  console.log('Clicked:', point.label, point.value);
};
```

## Type parameters

| Parameter | Default | Description |
| :------ | :------ | :------ |
| `T` *extends* [`AbstractDataPointWithEntries`](type-alias.AbstractDataPointWithEntries.md) | [`AbstractDataPointWithEntries`](type-alias.AbstractDataPointWithEntries.md) | The shape of the data point |

## Parameters

| Parameter | Type |
| :------ | :------ |
| `point` | [`CustomWidgetDataPoint`](type-alias.CustomWidgetDataPoint.md)\< `T` \> |
| `nativeEvent` | `MouseEvent` \| `PointerEvent` |

## Returns

`void`
