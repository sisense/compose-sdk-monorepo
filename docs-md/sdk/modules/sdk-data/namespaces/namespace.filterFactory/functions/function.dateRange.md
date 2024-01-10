---
title: dateRange
---

# Function dateRange

> **dateRange**(
  `level`,
  `from`?,
  `to`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate items between and including the given dates and level.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `level` | [`LevelAttribute`](../../../interfaces/interface.LevelAttribute.md) | Date [LevelAttribute](../../../interfaces/interface.LevelAttribute.md) to filter on |
| `from`? | `string` \| `Date` | Date or string representing the start member to filter from |
| `to`? | `string` \| `Date` | Date or string representing the end member to filter to |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for items in the Sample ECommerce data model where the date is from the years 2009, 2010, or 2011.
```ts
filterFactory.dateRange(DM.Commerce.Date.Years, '2009-01', '2011-01')
```
