---
title: measureTopRanking
---

# Function measureTopRanking

> **measureTopRanking**(
  `measure`,
  `count`,
  `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter that returns the top N values of the last dimension,
independently for each unique combination of all preceding dimensions.

This filter applies ranking within groups rather than globally. It shows the top N values
of the rightmost dimension for every unique combination of the other dimensions to its left.
The order of dimensions in your query determines the grouping behavior.

**Key Differences from [topRanking](function.topRanking.md):**
- `topRanking`: Filters a specific dimension globally (you specify which dimension)
- `measureTopRanking`: Always filters the last/rightmost dimension, grouped by all others

**How it works:**
- With 1 dimension: Returns the top N values of that dimension
- With 2+ dimensions: Returns the top N values of the LAST dimension for each combination of the others

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `measure` | [`BaseMeasure`](../../../interfaces/interface.BaseMeasure.md) | Base measure to rank by |
| `count` | `number` | Number of items to return per group (applies to the last dimension) |
| `config`? | [`BaseFilterConfig`](../../../interfaces/interface.BaseFilterConfig.md) | Optional configuration for the filter |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

**Example 1: Single dimension (equivalent to topRanking) - Query with one dimension [Category]**
```ts
// Returns top 5 Categories by total revenue
filterFactory.measureTopRanking(
  measureFactory.sum(DM.Commerce.Revenue),
  5
)
```
Result: 5 categories (e.g., Cell Phones, Computers, TVs, etc.)

This produces the same result as:
```ts
filterFactory.topRanking(
  DM.Commerce.Category,
  measureFactory.sum(DM.Commerce.Revenue),
  5
)
```

**Note:** With only one dimension, there are no groups to rank within,
so the behavior is identical to `topRanking`.

## Example

**Example 2: Two dimensions - Query with dimensions [Gender, Category]**
```ts
// Returns top 2 Categories for each Gender
filterFactory.measureTopRanking(
  measureFactory.sum(DM.Commerce.Revenue),
  2
)
```
Result: 3 genders × 2 categories each = 6 rows
- Male: Top 2 categories by revenue
- Female: Top 2 categories by revenue
- Unspecified: Top 2 categories by revenue

## Example

**Example 3: Three dimensions - Query with dimensions [Gender, Age Range, Category]**
```ts
// Returns top 2 Categories for each (Gender, Age Range) combination
filterFactory.measureTopRanking(
  measureFactory.sum(DM.Commerce.Revenue),
  2
)
```
Result: 3 genders × 7 age ranges × 2 categories per combination = ~42 rows
