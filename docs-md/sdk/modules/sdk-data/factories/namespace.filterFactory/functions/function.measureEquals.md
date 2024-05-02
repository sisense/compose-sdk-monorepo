---
title: measureEquals
---

# Function measureEquals

> **measureEquals**(`measure`, `value`): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate a measure value equal to a given number.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md) | Measure to filter by |
| `value` | `number` | Value |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for categories that have an average revenue equal 50 in the Sample ECommerce data model.
```ts
filterFactory.measureEquals(
  measures.average(DM.Commerce.Revenue),
  50
)
```
