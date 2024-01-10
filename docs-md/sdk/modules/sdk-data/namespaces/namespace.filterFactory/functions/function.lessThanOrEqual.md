---
title: lessThanOrEqual
---

# Function lessThanOrEqual

> **lessThanOrEqual**(`attribute`, `value`): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate attribute values less than or equal to a specified number.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Numeric attribute to filter on |
| `value` | `number` | Value to filter by |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for items where the cost is less than or equal to 100 from the Sample ECommerce data model.
```ts
filterFactory.lessThanOrEqual(DM.Commerce.Cost, 100)
```
