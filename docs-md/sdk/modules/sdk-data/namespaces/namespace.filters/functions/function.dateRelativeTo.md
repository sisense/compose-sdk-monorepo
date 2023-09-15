---
title: dateRelativeTo
---

# Function dateRelativeTo

> **dateRelativeTo**(
  `level`,
  `offset`,
  `count`,
  `anchor`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a relative date filter to the given anchor date.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `level` | [`LevelAttribute`](../../../interfaces/interface.LevelAttribute.md) | Date level attribute to filter. See [DateLevels](../../../variables/variable.DateLevels.md) for supported levels. |
| `offset` | `number` | offset to skip from the given anchor, or Today if not provided |
| `count` | `number` | number of members to filter |
| `anchor`? | `string` \| `Date` | Anchor to filter from, Today is used if not provided |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A relative date filter
