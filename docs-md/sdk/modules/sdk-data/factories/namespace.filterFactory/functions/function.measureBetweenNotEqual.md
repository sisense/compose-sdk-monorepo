---
title: measureBetweenNotEqual
---

# Function measureBetweenNotEqual

> **measureBetweenNotEqual**(
  `measure`,
  `valueA`,
  `valueB`): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate a measure value between but not equal to two given numbers.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md) | Measure to filter by |
| `valueA` | `number` | Min value |
| `valueB` | `number` | Max value |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for categories that have an average revenue greater than 50 and less than
100 in the Sample ECommerce data model.
```ts
filterFactory.measureBetweenNotEqual(
  measureFactory.average(DM.Commerce.Revenue),
  50,
  100
)
```
