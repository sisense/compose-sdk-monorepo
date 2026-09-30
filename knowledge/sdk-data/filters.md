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

| What         | Where                                                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Export       | `filterFactory` (namespace) — packages/sdk-data/src/index.ts:58                                                                                                           |
| Export       | filter classes + guards (`export *`) — packages/sdk-data/src/index.ts:16                                                                                                  |
| Class        | `AbstractFilter` (base, internal) — packages/sdk-data/src/dimensional-model/filters/filters.ts:120                                                                        |
| Class        | `MembersFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:308                                                                                          |
| Class        | `NumericFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:845                                                                                          |
| Class        | `TextFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:874                                                                                             |
| Class        | `DateRangeFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:994                                                                                        |
| Class        | `RelativeDateFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:1082                                                                                    |
| Class        | `MeasureFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:623                                                                                          |
| Class        | `RankingFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:703                                                                                          |
| Class        | `MeasureRankingFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:766                                                                                   |
| Class        | `LogicalAttributeFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:254                                                                                 |
| Class        | `ExcludeFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:457                                                                                          |
| Class        | `CascadingFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:391                                                                                        |
| Class        | `EmptyFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:907                                                                                            |
| Class        | `CustomFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:1181                                                                                          |
| Function     | `createFilter(json)` — deserializes filter JSON — packages/sdk-data/src/dimensional-model/filters/filters.ts:1353                                                         |
| Guards       | `isMembersFilter` etc. (per class, via `__serializable`) — packages/sdk-data/src/dimensional-model/filters/filters.ts:1228-1345                                           |
| Function     | `toLocalIsoDateTime` (measure-filter date bounds) — packages/sdk-data/src/dimensional-model/filters/filters.ts:967                                                        |
| Function     | `getDefaultBaseFilterConfig` / `getDefaultMembersFilterConfig` — packages/sdk-data/src/dimensional-model/filters/filter-config-utils.ts:16 / :27                          |
| Function     | `simplifyFilterConfig` (drops default-valued keys) — packages/sdk-data/src/dimensional-model/filters/filter-config-utils.ts:54                                            |
| Function     | `createFilterMatcher` — packages/sdk-data/src/dimensional-model/filters/utils/filter-matcher-utils.ts:214 (barrel: packages/sdk-data/src/index.ts:17)                     |
| Function     | `isIncludeAllMembersFilter` — packages/sdk-data/src/dimensional-model/filters/utils/is-include-all-members-filter.ts:15 (barrel: packages/sdk-data/src/index.ts:18)       |
| Transformers | `withAddedFilter(s)`, `withoutFilter(s)`, `withReplacedFilter`, `findFilter` — packages/sdk-data/src/dimensional-model/filters/helpers.ts:32, :66, :100, :136, :181, :210 |
| Transformers | formula-filter helpers (`withAddedFormulaFilter`, `withoutFormulaFilter`, …) — packages/sdk-data/src/dimensional-model/filters/formula-filter-helpers.ts:352, :556        |

# Contract

`filterFactory` (packages/sdk-data/src/dimensional-model/filters/factory.ts) groups by category — see the file for the full list:

| Category                | Representative functions                                                                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Members                 | `members` (:623) |
| Text                    | `contains`, `startsWith`, `equals`, `like`, `isEmpty` (:237-:400) |
| Numeric                 | `greaterThan`, `lessThan`, `between`, `numeric` (:437-:593) |
| Date / relative date    | `dateRange` (:785), `dateRelative` (:827), `thisYear`/`today` (:907-:961) |
| Measure-based / ranking | `measureEquals` … `measureBetweenNotEqual` (:1085-:1361), `topRanking` (:1400), `measureTopRanking` (:1509) |
| Logic & structure       | `union` (:66), `intersection` (:91), `exclude` (:123), `cascading` (:1622), `logic.and`/`logic.or` (:1694/:1721 — return `FilterRelations`, not `Filter`), `customFilter` (:1743, internal) |

Every class carries a discriminator used by all type guards (never rely on `instanceof` across package boundaries):

```ts
readonly __serializable: string = 'MembersFilter'; // filters.ts:312, one per class
```

Config types (packages/sdk-data/src/dimensional-model/interfaces.ts): `BaseFilterConfig` (:457, `guid?`, `disabled?`, `locked?`, `originalFilterJaql?`), `MembersFilterConfig` (:508, adds `excludeMembers?`, `enableMultiSelection?`, `deactivatedMembers?`, `backgroundFilter?`), and `FilterConfig` (:559):

```ts
export type FilterConfig = CompleteBaseFilterConfig | CompleteMembersFilterConfig;
```

Defaults merged into every filter (filter-config-utils.ts:16-32): `guid: guidFast(13)`, `disabled: false`, `locked: false`; members adds `excludeMembers: false`, `enableMultiSelection: true`, `deactivatedMembers: []`.

# How it connects

- Every factory function is wrapped with `withComposeCodeForFilter` / `withComposeCodeForFilterRelations` from [compose-code](./compose-code.md), which stamps `composeCode` on the returned filter (factory.ts:65-69 shows the pattern).
- Filters extend `DimensionalElement` ([core-elements](./core-elements.md)); `jaql()` (filters.ts:196) emits `panel: 'scope'` JAQL that sdk-query-client sends to the server; `name` is a hash of the JAQL (filters.ts:155).
- `logic.and`/`logic.or` produce the [filter-relations](./filter-relations.md) tree; `helpers.ts` transformers accept `Filter[] | FilterRelations` and delegate to relation-aware utilities.
- `createFilterMatcher` builds a client-side predicate from `FilterJaql` (members/exclude/text/numeric) — used by pivot highlight matching in sdk-ui; `isIncludeAllMembersFilter` lets query layers drop no-op members filters.
- `formula-filter-helpers.ts` transforms filters embedded in calculated-measure contexts ([measures](./measures.md)); matching resolves through `getAttributeCompareId` so attribute- and instance-targeting agree.

# Invariants and traps

1. Filter identity for equality/relations is `config.guid`; two filters built from the same args get different guids. Regenerate a filter (new guid) only when you intend the relations diff to see add/remove.
2. Type-check filters with the `is*Filter` guards (`__serializable`), never `instanceof` — instances may cross bundle copies of sdk-data.
3. `MembersFilter` throws `errors.filter.membersFilterNullMember` on `null`/`undefined` members (filters.ts:328); `AbstractFilter.checkAttributeSupport` rejects sub-day granularities (Hours/Minutes/Seconds, filters.ts:233).
4. `config.disabled` makes `jaql()` return an empty filter (`{ jaql: { filter: {} } }`, filters.ts:246) — the filter still exists in the list but constrains nothing.
5. `DateRangeFilter` strips clock time from bounds for period granularities (`DateLevels.dateOnly`, filters.ts:1030) — `Date` inputs become date-only strings; do not expect the original ISO datetime back.
6. Constructors merge configs into a fresh object (filters.ts:152, :335) — never mutate `config` in place expecting sharing; `CascadingFilter.filters` reapplies root `disabled`/`locked` onto level filters on every read (filters.ts:408).
7. `MeasureFilter` converts a `Date` bound in its constructor, via `toLocalIsoDateTime` (filters.ts:967), so a `Date` in is a `yyyy-MM-ddTHH:mm:ss` string out - read back `valueA`/`valueB` as strings. It reads the `Date`'s local calendar getters (`getFullYear`, `getMonth`, `getDate`) on purpose: `toISOString` would append `Z` and the server would read the bound in UTC and shift the day. It throws `errors.filter.invalidDateValue` on an invalid `Date` rather than serializing `NaN` onto the wire, the way `toISOString` throws. `DateRangeFilter` keeps its own `toISOString` path, so the two date serializers in this file are not interchangeable.
8. Formula-filter transformers rebuild the measure and deliberately drop its `composeCode` (formula-filter-helpers.ts:117) because the old code would regenerate the pre-transform measure.
9. A measure filter takes the attribute it filters on from the measure, resolved by `findMeasureAttribute` (factory.ts:977): a measure or filter operand wins at any depth, and a bare attribute operand is the last resort, also at any depth. A calculated ATTRIBUTE is an attribute candidate, never a container to descend into, although it carries a context of its own. The fallback exists because Fusion writes a date measure as a formula over a bare attribute, with no measure to unwrap. The search reports which of the two it found, so a nested formula holding only a bare attribute cannot end the search while a real measure operand sits later in the outer context - that built the filter on the wrong dimension.

# Related

- [Filter relations](./filter-relations.md) - AND/OR tree these filters plug into
- [Compose code round-trip](./compose-code.md) - how `composeCode` gets stamped and parsed back
- [Measures](./measures.md) - measure-based filters and formula-filter contexts
- [Core elements](./core-elements.md) - `DimensionalElement` base and serialization
