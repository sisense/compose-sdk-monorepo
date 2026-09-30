---
title: measureEquals
---

# Function measureEquals

> **measureEquals**(
  `measure`,
  `value`,
  `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate a measure value equal to a given number or date.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md) \| [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md) | Measure to filter by |
| `value` | `Date` \| `number` \| `string` | Value. For a date measure pass a `Date` or an ISO 8601 string.<br />A number is only valid for a numeric measure. |
| `config`? | [`BaseFilterConfig`](../../../interfaces/interface.BaseFilterConfig.md) | Optional configuration for the filter |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for categories that have an average revenue equal 50 in the Sample ECommerce data model.
```ts
filterFactory.measureEquals(
  measureFactory.average(DM.Commerce.Revenue),
  50
)
```

## Example

Filter for categories whose last order was on 4 December 2013 in the Sample ECommerce data model.
```ts
filterFactory.measureEquals(
  measureFactory.max(DM.Commerce.Date.Days),
  new Date('2013-12-04T00:00:00')
)
```
