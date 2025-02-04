---
title: withReplacedFilter
---

# Function withReplacedFilter

> **withReplacedFilter**(`filterToReplace`, `newFilter`): (`filters`) => [`FilterRelations`](../interfaces/interface.FilterRelations.md) \| [`Filter`](../interfaces/interface.Filter.md)[]

Returns a function that replaces a filter with a new filter in existing filters or filter relations.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `filterToReplace` | [`Filter`](../interfaces/interface.Filter.md) | The filter to replace. |
| `newFilter` | [`Filter`](../interfaces/interface.Filter.md) | The new filter to use as a replacement. |

## Returns

A function that takes existing filters or filter relations and returns updated filters or filter relations with the filter replaced.

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
const originalFilters = [filterByAgeRange, filterByRevenue];
const updatedFilters = withReplacedFilter(filterByRevenue, filterByCost)(originalFilters);
// [filterByAgeRange, filterByCost]

// Using with filter relations
const originalFilterRelations = filterFactory.logic.or(filterByAgeRange, filterByRevenue);
const updatedFilterRelations = withReplacedFilter(filterByRevenue, filterByCost)(originalFilterRelations);
// (filterByAgeRange OR filterByCost)
```
