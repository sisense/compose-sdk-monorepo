---
title: measureLessThanOrEqual
---

# Function measureLessThanOrEqual

> **measureLessThanOrEqual**(
  `measure`,
  `value`,
  `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate a measure value less than or equal to a given number or date.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md) \| [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md) | Measure to filter by |
| `value` | `Date` \| `number` \| `string` | Max value. For a date measure pass a `Date` or an ISO 8601 string.<br />A number is only valid for a numeric measure. |
| `config`? | [`BaseFilterConfig`](../../../interfaces/interface.BaseFilterConfig.md) | Optional configuration for the filter |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for categories that have an average revenue less than
or equal to 100 in the Sample ECommerce data model.
```ts
filterFactory.measureLessThanOrEqual(
  measureFactory.average(DM.Commerce.Revenue),
  100
)
```

## Example

Filter for categories whose last order was on or before 1 December 2013 in the Sample ECommerce
data model.
```ts
filterFactory.measureLessThanOrEqual(
  measureFactory.max(DM.Commerce.Date.Days),
  new Date('2013-12-01T00:00:00')
)
```
