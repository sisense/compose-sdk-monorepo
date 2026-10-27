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
| Class        | `AbstractFilter` (base, internal) — packages/sdk-data/src/dimensional-model/filters/filters.ts:129                                                                        |
| Class        | `MembersFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:317                                                                                          |
| Class        | `NumericFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:904                                                                                          |
| Class        | `TextFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:933                                                                                             |
| Class        | `DateRangeFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:1053                                                                                        |
| Class        | `RelativeDateFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:1141                                                                                    |
| Class        | `MeasureFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:690                                                                                          |
| Class        | `RankingFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:766                                                                                          |
| Class        | `MeasureRankingFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:829                                                                                   |
| Class        | `LogicalAttributeFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:263                                                                                 |
| Class        | `ExcludeFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:467                                                                                          |
| Class        | `CascadingFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:401                                                                                        |
| Class        | `EmptyFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:966                                                                                            |
| Class        | `DateMeasureMembersFilter` (date measure members, extends `MembersFilter`) — packages/sdk-data/src/dimensional-model/filters/filters.ts:1378 |
| Class        | `DateMeasureRelativeFilter` (date measure relative period, extends `RelativeDateFilter`) — packages/sdk-data/src/dimensional-model/filters/filters.ts:1453 |
| Class        | `CustomFilter` — packages/sdk-data/src/dimensional-model/filters/filters.ts:1522                                                                                          |
| Function     | `createFilter(json)` — deserializes filter JSON — packages/sdk-data/src/dimensional-model/filters/filters.ts:1743                                                         |
| Guards       | `isMembersFilter` etc. (per class, via `__serializable`) — packages/sdk-data/src/dimensional-model/filters/filters.ts:1572-1715                                           |
| Function     | `toLocalIsoDateTime` (measure-filter date bounds) — packages/sdk-data/src/dimensional-model/filters/filters.ts:1026                                                        |
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
| Members                 | `members` (:625)                                                                                                                                                                            |
| Text                    | `contains`, `startsWith`, `equals`, `like`, `isEmpty` (:239-:402)                                                                                                                           |
| Numeric                 | `greaterThan`, `lessThan`, `between`, `numeric` (:439-:595)                                                                                                                                 |
| Date / relative date    | `dateRange` (:787), `dateRelative` (:829), `thisYear`/`today` (:909-:963)                                                                                                                   |
| Measure-based / ranking | `measureEquals` … `measureBetweenNotEqual` (:1087-:1363), `dateMeasureMembers` (:1413), `dateMeasureRelativeFrom`/`To` (:1449/:1495), `topRanking` (:1536), `measureTopRanking` (:1645)     |
| Logic & structure       | `union` (:68), `intersection` (:93), `exclude` (:125), `cascading` (:1791), `logic.and`/`logic.or` (:1863/:1890 — return `FilterRelations`, not `Filter`), `customFilter` (:1912, internal) |

Every class carries a discriminator used by all type guards (never rely on `instanceof` across package boundaries):

```ts
readonly __serializable: string = 'MembersFilter'; // filters.ts:321, one per class
```

Config types (packages/sdk-data/src/dimensional-model/interfaces.ts): `BaseFilterConfig` (:457, `guid?`, `disabled?`, `locked?`, `originalFilterJaql?`), `MembersFilterConfig` (:508, adds `excludeMembers?`, `enableMultiSelection?`, `deactivatedMembers?`, `backgroundFilter?`), and `FilterConfig` (:559):

```ts
export type FilterConfig = CompleteBaseFilterConfig | CompleteMembersFilterConfig;
```

Defaults merged into every filter (filter-config-utils.ts:16-32): `guid: guidFast(13)`, `disabled: false`, `locked: false`; members adds `excludeMembers: false`, `enableMultiSelection: true`, `deactivatedMembers: []`.

# How it connects

- Every factory function is wrapped with `withComposeCodeForFilter` / `withComposeCodeForFilterRelations` from [compose-code](./compose-code.md), which stamps `composeCode` on the returned filter (factory.ts:65-69 shows the pattern).
- Filters extend `DimensionalElement` ([core-elements](./core-elements.md)); `jaql()` (filters.ts:205) emits `panel: 'scope'` JAQL that sdk-query-client sends to the server; `name` is a hash of the JAQL (filters.ts:164).
- `logic.and`/`logic.or` produce the [filter-relations](./filter-relations.md) tree; `helpers.ts` transformers accept `Filter[] | FilterRelations` and delegate to relation-aware utilities.
- `createFilterMatcher` builds a client-side predicate from `FilterJaql` (members/exclude/text/numeric) — used by pivot highlight matching in sdk-ui; `isIncludeAllMembersFilter` lets query layers drop no-op members filters.
- `formula-filter-helpers.ts` transforms filters embedded in calculated-measure contexts ([measures](./measures.md)); matching resolves through `getAttributeCompareId` so attribute- and instance-targeting agree.

