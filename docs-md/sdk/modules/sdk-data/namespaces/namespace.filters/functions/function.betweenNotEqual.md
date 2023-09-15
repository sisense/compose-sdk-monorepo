---
title: betweenNotEqual
---

# Function betweenNotEqual

> **betweenNotEqual**(
  `attribute`,
  `valueA`,
  `valueB`): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a "between, but not equal" filter.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Numeric attribute to filter |
| `valueA` | `number` | Value to filter from |
| `valueB` | `number` | Value to filter to |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A numeric filter of the given attribute
