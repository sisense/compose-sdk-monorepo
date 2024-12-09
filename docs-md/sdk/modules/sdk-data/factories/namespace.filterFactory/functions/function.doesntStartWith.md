---
title: doesntStartWith
---

# Function doesntStartWith

> **doesntStartWith**(
  `attribute`,
  `value`,
  `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate attribute values that do not start with a specified string.

Matching is case insensitive.

You can optionally use wildcard characters for pattern matching, as described in the
[`like()`](function.like.md) function.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Text attribute to filter on |
| `value` | `string` | Value to filter by |
| `config`? | [`BaseFilterConfig`](../../../interfaces/interface.BaseFilterConfig.md) | Optional configuration for the filter |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for countries in the Sample ECommerce data model where the country name doesn't start with
'United'. This filter matches countries not like 'United States' and 'United Kingdom'.
```ts
filterFactory.doesntStartWith(DM.Country.Country, 'United')
```
