---
title: dateFrom
---

# Function dateFrom

> **dateFrom**(`level`, `from`): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter on all values starting at the given date of the given level.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `level` | [`LevelAttribute`](../../../interfaces/interface.LevelAttribute.md) | Date level attribute to filter. See [DateLevels](../../../variables/variable.DateLevels.md) for supported levels. |
| `from` | `string` \| `Date` | Date or String representing the value to filter from |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance filtering all values starting at the given value
