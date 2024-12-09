---
title: union
---

# Function union

> **union**(`filters`, `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter representing the union of multiple filters on the same attribute. The resulting
union filter filters on items that match any of the given filters.

To create 'or' filters using different attributes, use the [`or()`](../namespaces/namespace.logic/functions/function.and.md) function.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `filters` | [`Filter`](../../../interfaces/interface.Filter.md)[] | Filters to union. The filters must all be on the same attribute. |
| `config`? | [`BaseFilterConfig`](../../../interfaces/interface.BaseFilterConfig.md) | Optional configuration for the filter |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for countries that start with the letter 'A' **or** end with the letter 'A'
in the Sample ECommerce data model.
```ts
filterFactory.union([
  filterFactory.startsWith(DM.Country.Country, 'A'),
  filterFactory.endsWith(DM.Country.Country, 'A'),
])
```