# Invariants and traps

1. Filter identity for equality/relations is `config.guid`; two filters built from the same args get different guids. Regenerate a filter (new guid) only when you intend the relations diff to see add/remove.
2. Type-check filters with the `is*Filter` guards (`__serializable`), never `instanceof` — instances may cross bundle copies of sdk-data.
3. `MembersFilter` throws `errors.filter.membersFilterNullMember` on `null`/`undefined` members (filters.ts:338); `AbstractFilter.checkAttributeSupport` rejects sub-day granularities (Hours/Minutes/Seconds, filters.ts:242).
4. `config.disabled` makes `jaql()` return an empty filter, `{ jaql: { filter: {} } }`, through `disabledJaql()` (filters.ts:255) — the filter still exists in the list but constrains nothing.
5. `DateRangeFilter` strips clock time from bounds for period granularities (`DateLevels.dateOnly`, filters.ts:1090) — `Date` inputs become date-only strings; do not expect the original ISO datetime back.
6. Constructors merge configs into a fresh object (filters.ts:161, :345) — never mutate `config` in place expecting sharing; `CascadingFilter.filters` reapplies root `disabled`/`locked` onto level filters on every read (filters.ts:418).
7. `MeasureFilter` converts a `Date` bound in its constructor, via `toLocalIsoDateTime` (filters.ts:1026), so a `Date` in is a `yyyy-MM-ddTHH:mm:ss` string out - read back `valueA`/`valueB` as strings. It reads the `Date`'s local calendar getters (`getFullYear`, `getMonth`, `getDate`) on purpose: `toISOString` would append `Z` and the server would read the bound in UTC and shift the day. It throws `errors.filter.invalidDateValue` on an invalid `Date` rather than serializing `NaN` onto the wire, the way `toISOString` throws. `DateRangeFilter` keeps its own `toISOString` path, so the two date serializers in this file are not interchangeable.
8. Formula-filter transformers rebuild the measure and deliberately drop its `composeCode` (formula-filter-helpers.ts:117) because the old code would regenerate the pre-transform measure.
9. A measure filter takes the attribute it filters on from the measure, resolved by `findMeasureAttribute` (factory.ts:979): a measure or filter operand wins at any depth, and a bare attribute operand is the last resort, also at any depth. The fallback exists because Fusion writes a date measure as a formula over a bare attribute, with no measure to unwrap. The search reports which of the two it found, so a nested formula holding only a bare attribute cannot end the search while a real measure operand sits later in the outer context - that built the filter on the wrong dimension.
10. A measure members or relative-period filter matches at the level given to the builder, which is NOT the level inside the measure: `max` over days answers with a day, so filtering it to whole years needs a years `LevelAttribute` argument. The two levels travel apart: `withMeasureOnFilterItem` (filters.ts:1293) first rewrites a `min`/`max` aggregation as the same call in formula form through `asFormulaMeasure` (filters.ts:1272), `max([Operand])` with the operand in `context`, so the measure keeps its own `days` there, as Fusion sends it. `applyFilterLevel` (filters.ts:662) then writes the filter level onto the item's top-level `level`, after `applyMeasureJaqlKeys` (filters.ts:640). In the aggregation form both levels share one `level`, and the server then aggregates the filter over the filter-level column (`HAVING MIN(<year>)` in place of `MIN(<day>)`), so a min over days and a min over months filtered to years sent the same JAQL. A `Date` member goes through `toLocalIsoDateTime`, a `Date` anchor becomes a bare `yyyy-MM-dd`, and the dimension classes keep their own `toISOString` path untouched.
11. Both constructors call `guardMeasureFilterLevel` (filters.ts:1322), which refuses a measure that is not a date measure, because the level the caller must pass has no meaning for one, and refuses a level from a different dimension than the measure's, because the item is built on the measure's own `dim` and the other dimension would be discarded in silence. It is skipped when either dimension is unresolvable, so a custom dimension cannot start throwing, and `createFilter` passes `skipGuards` so a dashboard saved before the guards still rebuilds.
12. Because both classes hold the LEVEL in `attribute`, `getFilterCompareId` (filter-relations.ts:834) prefixes their identity with the measure id, without which a min-date and a max-date filter on one dimension merge down to one. `applyFilterLevel` also drops the measure's own `bucket` and writes the filter's own back: a stored sub-day measure carries one, and left in place it makes the server group at a granularity nobody asked for and answer zero rows with a 200.

# Related

- [Filter relations](./filter-relations.md) - AND/OR tree these filters plug into
- [Compose code round-trip](./compose-code.md) - how `composeCode` gets stamped and parsed back
- [Measures](./measures.md) - measure-based filters and formula-filter contexts
- [Core elements](./core-elements.md) - `DimensionalElement` base and serialization
