---
title: findFilter
---

# Function findFilter

> **findFilter**(`filters`, `searchFn`): [`Filter`](../interfaces/interface.Filter.md) \| `undefined`

Finds a filter in an array of filters or filter relations.
Returns the first filter that satisfies the provided search function.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `filters` | [`FilterRelations`](../interfaces/interface.FilterRelations.md) \| [`Filter`](../interfaces/interface.Filter.md)[] \| `undefined` | An array of filters or filter relations to search. |
| `searchFn` | (`filter`) => `boolean` | A function that takes a filter and returns a boolean indicating whether the filter satisfies the search criteria. |

## Returns

[`Filter`](../interfaces/interface.Filter.md) \| `undefined`

The first filter that satisfies the search function, or `undefined` if no filter is found.
