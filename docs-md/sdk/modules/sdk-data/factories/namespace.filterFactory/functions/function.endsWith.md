---
title: endsWith
---

# Function endsWith

> **endsWith**(`attribute`, `value`): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate attribute values that end with a specified string.

Matching is case insensitive.

You can optionally use wildcard characters for pattern matching, as described in the
[`like()`](function.like.md) function.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Text attribute to filter on |
| `value` | `string` | Value to filter by |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for countries in the Sample ECommerce data model where the country name ends with
'land'. This filter matches countries like 'Ireland' and 'Iceland'.
```ts
filterFactory.endsWith(DM.Country.Country, 'land')
```
