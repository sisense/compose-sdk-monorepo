---
title: dateTo
---

# Function dateTo

> **dateTo**(
  `level`,
  `to`,
  `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate items up until and including the given date and level.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `level` | [`LevelAttribute`](../../../interfaces/interface.LevelAttribute.md) | Date [LevelAttribute](../../../interfaces/interface.LevelAttribute.md) to filter on |
| `to` | `Date` \| `string` | Date or string representing the last member to filter to |
| `config`? | [`BaseFilterConfig`](../../../interfaces/interface.BaseFilterConfig.md) | Optional configuration for the filter |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for items where the date is from the year 2010 or earlier in the Sample ECommerce data model.
```ts
filterFactory.dateTo(DM.Commerce.Date.Years, '2010-01')
```
