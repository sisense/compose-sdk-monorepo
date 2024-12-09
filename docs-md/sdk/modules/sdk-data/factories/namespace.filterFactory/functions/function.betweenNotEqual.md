---
title: betweenNotEqual
---

# Function betweenNotEqual

> **betweenNotEqual**(
  `attribute`,
  `valueA`,
  `valueB`,
  `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter that isolates attribute values strictly within two specified numerical boundaries.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Numeric attribute to filter on |
| `valueA` | `number` | Value to filter from |
| `valueB` | `number` | Value to filter to |
| `config`? | [`BaseFilterConfig`](../../../interfaces/interface.BaseFilterConfig.md) | Optional configuration for the filter |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for items from the Sample ECommerce data model where the cost is greater than 100 and less than 200.
```ts
filterFactory.betweenNotEqual(DM.Commerce.Cost, 100, 200)
```
