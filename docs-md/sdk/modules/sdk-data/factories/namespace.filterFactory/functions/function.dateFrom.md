---
title: dateFrom
---

# Function dateFrom

> **dateFrom**(
  `level`,
  `from`,
  `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate date values starting from and including the given date and level.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `level` | [`LevelAttribute`](../../../interfaces/interface.LevelAttribute.md) | Date [LevelAttribute](../../../interfaces/interface.LevelAttribute.md) to filter on |
| `from` | `Date` \| `string` | `Date` or ISO-format string |
| `config`? | [`BaseFilterConfig`](../../../interfaces/interface.BaseFilterConfig.md) | Optional configuration for the filter |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Remarks

Pass a JavaScript `Date` or an ISO-format datetime string. On **`Years`–`Days`** levels, the time
part (from the first `T` onward) is stripped.

## Example

Filter for items in the Sample ECommerce data model where the date is not before the year 2010.
```ts
filterFactory.dateFrom(DM.Commerce.Date.Years, '2010-01-01')
// or
filterFactory.dateFrom(DM.Commerce.Date.Years, '2010-12-31')
```
With `Years` as date level, both are equivalent: the level uses the **calendar year** only, so month and day
inside that year do not change the filter.
