---
title: measureBetween
---

# Function measureBetween

> **measureBetween**(
  `measure`,
  `valueA`,
  `valueB`,
  `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate a measure value between or equal to two given numbers.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md) | Measure to filter by |
| `valueA` | `number` | Min value |
| `valueB` | `number` | Max value |
| `config`? | [`BaseFilterConfig`](../../../interfaces/interface.BaseFilterConfig.md) | Optional configuration for the filter |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for categories that have an average revenue greater than or equal to 50 and less than
or equal to 100 in the Sample ECommerce data model.
```ts
filterFactory.measureBetween(
  measureFactory.average(DM.Commerce.Revenue),
  50,
  100
)
```
