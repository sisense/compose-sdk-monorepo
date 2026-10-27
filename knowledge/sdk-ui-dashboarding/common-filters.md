---
type: Module
title: Common filters and cross-filtering
description: The hook and pure connectors that push dashboard-level filters into every widget's props, turn widget clicks back into filters, and keep filter widgets, cascading filters and filter relations consistent while doing so.
resource: packages/sdk-ui/src/domains/dashboarding/common-filters
tags: [sdk-ui, dashboarding, module, filters]
---

## Purpose

`useCommonFilters` owns the dashboard's filter state and returns `connectToWidgetProps`, a mapper that gives each widget its share of the common filters (as `filters` or `highlights`), wires click/selection handlers that write selections back, and hands a FilterWidget the filter it edits. The hook itself is stateful: it holds the filters through `useConvertFilterRelations` and returns `useCallback` mappers that update them. The connector, selection, cascading and filter-widget utilities it calls are pure functions over `Filter[]`, so those rules are testable without React.

## Entry point

| What                   | Where                                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hook                   | `useCommonFilters` — `packages/sdk-ui/src/domains/dashboarding/common-filters/use-common-filters.tsx:36` (tagged `@internal`, not exported from sdk-ui)                   |
| Returns                | `{ filters, setFilters, addFilter, connectToWidgetProps }` — `use-common-filters.tsx:179-184`                                                                             |
| Chart/pivot connector  | `prepareCommonFiltersConnectionProps` — `common-filters-connector.tsx:75`                                                                                                 |
| FilterWidget connector | `connectFilterWidgetToProps` — `filter-widget-connector.ts:224`; `resolveFilterWidgetFilter` — `:88`                                                                      |
| Date-level exclusion   | `withExcludedDateLevels` — `filter-widget-date-levels.ts:53`                                                                                                              |
| Selection semantics    | `getWidgetSelections` — `selection-utils.ts:273`; `getSelectableWidgetAttributes` — `:328`; `createCommonFiltersOverSelections` — `:469`                                  |
| Cascading bridge       | `withCascadingFiltersConversion` — `cascading-utils.ts:159`; `flattenCascadingFilters` — `:14`; `reassembleCascadingFilters` — `:49`                                      |
| Relations bridge       | `useConvertFilterRelations` — `use-convert-filter-relations.ts:130`                                                                                                       |
| Options types          | `CommonFiltersOptions` — `types.ts:17`, `FiltersIgnoringRules` — `:44`, `CommonFiltersApplyMode` — `:9` (all three public, type-only, via `public-api/public.ts:205-207`) |
| Header item            | `createClearSelectionButtonItem` — `clear-selection-button.tsx:74` (`data-testid="csdk-clear-selection-button"`, `:52`)                                                   |

## Contract

Apply modes (`types.ts:9-12`) and defaults (`common-filters-connector.tsx:37-45`):

```ts
export enum CommonFiltersApplyMode {
  HIGHLIGHT = 'highlight',
  FILTER = 'filter',
}
// defaults: applyMode: HIGHLIGHT, shouldAffectFilters: true, ignoreFilters: { all: false, ids: [] }, forceApplyBackgroundFilters: true
```

`normalizeCommonFiltersOptions` (`:47`) forces `widgetType === 'table'` to `applyMode: FILTER, shouldAffectFilters: false`, ignoring caller options for those two fields; every other option, `forceApplyBackgroundFilters` included, merges over the defaults as for any other widget (`:51-65`).

Slice vs highlight (`splitToSliceAndHighlightFilters`, `:248`): in `'highlight'` mode a filter whose attribute is one of the widget's _selectable attributes_ becomes a `highlights` entry, every other filter becomes a `filters` (slice) entry; include-all members filters are dropped from highlights (`:257-262`). In `'filter'` mode everything is a slice filter. Background filters of members filters are always appended as slice filters when `forceApplyBackgroundFilters` is on, bypassing `disabled` and `ignoreFilters` (`:111-114`).

Selectable attributes per widget type (`getSelectableWidgetAttributes`, `:328-378`): `category` for cartesian/categorical/boxplot/range; `x`,`y`,`breakByPoint`,`breakByColor` (non-measure) for scatter; `geo` for maps; `date` for calendar heatmap; `rows`+`columns` for pivot; every non-measure column for `custom`; none for `text`/`narrative`. Calculated dimensions are selectable only when the caller passes `includeCalculatedAttributes = true` and never for `treemap`/`sunburst` (`:369-370`).

