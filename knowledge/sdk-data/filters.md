---
type: Module
title: Filters & filterFactory
description: Filter class hierarchy, the filterFactory functions that create filters with compose code, and filter config/matching utilities.
resource: packages/sdk-data/src/dimensional-model/filters
tags: [sdk-data, module, filters]
---

# Purpose

Defines every concrete `Filter` implementation (JAQL-emitting classes) and the public `filterFactory` API that constructs them with `composeCode` attached. Reach for `filterFactory` to create filters; reach for the classes/type guards only when inspecting or translating existing filters.

# Entry point

| What         | Where                                                                                                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Export       | `filterFactory` (namespace) — packages/sdk-data/src/index.ts:58                                                                                                                       |
| Export       | filter classes + guards (`export *`) — packages/sdk-data/src/index.ts:16                                                                                                              |
| Class        | `AbstractFilter` (base, internal) — packages/sdk-data/src/dimensional-model/filters/filters.ts:118                                                                                    |
| Class        | `MembersFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:306                                                                                                      |
| Class        | `NumericFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:834                                                                                                      |
| Class        | `TextFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:863                                                                                                         |
| Class        | `DateRangeFilter` / `RelativeDateFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:956 / :1028                                                                     |
| Class        | `MeasureFilter`, `RankingFilter`, `MeasureRankingFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:621, :692, :755                                                 |
| Class        | `LogicalAttributeFilter`, `ExcludeFilter`, `CascadingFilter`, `EmptyFilter`, `CustomFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:252, :455, :389, :896, :1127 |
| Function     | `createFilter(json)` — deserializes filter JSON — packages/sdk-data/src/dimensional-model/filters/filters.ts:1299                                                                     |
| Guards       | `isMembersFilter` etc. (per class, via `__serializable`) — packages/sdk-data/src/dimensional-model/filters/filters.ts:1174-1293                                                       |
| Function     | `getDefaultBaseFilterConfig` / `getDefaultMembersFilterConfig` — packages/sdk-data/src/dimensional-model/filters/filter-config-utils.ts:16 / :27                                      |
| Function     | `simplifyFilterConfig` (drops default-valued keys) — packages/sdk-data/src/dimensional-model/filters/filter-config-utils.ts:54                                                        |
| Function     | `createFilterMatcher` — packages/sdk-data/src/dimensional-model/filters/utils/filter-matcher-utils.ts:214 (barrel: packages/sdk-data/src/index.ts:17)                                 |
| Function     | `isIncludeAllMembersFilter` — packages/sdk-data/src/dimensional-model/filters/utils/is-include-all-members-filter.ts:15 (barrel: packages/sdk-data/src/index.ts:18)                   |
| Transformers | `withAddedFilter(s)`, `withoutFilter(s)`, `withReplacedFilter`, `findFilter` — packages/sdk-data/src/dimensional-model/filters/helpers.ts:32, :66, :100, :136, :181, :210             |
| Transformers | formula-filter helpers (`withAddedFormulaFilter`, `withoutFormulaFilter`, …) — packages/sdk-data/src/dimensional-model/filters/formula-filter-helpers.ts:352, :556                    |

# Contract

`filterFactory` (packages/sdk-data/src/dimensional-model/filters/factory.ts) groups by category — see the file for the full list:

| Category                | Representative functions                                                                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Members                 | `members` (:622)                                                                                                                                                                            |
| Text                    | `contains`, `startsWith`, `equals`, `like`, `isEmpty` (:149-:433)                                                                                                                           |
| Numeric                 | `greaterThan`, `lessThan`, `between`, `numeric` (:436-:620)                                                                                                                                 |
| Date / relative date    | `dateRange` (:722), `dateRelative` (:764), `thisYear`/`today` (:844-:915)                                                                                                                   |
| Measure-based / ranking | `measureEquals` … `measureBetween` (:973-:1224), `topRanking` (:1226), `measureTopRanking` (:1335)                                                                                          |
| Logic & structure       | `union` (:65), `intersection` (:90), `exclude` (:122), `cascading` (:1448), `logic.and`/`logic.or` (:1520/:1547 — return `FilterRelations`, not `Filter`), `customFilter` (:1569, internal) |

