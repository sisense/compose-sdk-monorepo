---
title: FilterRelations
---

# Interface FilterRelations

Representation of filter logical relations (AND/OR)

Unlike FilterRelationsModel or FilterRelationsJaql,
this interface contains filter objects, not just id nodes

## Properties

### left

> **left**: [`FilterRelationsNode`](../type-aliases/type-alias.FilterRelationsNode.md)

***

### operator

> **operator**: `"AND"` \| `"OR"`

***

### right

> **right**: [`FilterRelationsNode`](../type-aliases/type-alias.FilterRelationsNode.md)
