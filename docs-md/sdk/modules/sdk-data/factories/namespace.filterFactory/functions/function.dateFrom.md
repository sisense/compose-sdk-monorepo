---
title: dateFrom
---

# Function dateFrom

> **dateFrom**(`level`, `from`): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate date values starting from and including the given date and level.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `level` | [`LevelAttribute`](../../../interfaces/interface.LevelAttribute.md) | Date [LevelAttribute](../../../interfaces/interface.LevelAttribute.md) to filter on |
| `from` | `Date` \| `string` | Date or string representing the value to filter from |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for items in the Sample ECommerce data model where the date is not before the year 2010.
```ts
filterFactory.dateFrom(DM.Commerce.Date.Years, '2010-01')
```
