---
type: Module
title: Filter relations
description: AND/OR tree model over filters and the utilities that split, rebuild, diff, and convert it between CSDK, dashboard-model, and JAQL shapes.
resource: packages/sdk-data/src/dimensional-model/filters/filter-relations.ts
tags: [sdk-data, module, filter-relations]
---

# Purpose

Models logical AND/OR relationships between filters as a binary tree and provides all traversal, diffing, and format-conversion utilities. Reach for it whenever code accepts `Filter[] | FilterRelations` and must add/remove/replace filters without breaking the user's logical grouping.

# Entry point

| What     | Where                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Type     | `FilterRelations` — packages/sdk-data/src/dimensional-model/interfaces.ts:703                                                        |
| Type     | `FilterRelationsNode` — packages/sdk-data/src/dimensional-model/interfaces.ts:676                                                    |
| Types    | `FilterRelationsModel` / `FilterRelationsJaql` — packages/sdk-data/src/dimensional-model/interfaces.ts:720 / :732                    |
| Guard    | `isFilterRelations` — packages/sdk-data/src/dimensional-model/filters/filter-relations.ts:31                                         |
| Type     | `FilterRelationsRules` (guid-only internal tree) — packages/sdk-data/src/dimensional-model/filters/filter-relations.ts:48            |
| Function | `splitFiltersAndRelations` — packages/sdk-data/src/dimensional-model/filters/filter-relations.ts:104                                 |
| Function | `combineFiltersAndRelations` — packages/sdk-data/src/dimensional-model/filters/filter-relations.ts:158                               |
| Function | `getFiltersArray` — packages/sdk-data/src/dimensional-model/filters/filter-relations.ts:143                                          |
| Function | `calculateNewRelations` (diff-driven rebuild) — packages/sdk-data/src/dimensional-model/filters/filter-relations.ts:205              |
| Function | `mergeFiltersOrFilterRelations` — packages/sdk-data/src/dimensional-model/filters/filter-relations.ts:81                             |
| Function | `mergeFilters` (plain arrays, dedupe by compare id) — packages/sdk-data/src/dimensional-model/filters/filter-relations.ts:767        |
| Function | `getRelationsWithReplacedFilter` — packages/sdk-data/src/dimensional-model/filters/filter-relations.ts:253                           |
| Function | `getFilterCompareId` / `getAttributeCompareId` — packages/sdk-data/src/dimensional-model/filters/filter-relations.ts:746 / :733      |
| Function | `getFilterRelationsFromJaql` — packages/sdk-data/src/dimensional-model/filters/filter-relations.ts:797                               |
| Function | `convertFilterRelationsModelToRelationRules` — packages/sdk-data/src/dimensional-model/filters/filter-relations.ts:423               |
| Function | `filterRelationRulesToFilterRelationsModel` — packages/sdk-data/src/dimensional-model/filters/filter-relations.ts:569                |
| Function | `convertFilterRelationsModelToJaql` — packages/sdk-data/src/dimensional-model/filters/filter-relations.ts:849                        |
| Function | `parenthesizeNestedLogicalSubgroupsInFilterRelationsModel` — packages/sdk-data/src/dimensional-model/filters/filter-relations.ts:533 |

# Contract

Four tree shapes exist for the same logic; each conversion function names its source and target:

```ts
// Public: nodes are actual Filter objects (interfaces.ts:703)
export interface FilterRelations {
  left: FilterRelationsNode; // Filter | Filter[] | FilterRelations
  right: FilterRelationsNode;
  operator: 'AND' | 'OR';
  composeCode?: string;
}

// Internal working form: nodes reference filters by guid (filter-relations.ts:51-61)
export type FilterRelationsRule = {
  left: FilterRelationsRuleNode;
  right: FilterRelationsRuleNode;
  operator: 'AND' | 'OR';
};
export type FilterRelationsRuleIdNode = { instanceid: string };

// Dashboard-model form (interfaces.ts:720): typed AST nodes
// 'LogicalExpression' | 'Identifier' | 'ParenthesizedLogicalExpression' | 'CascadingIdentifier'

// Query (JAQL) form (interfaces.ts:732-743): { operator, left, right } with { instanceid } leaves
```

`isFilterRelations` (filter-relations.ts:31) is the runtime discriminator between `Filter[]` and `FilterRelations`: checks `operator === 'AND' | 'OR'` plus `left`/`right`.

# How it connects

- Built by `filterFactory.logic.and`/`or` ([filters](./filters.md), factory.ts:1520/:1547); `logic.and` flattens a `Filter[]` node into a right-leaning AND chain (factory.ts:1489).
- `helpers.ts` transformers (`withAddedFilter`, `withoutFilter`, `withReplacedFilter`) are the intended mutation API: they `splitFiltersAndRelations` → edit the flat array → `calculateNewRelations` → `combineFiltersAndRelations`.
- `combineFiltersAndRelations` reconstructs the tree by calling `filterFactory.logic.and/or` (filter-relations.ts:175), so rebuilt relations regain `composeCode`.
- sdk-ui consumes this heavily: dashboard-model reducers, widget-by-id utils, drilldown hooks, and packages/sdk-ui/src/shared/utils/filter-relations.ts; the dashboard-model ↔ rules converters bridge to persisted dashboard DTOs, `getFilterRelationsFromJaql` bridges from fetched query metadata.

# Invariants and traps

1. Tree leaves are matched to filters exclusively by `config.guid` (`instanceid`). Replacing a filter with a re-created one (new guid) without updating relations orphans the node — `combineFiltersAndRelations` then does `filters.find(...)!` (filter-relations.ts:172) and silently inserts `undefined`. Always go through `withReplacedFilter` or `calculateNewRelations`.
2. `calculateNewRelations` diffs by guid: an added filter is attached at the ROOT with `AND` (filter-relations.ts:361); a removed filter collapses its parent node. Pass `shouldReplaceSameAttributeFilters: true` to treat a same-attribute/new-guid filter as an in-place replace and preserve tree shape (:205); disabled filters are never replace-eligible (:312).
3. `splitFiltersAndRelations` deduplicates filters via a `Set` — a filter referenced from two leaves comes back once; relations keep both leaves.
4. Single-filter relations are trivial: `combineFiltersAndRelations` returns a plain `Filter[]` when rules are `null` or a lone id node (:162). Callers must keep accepting `Filter[] | FilterRelations` on the way out.
5. `getFilterRelationsFromJaql` bails out to plain `filters` when `highlights` are present (:807) because JAQL relations then reference highlight nodes too; it throws `errors.unknownFilterInFilterRelations` for an unknown guid (:820).
6. Cascading filters are ONE node in CSDK rules but expand to a `CascadingIdentifier` with per-level guids in the dashboard model (:448, :581); the model→rules direction throws if no cascading filter covers the level ids (:460).
7. `filterRelationRulesToFilterRelationsModel` always parenthesizes nested logical subtrees for the dashboard model (:610); `parenthesizeNestedLogicalSubgroupsInFilterRelationsModel` is idempotent.
8. Merging by attribute uses `getFilterCompareId` (expression + granularity, formula fallback) — `mergeFilters` overwrites a same-attribute filter in place rather than appending (:767); calculated-dimension filters derive identity from their formula (:712).

# Related

- [Filters & filterFactory](./filters.md) - the leaves of the tree and `logic.and`/`or` constructors
- [Compose code round-trip](./compose-code.md) - `composeCode` on rebuilt relations
- [Translation](./translation.md) - how relations reach outgoing JAQL
