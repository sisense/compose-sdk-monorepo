---
title: withAddedFilter
---

# Function withAddedFilter

> **withAddedFilter**(`filter`): (`filters`) => [`FilterRelations`](../interfaces/interface.FilterRelations.md) \| [`Filter`](../interfaces/interface.Filter.md)[]

Returns a function that adds a filter to existing filters or filter relations.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `filter` | [`Filter`](../interfaces/interface.Filter.md) | The filter to add. |

## Returns

A function that takes existing filters or filter relations and returns updated filters or filter relations with the new filter added.

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
const originalFilters = [filterByAgeRange];
const updatedFilters = withAddedFilter(filterByCost)(originalFilters);
// [filterByAgeRange, filterByCost]

// Using with filter relations
const originalFilterRelations = filterFactory.logic.or(filterByAgeRange, filterByRevenue);
const updatedFilterRelations = withAddedFilter(filterByCost)(originalFilterRelations);
// (filterByAgeRange OR filterByRevenue) AND filterByCost
```