Every class carries a discriminator used by all type guards (never rely on `instanceof` across package boundaries):

```ts
readonly __serializable: string = 'MembersFilter'; // filters.ts:310, one per class
```

Config types (packages/sdk-data/src/dimensional-model/interfaces.ts): `BaseFilterConfig` (:457, `guid?`, `disabled?`, `locked?`, `originalFilterJaql?`), `MembersFilterConfig` (:508, adds `excludeMembers?`, `enableMultiSelection?`, `deactivatedMembers?`, `backgroundFilter?`), and `FilterConfig` (:559):

```ts
export type FilterConfig = CompleteBaseFilterConfig | CompleteMembersFilterConfig;
```

Defaults merged into every filter (filter-config-utils.ts:16-32): `guid: guidFast(13)`, `disabled: false`, `locked: false`; members adds `excludeMembers: false`, `enableMultiSelection: true`, `deactivatedMembers: []`.

# How it connects

- Every factory function is wrapped with `withComposeCodeForFilter` / `withComposeCodeForFilterRelations` from [compose-code](./compose-code.md), which stamps `composeCode` on the returned filter (factory.ts:65-69 shows the pattern).
- Filters extend `DimensionalElement` ([core-elements](./core-elements.md)); `jaql()` (filters.ts:194) emits `panel: 'scope'` JAQL that sdk-query-client sends to the server; `name` is a hash of the JAQL (filters.ts:153).
- `logic.and`/`logic.or` produce the [filter-relations](./filter-relations.md) tree; `helpers.ts` transformers accept `Filter[] | FilterRelations` and delegate to relation-aware utilities.
- `createFilterMatcher` builds a client-side predicate from `FilterJaql` (members/exclude/text/numeric) — used by pivot highlight matching in sdk-ui; `isIncludeAllMembersFilter` lets query layers drop no-op members filters.
- `formula-filter-helpers.ts` transforms filters embedded in calculated-measure contexts ([measures](./measures.md)); matching resolves through `getAttributeCompareId` so attribute- and instance-targeting agree.

# Invariants and traps

1. Filter identity for equality/relations is `config.guid`; two filters built from the same args get different guids. Regenerate a filter (new guid) only when you intend the relations diff to see add/remove.
2. Type-check filters with the `is*Filter` guards (`__serializable`), never `instanceof` — instances may cross bundle copies of sdk-data.
3. `MembersFilter` throws `errors.filter.membersFilterNullMember` on `null`/`undefined` members (filters.ts:325); `AbstractFilter.checkAttributeSupport` rejects sub-day granularities (Hours/Minutes/Seconds, filters.ts:231).
4. `config.disabled` makes `jaql()` return an empty filter (`{ jaql: { filter: {} } }`, filters.ts:244) — the filter still exists in the list but constrains nothing.
5. `DateRangeFilter` strips clock time from bounds for period granularities (`DateLevels.dateOnly`, filters.ts:988) — `Date` inputs become date-only strings; do not expect the original ISO datetime back.
6. Constructors merge configs into a fresh object (filters.ts:150, :333) — never mutate `config` in place expecting sharing; `CascadingFilter.filters` reapplies root `disabled`/`locked` onto level filters on every read (filters.ts:406).
7. Formula-filter transformers rebuild the measure and deliberately drop its `composeCode` (formula-filter-helpers.ts:117) because the old code would regenerate the pre-transform measure.

# Related

- [Filter relations](./filter-relations.md) - AND/OR tree these filters plug into
- [Compose code round-trip](./compose-code.md) - how `composeCode` gets stamped and parsed back
- [Measures](./measures.md) - measure-based filters and formula-filter contexts
- [Core elements](./core-elements.md) - `DimensionalElement` base and serialization
