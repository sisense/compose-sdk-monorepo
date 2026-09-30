---
title: measureBetween
---

# Function measureBetween

> **measureBetween**(
  `measure`,
  `valueA`,
  `valueB`,
  `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate a measure value between or equal to two given numbers or dates.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md) \| [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md) | Measure to filter by |
| `valueA` | `Date` \| `number` \| `string` | Min value. For a date measure pass a `Date` or an ISO 8601 string.<br />A number is only valid for a numeric measure. |
| `valueB` | `Date` \| `number` \| `string` | Max value. For a date measure pass a `Date` or an ISO 8601 string.<br />A number is only valid for a numeric measure. |
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

## Example

Filter for categories whose last order falls in the fourth quarter of 2013 in the Sample
ECommerce data model.
```ts
filterFactory.measureBetween(
  measureFactory.max(DM.Commerce.Date.Days),
  new Date('2013-10-01T00:00:00'),
  new Date('2013-12-31T23:59:59')
)
```
