---
title: doesntEqual
---

# Function doesntEqual

> **doesntEqual**(`attribute`, `value`): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate attribute values that do not equal a specified string or number.

When filtering against a string:

 + Matching is case insensitive.
 + You can optionally use wildcard characters for pattern matching, as described in the
[`like()`](function.like.md) function.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Text or numeric attribute to filter on |
| `value` | `string` \| `number` | Value to filter by |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for items not in new condition from the Sample ECommerce data model.
```ts
filterFactory.doesntEqual(DM.Commerce.Condition, 'New')
```
