---
title: CustomVisualizationDataPoint
---

# Type alias CustomVisualizationDataPoint <Badge type="beta" text="Beta" />`<T>`

> **CustomVisualizationDataPoint**: <`T`> `T`

Represents a single data point in a custom visualization.

Extend `AbstractDataPointWithEntries` to define typed entries for your widget's data options.
Instances are passed to event handlers such as `onDataPointClick`.

## Example

```ts
import { CustomVisualizationDataPoint, DataPointEntry } from '@sisense/sdk-ui';

interface MyChartDataPoint extends CustomVisualizationDataPoint {
  entries: {
    category: DataPointEntry[];
    value: DataPointEntry[];
  };
}

const onDataPointClick = (point: MyChartDataPoint) => {
  console.log('Clicked category:', point.entries.category[0].value);
};
```

## Type parameters

| Parameter | Default | Description |
| :------ | :------ | :------ |
| `T` *extends* [`AbstractDataPointWithEntries`](../type-aliases/type-alias.AbstractDataPointWithEntries.md) | [`AbstractDataPointWithEntries`](../type-aliases/type-alias.AbstractDataPointWithEntries.md) | The concrete data point shape, extending [AbstractDataPointWithEntries](../type-aliases/type-alias.AbstractDataPointWithEntries.md). |
