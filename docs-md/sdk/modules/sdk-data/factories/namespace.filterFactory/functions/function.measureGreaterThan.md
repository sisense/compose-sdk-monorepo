---
title: measureGreaterThan
---

# Function measureGreaterThan

> **measureGreaterThan**(
  `measure`,
  `value`,
  `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate a measure value greater than to a given number.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md) | Measure to filter by |
| `value` | `number` | Min value |
| `config`? | [`BaseFilterConfig`](../../../interfaces/interface.BaseFilterConfig.md) | Optional configuration for the filter |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for categories that have an average revenue greater than
to 50 in the Sample ECommerce data model.
```ts
filterFactory.measureGreaterThan(
  measureFactory.average(DM.Commerce.Revenue),
  50
)
```
