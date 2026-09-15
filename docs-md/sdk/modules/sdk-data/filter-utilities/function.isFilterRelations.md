---
title: isFilterRelations
---

# Function isFilterRelations

> **isFilterRelations**(`filters`): `filters is FilterRelations`

Type guard for checking if the provided filters are FilterRelations.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `filters` | [`FilterRelations`](../interfaces/interface.FilterRelations.md) \| [`Filter`](../interfaces/interface.Filter.md)[] \| `undefined` | The filters to check. |

## Returns

`filters is FilterRelations`

`true` if the filters are FilterRelations, `false` otherwise.

## Example

A dashboard's filters can come back as a flat array or, when the user has grouped filters
with AND/OR logic in Fusion, as a `FilterRelations` tree. Use `isFilterRelations` to branch
and flatten the tree into a plain list either way:

```ts
import { Filter, FilterRelations, filterFactory, isFilterRelations } from '@sisense/sdk-data';
import * as DM from './sample-ecommerce';

// A relations tree's `left`/`right` nodes can themselves be a Filter, a Filter[], or a
// nested FilterRelations, so walk it structurally rather than re-checking with the guard
// (whose signature only accepts the top-level `Filter[] | FilterRelations` shape).
function flattenNode(node: Filter | Filter[] | FilterRelations): Filter[] {
  if (Array.isArray(node)) {
    return node;
  }
  if ('operator' in node) {
    return [...flattenNode(node.left), ...flattenNode(node.right)];
  }
  return [node];
}

function flattenFilters(filters: Filter[] | FilterRelations): Filter[] {
  return isFilterRelations(filters) ? flattenNode(filters) : filters;
}

const dashboardFilters: FilterRelations = {
  operator: 'AND',
  left: filterFactory.members(DM.Commerce.Gender, ['Female']),
  right: {
    operator: 'OR',
    left: filterFactory.members(DM.Commerce.AgeRange, ['0-18']),
    right: filterFactory.members(DM.Commerce.AgeRange, ['19-24']),
  },
};

const allFilters = flattenFilters(dashboardFilters);
// [Gender filter, AgeRange 0-18 filter, AgeRange 19-24 filter]
```
