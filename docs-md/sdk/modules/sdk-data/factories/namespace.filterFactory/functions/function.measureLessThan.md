---
title: measureLessThan
---

# Function measureLessThan

> **measureLessThan**(`measure`, `value`): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate a measure value less than a given number.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md) | Measure to filter by |
| `value` | `number` | Value |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for categories that have an average revenue less than 100 in the Sample ECommerce data model.
```ts
filterFactory.measureLessThan(
  measureFactory.average(DM.Commerce.Revenue),
  100
)
```
