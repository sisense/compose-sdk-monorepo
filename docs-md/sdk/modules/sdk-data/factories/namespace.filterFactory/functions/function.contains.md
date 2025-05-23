---
title: contains
---

# Function contains

> **contains**(
  `attribute`,
  `value`,
  `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate attribute values that contain a specified string.

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

Filter for categories in the Sample ECommerce data model where the category name contains
'digital'. This filter matches categories like 'Digital Cameras' and 'MP3 & Digital Media Players'.
```ts
filterFactory.contains(DM.Category.Category, 'digital')
```
