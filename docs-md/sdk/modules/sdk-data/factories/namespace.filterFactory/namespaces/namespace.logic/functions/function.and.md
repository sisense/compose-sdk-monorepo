---
title: and
---

# Function and <Badge type="beta" text="Beta" />

> **and**(`left`, `right`): [`FilterRelations`](../../../../../interfaces/interface.FilterRelations.md)

Creates an 'AND' filter relations

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `left` | [`FilterRelationsNode`](../../../../../type-aliases/type-alias.FilterRelationsNode.md) | First filter or filter relations |
| `right` | [`FilterRelationsNode`](../../../../../type-aliases/type-alias.FilterRelationsNode.md) | Second filter or filter relations |

## Returns

[`FilterRelations`](../../../../../interfaces/interface.FilterRelations.md)

Filter relations

## Example

Create filter relations for items that have a revenue greater than 100 and are in new condition
in the Sample ECommerce data model.
```ts
const revenueFilter = filterFactory.greaterThan(DM.Commerce.Revenue, 100);
const conditionFilter = filterFactory.equals(DM.Commerce.Condition, 'New');

const andFilerRelation = filterFactory.logic.and(revenueFilter, conditionFilter);
```
