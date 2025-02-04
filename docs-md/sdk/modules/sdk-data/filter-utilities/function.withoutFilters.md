---
title: withoutFilters
---

# Function withoutFilters

> **withoutFilters**(`filtersToRemove`): (`filters`) => [`FilterRelations`](../interfaces/interface.FilterRelations.md) \| [`Filter`](../interfaces/interface.Filter.md)[]

Returns a function that removes multiple filters from existing filters or filter relations.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `filtersToRemove` | [`Filter`](../interfaces/interface.Filter.md)[] | An array of filters to remove. |

## Returns

A function that takes existing filters or filter relations and returns updated filters or filter relations without the specified filters.

> > (`filters`): [`FilterRelations`](../interfaces/interface.FilterRelations.md) \| [`Filter`](../interfaces/interface.Filter.md)[]
>
> ### Parameters
>
>
> | Parameter | Type |
> | :------ | :------ |
> | `filters` | [`FilterRelations`](../interfaces/interface.FilterRelations.md) \| [`Filter`](../interfaces/interface.Filter.md)[] \| `undefined` |
>
>
> ### Returns
>
> [`FilterRelations`](../interfaces/interface.FilterRelations.md) \| [`Filter`](../interfaces/interface.Filter.md)[]
>
>

## Example

```ts
// Using with an array of filters
const originalFilters = [filterByAgeRange, filterByRevenue, filterByCost];
const updatedFilters = withRemovedFilters([filterByRevenue, filterByCost])(originalFilters);
// [filterByAgeRange]

// Using with filter relations
const originalFilterRelations = filterFactory.logic.or(filterByAgeRange, filterByRevenue);
const updatedFiltersRelations = withRemovedFilters([filterByRevenue])(originalFilterRelations);
// filterByAgeRange
```
