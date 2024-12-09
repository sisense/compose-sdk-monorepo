---
title: equals
---

# Function equals

> **equals**(
  `attribute`,
  `value`,
  `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate attribute values that equal a specified string or number.

When filtering against a string:

 + Matching is case insensitive.
 + You can optionally use wildcard characters for pattern matching, as described in the
[`like()`](function.like.md) function.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Text or numeric attribute to filter on |
| `value` | `number` \| `string` | Value to filter by |
| `config`? | [`BaseFilterConfig`](../../../interfaces/interface.BaseFilterConfig.md) | Optional configuration for the filter |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for items in new condition from the Sample ECommerce data model.
```ts
filterFactory.equals(DM.Commerce.Condition, 'New')
```
