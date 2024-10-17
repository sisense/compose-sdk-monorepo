---
title: dateRelative
---

# Function dateRelative

> **dateRelative**(
  `level`,
  `offset`,
  `count`,
  `anchor`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate items with a date dimension value within a specified range after a
given date and level.

Although the `offset` can be used to set a beginning date prior to the `anchor`, the filter range always
continues forward after the offset beginning date. So, using an `offset` of `-6` and a `count` of `18` when `level`
is a month level creates a range that begins 6 month before the `anchor` date and extends to 12 months after
the `anchor` date.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `level` | [`LevelAttribute`](../../../interfaces/interface.LevelAttribute.md) | Date [LevelAttribute](../../../interfaces/interface.LevelAttribute.md) to filter on |
| `offset` | `number` | Number of levels to skip from the given `anchor` or the default of the current day.<br />Positive numbers skip forwards and negative numbers skip backwards (e.g. `-6` is 6 months backwards when `level` is a months level attribute) |
| `count` | `number` | Number of levels to include in the filter (e.g. `6` is 6 months when `level` is a months level attribute) |
| `anchor`? | `Date` \| `string` | Date to filter from, defaults to the current day |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for items in the Sample ECommerce data model where the date is in 2011 or the first half of 2012.
```ts
filterFactory.dateRelative(DM.Commerce.Date.Months, 0, 18, '2011-01'),
```

Filter for items in the Sample ECommerce data model where the date is in the second half of 2010 or in 2011.
```ts
filterFactory.dateRelative(DM.Commerce.Date.Months, -6, 18, '2011-01'),
```

Filter for items in the Sample ECommerce data model where the date is in the past 6 months.
```ts
filterFactory.dateRelative(DM.Commerce.Date.Months, -6, 6),
```
