---
title: dateRange
---

# Function dateRange

> **dateRange**(
  `level`,
  `from`?,
  `to`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a range filter between the given "from" and "to" arguments.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `level` | [`LevelAttribute`](../../../interfaces/interface.LevelAttribute.md) | Date level attribute to filter. See [DateLevels](../../../variables/variable.DateLevels.md) for supported levels. |
| `from`? | `string` \| `Date` | Date or String representing the start member to filter from |
| `to`? | `string` \| `Date` | Date or String representing the end member to filter to |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance filtering all values ending at the given value
