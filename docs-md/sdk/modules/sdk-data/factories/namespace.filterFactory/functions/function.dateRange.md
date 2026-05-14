---
title: dateRange
---

# Function dateRange

> **dateRange**(
  `level`,
  `from`?,
  `to`?,
  `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter that keeps rows between a start and an end at the given date level.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `level` | [`LevelAttribute`](../../../interfaces/interface.LevelAttribute.md) | Date [LevelAttribute](../../../interfaces/interface.LevelAttribute.md) to filter on |
| `from`? | `Date` \| `string` | Optional `Date` or ISO-format string |
| `to`? | `Date` \| `string` | Optional `Date` or ISO-format string |
| `config`? | [`BaseFilterConfig`](../../../interfaces/interface.BaseFilterConfig.md) | Optional configuration for the filter |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Remarks

Pass JavaScript `Date` values or ISO-format datetime strings for `from` and/or `to`. On
**`Years`–`Days`** levels, the time part of each supplied value (from the first `T` onward) is
stripped.

## Example

Filter for items in the Sample ECommerce data model where the date is from the years 2009, 2010, or 2011.
```ts
filterFactory.dateRange(DM.Commerce.Date.Years, '2009-06-15', '2011-03-20')
// or
filterFactory.dateRange(DM.Commerce.Date.Years, '2009-01-01', '2011-12-31')
```
With `Years`, both are equivalent: only the **years** in `from` and `to` drive the range; month and
day inside those endpoints do not change which year buckets are included.

One calendar day at day granularity: use the **same** `yyyy-MM-dd` for `from` and `to`.
```ts
filterFactory.dateRange(DM.Commerce.Date.Days, '2012-05-05', '2012-05-05')
```
