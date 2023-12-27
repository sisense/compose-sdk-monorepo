---
title: bottomRanking
---

# Function bottomRanking

> **bottomRanking**(
  `attribute`,
  `measure`,
  `count`): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter representing a bottom ranking logic.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Attribute to filter |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to filter by |
| `count` | `number` | Number of members to return |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter representing a bottom ranking logic on the given attribute by the given measure
