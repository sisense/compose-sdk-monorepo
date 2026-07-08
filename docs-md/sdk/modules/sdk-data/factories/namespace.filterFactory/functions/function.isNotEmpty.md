---
title: isNotEmpty
---

# Function isNotEmpty

> **isNotEmpty**(`attribute`, `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate attribute values that are not empty and not null.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Attribute to filter on |
| `config`? | [`BaseFilterConfig`](../../../interfaces/interface.BaseFilterConfig.md) | Optional configuration for the filter |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for items where the condition is not empty and not null from the Sample ECommerce data model.
```ts
filterFactory.isNotEmpty(DM.Commerce.Condition)
```