How a click becomes a filter (`createCommonFiltersOverSelections`, `:469`):

1. Each selection becomes `filterFactory.members(attribute, values.map(String), { guid: existing?.guid, backgroundFilter: existing?.backgroundFilter })` (`utils.ts:41-55`) — the guid of a same-attribute filter is reused, so relations keep pointing at it.
2. Selections on an attribute with a `config.locked` filter are discarded (`removeLockedFilters`, `:491`).
3. Unselection (`applyUnselectionRulesToFilter`, `:401`): if the clicked members equal the existing filter's members → the filter is cleared to include-all (`clearMembersFilter`); if `allowPartialUnselection` and the clicked members are a strict subset of the existing members → a filter with the remaining members. Otherwise it is a selection. `isSelection` is true when _any_ selection did not resolve to an unselection (`:457`); then all selections are applied, else only the unselections.
4. Treemap/sunburst select only the clicked level and clear every other level (`getTreemapChartSelections`, `:169`). Pivot takes only data cells that are not totals; with no values it uses the last row/column entry only (`:227-247`).

Handlers registered on the widget (`common-filters-connector.tsx`): `onDataPointClick` (`:209`) applies selections directly, partial unselection off; `onDataPointsSelected` (`:120`) and `onDataPointContextMenu` (`:162`) open menu `MenuIds.WIDGET_POINTS_CROSSFILTERING` (`'widget-points-crossfiltering'`, `infra/contexts/menu-provider/menu-ids.ts:8`) with a title section `MenuSectionIds.CROSSFILTERING_CHART_POINTS_SELECTION` and one action captioned `commonFilter.selectMenuItem` / `commonFilter.unselectMenuItem`. `clearSelection` is set only when an enabled, unlocked, non-include-all members filter exists on a selectable attribute (`:219-236`); `useCommonFilters` turns it into the `WidgetHeaderTargets.ClearSelectionButton` header item (`use-common-filters.tsx:164-167`).

FilterWidget adoption rules (`filter-widget-connector.ts`): the attribute match (`isSameAttribute` = expression + granularity) is authoritative, the stored `widgetsOptions[id].filterWidgetOptions.filterId` guid is a re-validated hint (`:117-123`). Read path adopts a same-attribute filter only if `isReadableAdoption` allows it per `filterType` (`:65-77`: `'range'` → inclusive `DateRangeFilter`, `'period'` → `RelativeDateFilter`, `'rank'` → `RankingFilter`, `'condition'` → non-members that are not a `RankingFilter`, else members; include-all always). Write path: `null` resets the owned filter to include-all under the same guid (`resetLinkedFilterToIncludeAll`, `:177`); a new filter replaces under the linked guid, else claims an own-at-other-level or adoption candidate's guid when `canAdoptFilter` (`:27`) agrees on members-vs-non-members, else is appended with its own guid (`:263-310`). A Rank widget's candidate is always a `RankingFilter` or include-all, so it never claims a Condition filter's guid, and a Condition widget never claims a ranking's. `withExcludedDateLevels` hides granularities already claimed by _other_ filters on the same dimension (`filter-widget-date-levels.ts:23-42`).

Cascading filters are flattened to level filters before any of the above and reassembled on write with `shouldResetFiltersDeeperThanModified: true` (`cascading-utils.ts:170-175`), so changing a level clears every deeper level (`:197-229`); `ignoreFilters.ids` naming a cascading guid expands to its level guids (`:239-254`). A missing original throws `errors.cascadingFilterOriginalNotFound` (`:65`).

## How it connects

