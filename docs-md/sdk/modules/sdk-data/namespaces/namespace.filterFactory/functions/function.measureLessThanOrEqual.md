---
title: measureLessThanOrEqual
---

# Function measureLessThanOrEqual

> **measureLessThanOrEqual**(`measure`, `value`): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate a measure value less than or equal to a given number.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md) | Measure to filter by |
| `value` | `number` | Max value |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for categories that have an average revenue less than
or equal to 100 in the Sample ECommerce data model.
```ts
filterFactory.measureLessThanOrEqual(
  measures.average(DM.Commerce.Revenue),
  100
)
```
