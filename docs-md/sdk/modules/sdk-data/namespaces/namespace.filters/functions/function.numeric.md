---
title: numeric
---

# Function numeric

> **numeric**(
  `attribute`,
  `operatorA`?,
  `valueA`?,
  `operatorB`?,
  `valueB`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a custom numeric filter.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Numeric attribute to filter |
| `operatorA`? | `string` | First operator |
| `valueA`? | `number` | First value |
| `operatorB`? | `string` | Second operator |
| `valueB`? | `number` | Second value |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A custom numeric filter of the given attribute
