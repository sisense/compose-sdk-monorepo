---
title: withAddedFilters
---

# Function withAddedFilters

> **withAddedFilters**(`filtersToAdd`): (`filters`) => [`FilterRelations`](../interfaces/interface.FilterRelations.md) \| [`Filter`](../interfaces/interface.Filter.md)[]

Returns a function that adds multiple filters to existing filters or filter relations.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `filtersToAdd` | [`Filter`](../interfaces/interface.Filter.md)[] | An array of filters to add. |

## Returns

A function that takes existing filters or filter relations and returns updated filters or filter relations with the new filters added.

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
const updatedFilters = withAddedFilters([filterByCost, filterByRevenue])(originalFilters);
// [filterByAgeRange, filterByCost, filterByRevenue]

// Using with filter relations
const originalFilterRelations = filterFactory.logic.or(filterByAgeRange, filterByRevenue);
const updatedFilterRelations = withAddedFilters([filterByCost, filterByRevenue])(originalFilterRelations);
// (filterByAgeRange OR filterByRevenue) AND filterByCost AND filterByRevenue
```
