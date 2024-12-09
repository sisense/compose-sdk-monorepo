---
title: members
---

# Function members

> **members**(
  `attribute`,
  `members`,
  `config`?): [`Filter`](../../../interfaces/interface.Filter.md)

Creates a filter to isolate attribute values that match any of the specified strings.

Matching is case sensitive.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Attribute to filter on |
| `members` | `string`[] | Array of member values to filter by |
| `config`? | [`MembersFilterConfig`](../../../interfaces/interface.MembersFilterConfig.md) | Optional configuration for the filter |

## Returns

[`Filter`](../../../interfaces/interface.Filter.md)

A filter instance

## Example

Filter for items where the condition is 'Used' or 'Refurbished'
from the Sample ECommerce data model.
```ts
filterFactory.members(DM.Commerce.Condition, ['Used', 'Refurbished'])
```
