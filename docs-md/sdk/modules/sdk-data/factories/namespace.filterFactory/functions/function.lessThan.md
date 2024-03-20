---
title: lessThan
---

# Function lessThan

> **lessThan**(`attribute`, `value`): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate attribute values strictly less than a specified number.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Numeric attribute to filter on |
| `value` | `number` | Value to filter by |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for items where the cost is less than 100 from the Sample ECommerce data model.
```ts
filterFactory.lessThan(DM.Commerce.Cost, 100)
```
