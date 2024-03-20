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

Creates a calculated measure that calculates the rank of a value in a list of values.

This function includes options that allow you do customize the ranking order and how to handle
equally ranked items.

The order options are:
+ `'DESC'` (default): Descending, meaning the largest number is ranked first.
+ `'ASC'`: Ascending, meaning the smallest number is ranked first.

The rank type options are:
+ `'1224'`: Standard competition, meaning items that rank equally receive the same ranking number,
  and then a gap is left after the equally ranked items in the ranking numbers.
+ `'1334'`: Modified competition ranking, meaning items that rank equally receive the same ranking number,
  and a gap is left before the equally ranked items in the ranking numbers.
+ `'1223'`: Dense ranking, meaning items that rank equally receive the same ranking number,
  and the next items receive the immediately following ranking number.
+ `'1234'`: Ordinal ranking, meaning all items receive distinct ordinal numbers,
  including items that rank equally. The assignment of distinct ordinal numbers for equal-ranking items is arbitrary.

## Parameters

| Parameter | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `measure` | [`Measure`](../../../interfaces/interface.Measure.md) | `undefined` | Measure to apply the ranking logic to |
| `name`? | `string` | `undefined` | Name for the new measure |
| `sort`? | `string` | `RankingSortTypes.Descending` | Sorting for ranking. By default sort order is descending, where the largest number is ranked first. |
| `rankType`? | `string` | `RankingTypes.StandardCompetition` | How to handle equally ranked items. By default the type is standard competition ranking. |
| `groupBy`? | [`Attribute`](../../../interfaces/interface.Attribute.md)[] | `[]` | Rank partition attributes |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A calculated measure instance

## Example

Calculate the rank of the total cost per category, sorted with the smallest cost ranked first,
and ranking ties are handled using the ordinal ranking type from the Sample Ecommerce data model.
```ts
measureFactory.rank(
  measureFactory.sum(DM.Commerce.Cost),
  'Cost Rank',
  measureFactory.RankingSortTypes.Ascending,
  measureFactory.RankingTypes.Ordinal
)
```

Ranking values from the Sample Ecommerce data model when categorizing by age range using the above ranking.
| AgeRange | Cost | Cost Rank |
| --- | --- | --- |
| 0-18 | 4.32M | 1 |
| 19-24 | 8.66M | 2 |
| 25-34 | 21.19M | 6 |
| 35-44 | 23.64M | 7 |
| 45-54 | 20.39M | 5 |
| 55-64 | 11.82M | 3 |
| 65+ | 17.26M | 4 |
