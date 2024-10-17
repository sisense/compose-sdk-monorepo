---
title: dateRelativeFrom
---

# Function dateRelativeFrom

> **dateRelativeFrom**(
  `level`,
  `offset`,
  `count`,
  `anchor`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate items with a date dimension value within a specified range after a
given date and level.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `level` | [`LevelAttribute`](../../../interfaces/interface.LevelAttribute.md) | Date [LevelAttribute](../../../interfaces/interface.LevelAttribute.md) to filter on |
| `offset` | `number` | Number of levels to skip from the given `anchor` or the default of the current day (e.g. `6` is 6 months when `level` is a months level attribute) |
| `count` | `number` | Number of levels to include in the filter (e.g. `6` is 6 months when `level` is a months level attribute) |
| `anchor`? | `Date` \| `string` | Date to filter from, defaults to the current day |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for items in the Sample ECommerce data model where the date is in 2011 or the first half of 2012.
```ts
filterFactory.dateRelativeFrom(DM.Commerce.Date.Months, 0, 18, '2011-01'),
```
