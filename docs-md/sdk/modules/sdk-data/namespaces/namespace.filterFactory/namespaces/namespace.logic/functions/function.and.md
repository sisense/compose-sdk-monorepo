---
title: and
---

# Function and

> **and**(`left`, `right`): [`FilterRelation`](../../../../../interfaces/interface.FilterRelation.md)

Creates an 'AND' filter relation

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `left` | [`FilterRelationNode`](../../../../../type-aliases/type-alias.FilterRelationNode.md) | First filter or filter relation |
| `right` | [`FilterRelationNode`](../../../../../type-aliases/type-alias.FilterRelationNode.md) | Second filter or filter relation |

## Returns

[`FilterRelation`](../../../../../interfaces/interface.FilterRelation.md)

A filter relation

## Example

Create a filter relation for items that have a revenue greater than 100 and are in new condition
in the Sample ECommerce data model.
```ts
const revenueFilter = filterFactory.greaterThan(DM.Commerce.Revenue, 100);
const conditionFilter = filterFactory.equals(DM.Commerce.Condition, 'New');

const andFilerRelation = filterFactory.logic.and(revenueFilter, conditionFilter);
```
