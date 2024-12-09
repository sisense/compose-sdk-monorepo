---
title: intersection
---

# Function intersection

> **intersection**(`filters`, `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter representing the intersection of multiple filters on the same attribute. The resulting
intersection filter filters on items that match all of the given filters.

To create 'and' filters using different attributes, use the [`and()`](../namespaces/namespace.logic/functions/function.and.md) function.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `filters` | [`Filter`](../../../interfaces/interface.Filter.md)[] | Filters to intersect. The filters must all be on the same attribute. |
| `config`? | [`BaseFilterConfig`](../../../interfaces/interface.BaseFilterConfig.md) | Optional configuration for the filter |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for countries that start with the letter 'A' **and** end with the letter 'A'
in the Sample ECommerce data model.
```ts
filterFactory.intersection([
  filterFactory.startsWith(DM.Country.Country, 'A'),
  filterFactory.endsWith(DM.Country.Country, 'A'),
])
```