- `useComposedDashboardInternal` calls `useCommonFilters` (`use-composed-dashboard.tsx:227`), then maps every widget through `connectToWidgetProps(widget, { ...widgetsOptions[id].filtersOptions, filterWidgetOptions, setFilterWidgetOptions })` and `withExcludedDateLevels` (`:329-341`); the resulting `filters` feed [jump-to-dashboard](./jump-to-dashboard.md) as `dashboardFilters` (`:241`). See [composed-dashboard](./composed-dashboard.md).
- `filterWidgetLinkedIds` (`:383-399`) and FilterWidget deletion cleanup (`:421-449`) reuse `resolveFilterWidgetFilter`, so the panel's read-only tiles and the connector cannot disagree.
- `useConvertFilterRelations` keeps `{ filters, relations }` in one `useSyncedState` (`@beta`) and recomputes relations with `calculateNewRelations` from `@/shared/utils/filter-relations` on every `setFilters`/`addFilter`; `applyRelationsToOtherFilters` (`:219`) wraps the pure `applyFilterRelationsToOtherFilters` (`:56`), which re-applies the dashboard's relation tree to a widget's merged filter list with `shouldReplaceSameAttributeFilters: true`. `connectToWidgetProps` sets a widget's `filters` through `connectWidgetFilters` (`:98`): a widget whose own filters are a `FilterRelations` tree keeps it, ANDed with the dashboard filters it applies — `C` on the dashboard and `A OR B` on the widget give `C AND (A OR B)`; a plain `Filter[]` is merged as before. A widget filter on the attribute of a dashboard filter overrides it (FR1): with dashboard relations it takes that filter's place in them and leaves the widget's tree, as for a plain widget — `C OR D` and `D' OR E` give `(C OR D') AND E`; without them the dashboard filter is dropped and the widget's tree stays whole — `C AND (D' OR E)`. The dashboard narrative builder (`packages/sdk-ui/src/domains/narrative/core/get-narrative-from-dashboard.ts`) connects each widget the same way, so a narrative queries what the dashboard shows. The tree model itself is [filter relations](../sdk-data/filter-relations.md).
- Per-widget `filtersOptions` live in `SpecificWidgetOptions` ([dashboard-model](./dashboard-model.md), `dashboard-model/types.ts:105`); the filters panel UI is in [dashboard-components](./dashboard-components.md).
- Merging everywhere uses sdk-data `mergeFilters` (`filter-relations.ts:864`): target wins per compare id, source order kept.

## Invariants and traps

1. Filter identity is `config.guid`; `createCommonFilter` deliberately reuses the existing guid (`utils.ts:51`) and the FilterWidget write path replaces _under_ a guid (`filter-widget-connector.ts:183-193`) — generating a fresh guid orphans relation leaves (see [filters](../sdk-data/filters.md)).
2. `connectToWidgetProps` returns text/narrative widgets untouched (`use-common-filters.tsx:61`) and `cloneDeep`s every other widget (`:121`); handlers are _registered_ alongside the widget's own via `registerDataPoint*Handler`, not replaced.
3. A FilterWidget never receives `highlights`; dashboard filters join its `parentFilters` only when `ignoreFilters.all === false`, minus its own attribute (`:81-88`) — self-filtering would collapse the dropdown.
4. `onSetup` is never invented by the mapper (`:102`): a missing host callback leaves the "Set up filter" button disabled on purpose.
5. Order inside `isReadableAdoption`/`resolveFilterWidgetFilter` is load-bearing: own-filter-at-other-level before adoption candidate (`:125-137`); reversing it re-creates the "second linked tile after a level change" bug the comments describe.
6. `useConvertFilterRelations` suppresses duplicate `onFiltersChange` calls with a deep-equal ref (`:151-154`); do not add a second notifier, React batching will double-fire.
7. Table widgets cannot drive cross-filtering (`normalizeCommonFiltersOptions`, `common-filters-connector.tsx:56-65`) regardless of `shouldAffectFilters`, but they keep the default `forceApplyBackgroundFilters: true`; an override that drops the merged options would stop background filters slicing tables.

## Related

- [Composed dashboard](./composed-dashboard.md) - the only caller; where widget options and persistence meet this hook
- [Dashboard model](./dashboard-model.md) - `SpecificWidgetOptions.filtersOptions` / `filterWidgetOptions` schema
- [Jump to dashboard](./jump-to-dashboard.md) - consumes the connected dashboard filters
- [Filters & filterFactory](../sdk-data/filters.md) - `MembersFilter`, `CascadingFilter`, guid semantics
- [Filter relations](../sdk-data/filter-relations.md) - the AND/OR tree re-applied per widget
