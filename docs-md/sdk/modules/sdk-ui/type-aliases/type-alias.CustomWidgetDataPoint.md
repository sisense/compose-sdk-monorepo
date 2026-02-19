---
title: CustomWidgetDataPoint
---

# Type alias CustomWidgetDataPoint`<T>`

> **CustomWidgetDataPoint**: <`T`> `T`

Represents a single data point in a custom widget.

This type is used to define the structure of a data point that is passed to event handlers
like `onDataPointClick`. It typically extends `AbstractDataPointWithEntries` to include
specific entries for categories, values, or other dimensions used in the widget.

## Example

```typescript
interface MyWidgetDataPoint extends CustomWidgetDataPoint {
  entries: {
    category: DataPointEntry[];
    value: DataPointEntry[];
  };
}

const onDataPointClick = (point: MyWidgetDataPoint) => {
  console.log('Clicked category:', point.entries.category[0].value);
};
```

## Type parameters

| Parameter | Default |
| :------ | :------ |
| `T` *extends* [`AbstractDataPointWithEntries`](type-alias.AbstractDataPointWithEntries.md) | [`AbstractDataPointWithEntries`](type-alias.AbstractDataPointWithEntries.md) |
