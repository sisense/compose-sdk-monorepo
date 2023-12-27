---
title: dateTo
---

# Function dateTo

> **dateTo**(`level`, `to`): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter on all values ending at the given date of the given level.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `level` | [`LevelAttribute`](../../../interfaces/interface.LevelAttribute.md) | Date level attribute to filter. See [DateLevels](../../../variables/variable.DateLevels.md) for supported levels. |
| `to` | `string` \| `Date` | Date or String representing the last member to filter to |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance filtering all values ending at the given value
