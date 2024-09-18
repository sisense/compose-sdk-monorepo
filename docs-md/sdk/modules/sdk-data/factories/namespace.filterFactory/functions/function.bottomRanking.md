---
title: bottomRanking
---

# Function bottomRanking

> **bottomRanking**(
  `attribute`,
  `measure`,
  `count`): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate items that rank towards the bottom for a given measure.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Attribute to filter |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | Measure to filter by |
| `count` | `number` | Number of members to return |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for age ranges with the bottom 3 lowest total revenue in the Sample ECommerce data model.
```ts
filterFactory.bottomRanking(
  DM.Commerce.AgeRange,
  measureFactory.sum(DM.Commerce.Revenue),
  3
)
```
