---
title: rank
---

# Function rank

> **rank**(
  `measure`,
  `name`?,
  `sort`? = `RankingSortTypes.Descending`,
  `rankType`? = `RankingTypes.StandardCompetition`,
  `groupBy`? = `[]`): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Calculates the rank of a value in a list of values.

## Parameters

| Parameter | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | `undefined` | Measure to apply the Contribution logic to |
| `name`? | `string` | `undefined` | Name for the new measure |
| `sort`? | `string` | `RankingSortTypes.Descending` | By default sort order is descending. |
| `rankType`? | `string` | `RankingTypes.StandardCompetition` | By default the type is standard competition ranking `(“1224” ranking)`.<br />Supports also modified competition ranking `(“1334” ranking)`, dense ranking `(“1223” ranking)`,<br />and ordinal ranking `(“1234” ranking)`. |
| `groupBy`? | [`Attribute`](../../../interfaces/interface.Attribute.md)[] | `[]` | Rank partitions attributes |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A rank measure

## Example

```ts
`RANK(Total Cost, “ASC”, “1224”, Product, Years)`
will return the rank of the total annual cost per each product were sorted in ascending order.
```
