---
title: withoutFilter
---

# Function withoutFilter

> **withoutFilter**(`filterToRemove`): (`filters`) => [`FilterRelations`](../interfaces/interface.FilterRelations.md) \| [`Filter`](../interfaces/interface.Filter.md)[]

Returns a function that removes a filter from existing filters or filter relations.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `filterToRemove` | [`Filter`](../interfaces/interface.Filter.md) | The filter to remove. |

## Returns

A function that takes existing filters or filter relations and returns updated filters or filter relations without the specified filter.

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
const updatedFilters = withoutFilter(filterByCost)(originalFilters);
// [filterByAgeRange, filterByRevenue]

// Using with filter relations
const originalFilterRelations = filterFactory.logic.or(filterByAgeRange, filterByRevenue);
const updatedFiltersRelations = withoutFilter(filterByRevenue)(originalFilterRelations);
// filterByAgeRange
```
