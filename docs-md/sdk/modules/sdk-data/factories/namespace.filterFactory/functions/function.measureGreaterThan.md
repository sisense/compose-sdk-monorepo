---
title: measureGreaterThan
---

# Function measureGreaterThan

> **measureGreaterThan**(`measure`, `value`): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate a measure value greater than to a given number.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md) | Measure to filter by |
| `value` | `number` | Min value |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for categories that have an average revenue greater than
to 50 in the Sample ECommerce data model.
```ts
filterFactory.measureGreaterThan(
  measures.average(DM.Commerce.Revenue),
  50
)
```
