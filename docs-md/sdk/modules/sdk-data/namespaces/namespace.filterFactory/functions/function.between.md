---
title: between
---

# Function between

> **between**(
  `attribute`,
  `valueA`,
  `valueB`): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate attribute values within or exactly matching two specified numerical boundaries.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Numeric attribute to filter on |
| `valueA` | `number` | Value to filter from |
| `valueB` | `number` | Value to filter to |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for items from the Sample ECommerce data model where the cost is greater than or equal to 100 and less than or equal to 200.
```ts
filterFactory.between(DM.Commerce.Cost, 100, 200)
```
