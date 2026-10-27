# Log

## 2026-10-23

- **Removed**: the `sdk-ui` and `sdk-shared-ui` UMD bundles (`src/index.umd.ts` and the UMD build scripts). A host that loads Compose SDK as a script builds its own bundles from the package entries; invariant 9 says so for `sdk-ui`. Recorded in [architecture overview](./architecture/overview.md).

## 2026-10-22

- **Update**: `attributeFactory.customFormula`'s `dataType` is now the public `CalculatedAttributeDataType` (`text`, `numeric`, `datetime`); the values and an `isCalculatedAttributeDataType` guard live in `types.ts`. Re-anchored the shifted `types.ts` lines in [core elements](./sdk-data/core-elements.md).

## 2026-10-21

- **Fix**: rebuilding a widget's Fusion `style` (e.g. on duplicate) no longer resets Fusion-only values to defaults. `applyPartialDtoStyle` now layers the unsupported-style snapshot over the rebuilt style, and `extractUnsupportedStyleOptions` holds only fields the model does not capture: it stops snapshotting boxplot `whisker` / `outliers`, pivot grand totals and calendar `view/monthly`, and now snapshots the active indicator `components.*.inactive` and `icon` / `secondaryTitle`, the variant blocks' `subtype` / `skin`, and the pie `navigator`. Recorded in [dashboard model](./sdk-ui-dashboarding/dashboard-model.md).

## 2026-10-20

- **Update**: `attributeFactory.customFormula` takes an optional 4th `dataType`, and a calculated dimension's JAQL carries `datatype` only when known. `createCalculatedAttribute` now builds `attributeFactory.customFormula(...)` compose code and reads an untyped non-aggregating formula in its context as a nested calculated dimension. Re-anchored the shifted `attributes.ts` and `factory.ts` lines. Recorded in [attributes and dimensions](./sdk-data/attributes-and-dimensions.md).
- **Fix**: compose-code strings now escape backslashes before quotes, and the parser unescapes `\\`, so a value ending in a backslash can no longer close its quote and inject factory calls. Re-anchored the shifted `compose-code-utils.ts` lines. Recorded in [compose code](./sdk-data/compose-code.md).

## 2026-10-19

- **Fix**: the JTD pointer cursor is now set through the widget's `onBeforeRender` chain; it used to be a top-level `plotOptions` prop that no renderer reads, so no chart showed it. Non-Highcharts renderers (maps, indicator, KPI, table) still get no JTD cursor. Recorded in [jump to dashboard](./sdk-ui-dashboarding/jump-to-dashboard.md).
- **Fix**: Jump To Dashboard now has two named widget type lists in `jtd-supported-widget-keys.ts`. The loading list `JTD_SUPPORTED_WIDGET_KEYS` is unchanged and mirrors the Fusion Jump to Dashboard add-on. The new run-time list `JTD_APPLICABLE_WIDGET_KEYS` (every built-in chart type plus pivot and text) is read through `isJtdApplicableWidget` by click handling, the pointer cursor and the header icon, which used to keep lists of their own. No widget type loses JTD. Every chart that renders through Highcharts options now gets the pointer cursor in click mode (scatter map, area map, indicator, KPI and table do not), the text widget now gets the JTD icon, and the old cursor list (which named the non-existent chart type `bubble`) is gone. Re-anchored the shifted `use-jtd.ts` and `jtd-widget-transforms.tsx` anchors. Recorded in [jump to dashboard](./sdk-ui-dashboarding/jump-to-dashboard.md).
- **Fix**: `useWidgetUpdatesPersistence` applies the navigator scroller branch only to chart widgets (`isChartWidgetProps`), so a plugin whose own `styleOptions` include `navigator` keeps its `visualizationState/changed` persistence; the optimistic apply now also merges a plugin's `navigator` style key. Re-anchored the shifted `use-widget-updates-persistence.ts` references. Recorded in [persistence manager](./sdk-ui-dashboarding/persistence-manager.md) and [widget actions](./sdk-ui-dashboarding/widget-actions.md).
- **Update**: sdk-data gains `getMeasureCompareId` (`@internal`), the measure counterpart of `getAttributeCompareId`: a base measure is its attribute's compare id plus its aggregation, a calculated measure is its expression plus its sorted context entries, and titles, formats and sort are ignored, so a measure rebuilt from a stored ranking filter (titled with its ranking message) equals the original. Re-anchored the `filter-relations.ts` references, which shifted by the new imports and helper. Recorded in [filter relations](./sdk-data/filter-relations.md).

## 2026-10-16

- **Update**: FilterWidget gains a `'rank'` type (Top / Bottom N by a designer-fixed measure). `isReadableAdoption` now adopts only a `RankingFilter` (or include-all) for `'rank'`, and `'condition'` no longer adopts a `RankingFilter`, which it cannot show and whose next Apply would overwrite. Refreshed the shifted `filter-widget-connector.ts` anchors in the adoption paragraph. Recorded in [common filters](./sdk-ui-dashboarding/common-filters.md).

## 2026-10-14

- **Fix**: the date-measure members and relative-period filters now send a `min`/`max` aggregation in formula form (`formula` + `context`), so the measure keeps its own level and the filter level stays at the top. Before, both shared the aggregation's one `level`, and the server aggregated the filter over the filter-level column. Re-anchored the shifted `filters.ts` anchors. Recorded in [filters](./sdk-data/filters.md).

## 2026-10-12

- **Update**: the two non-public `sdk-ui` API levels are served only by entry points of their own. The barrels moved from `src/public-api/{internal,sisense-internal}.ts` to `src/modules/internal/public-api/internal.ts` (`@sisense/sdk-ui/internal`) and `src/modules/sisense-internal/public-api/sisense-internal.ts` (`@sisense/sdk-ui/sisense-internal`). The package root and the `./query` subpath no longer export either level; the in-company UMD entry re-exports both, so its global is unchanged. `./internal` also re-exports the `query` module's internal tier, for now; per-module internal sub-entries (e.g. `@sisense/sdk-ui/query/internal`) are the long-term plan. Added invariant 9 (each entry exports only its own level, checked by `yarn public-api-check`; the rules for these entries are in the structure guideline, §9), extended invariants 3 and 7, and re-anchored invariant 4, which pointed at a stale `eslint.config.mjs` line. `useDashboardModel` is now also `@sisenseInternal`. Re-anchored the barrel references in the dashboarding docs, plus the shifted `use-dashboard-model.ts` anchors. Recorded in [architecture overview](./architecture/overview.md) and [sdk-ui dashboarding overview](./sdk-ui-dashboarding/overview.md).

## 2026-10-08

- **Update**: `DashboardById` now marks narrative widgets with `withNarrativeRequestOptions({ sharedMode })`, which replaces `withNarrativeSharedMode` and also carries `adminAccess`. Recorded in [dashboard components](./sdk-ui-dashboarding/dashboard-components.md).
- **Update**: the dashboard narrative builder now connects widget filters through `connectWidgetFilters`, like `connectToWidgetProps`. Recorded in [common filters](./sdk-ui-dashboarding/common-filters.md).
- **Fix**: a widget filter that overrides a dashboard filter inside dashboard relations now takes its place in them, as for a plain widget, instead of dropping the dashboard filter's relation — `C OR D` with a widget `D' OR E` gives `(C OR D') AND E`, not `C AND (D' OR E)`. Recorded in [common filters](./sdk-ui-dashboarding/common-filters.md).

## 2026-10-07

- **Fix**: a widget's own filter relations now survive the dashboard filters. `connectToWidgetProps` used to flatten them, so a widget filtered by `A OR B` was queried as `A AND B`; it now gets `C AND (A OR B)` under a dashboard filter `C`. The relation logic of `useConvertFilterRelations` is now the pure `applyFilterRelationsToOtherFilters`, and the shifted `use-common-filters.tsx` and `use-convert-filter-relations.ts` anchors are refreshed. Recorded in [common filters](./sdk-ui-dashboarding/common-filters.md).
- **Update**: re-anchored the dashboarding docs after rebasing onto master. Two behaviour changes from master are now recorded. First, `useWidgetRenaming` wraps custom widgets too, because their `onChange` is now a `CustomWidgetChangeEvent` channel. Second, every `useWidgetUpdatesPersistence` handler chains to the widget's original callback instead of replacing it. Also noted that table widgets keep the merged common-filters options (so `forceApplyBackgroundFilters` applies), and refreshed the shifted `common-filters-connector.tsx`, `use-widget-renaming.ts`, `use-widget-updates-persistence.ts`, `rest-api.ts` and `query-api-dispatcher.ts` anchors. Recorded in [persistence manager](./sdk-ui-dashboarding/persistence-manager.md), [widget actions](./sdk-ui-dashboarding/widget-actions.md) and [common filters](./sdk-ui-dashboarding/common-filters.md).

## 2026-10-05

- **Creation**: extended the bundle to the `sdk-ui` dashboarding domain
  (`packages/sdk-ui/src/domains/dashboarding`) — 11 concept docs plus an overview under
  `sdk-ui-dashboarding/`, covering the `Dashboard` / `DashboardById` components and their config and
  event contracts, `useComposedDashboard`, the dashboard model with its DTO translation, reducer and
  persistence paths, and the per-dashboard features (common filters, editable layout, header,
  jump-to-dashboard, widget actions, the `dashboard` module). Registered in the root index and the
  two coverage sentences. Recorded in [sdk-ui dashboarding overview](./sdk-ui-dashboarding/overview.md).

## 2026-10-02

- **Removed**: the `@internal` `displayName` on `DataSourceInfo`. Data source labels now come only
  from the server data source list, with `title` as the fallback, so a stored copy can't go stale.
  `DataSourceMetadata.displayName` stays. Refreshed the shifted
  `packages/sdk-data/src/interfaces.ts` anchors. Recorded in
  [data model generation](./sdk-data/data-model-generation.md).

## 2026-09-30

- **Update**: `DataSourceInfo` gains an optional `@internal` `displayName`, a user-visible label
  only; `title` stays the identity name for queries, JAQL and matching. `DataSourceMetadata` gains
  a nullable `displayName` read from the data source list. Refreshed the shifted
  `packages/sdk-data/src/interfaces.ts` anchors. Recorded in
  [data model generation](./sdk-data/data-model-generation.md).
- **Fix**: `isDataSourceInfo` lives in `packages/sdk-data/src/utils.ts`, not `interfaces.ts`.
  Recorded in [data model generation](./sdk-data/data-model-generation.md).

## 2026-09-28

- **Update**: renamed the date-measure filters to the `dateMeasure` prefix after review, because they
  only ever apply to a date measure (every builder takes a date level). `filterFactory.measureMembers`,
  `measureDateRelativeFrom` and `measureDateRelativeTo` are now `dateMeasureMembers`,
  `dateMeasureRelativeFrom` and `dateMeasureRelativeTo`, and the `measureDateRelative` alias of `From`
  is removed. Internally `MeasureMembersFilter` / `MeasureRelativeDateFilter` are now
  `DateMeasureMembersFilter` / `DateMeasureRelativeFilter`, their guards follow, and the `filterType`
  values are `date-measure-members` / `date-measure-relative`. Refreshed the shifted anchors.
  Recorded in [filters](./sdk-data/filters.md).

## 2026-09-24

- **Update**: `isDateMeasure` no longer counts a date PART such as week-of-year, which answers an
  ordinal. The PAST shifts, `trend`, `forecast` and `measuredValue` stamp `datatype: 'datetime'` on
  their result when the operand is a date measure, so it renders as a date, and a pivot subtotal
  over such a wrapper reads the operand's aggregation. The factory does not validate what a date
  measure is combined with; that is left to the server, and each builder the server rejects or
  misanswers over a date says what it supports in a `Note:` in its description. Refreshed the shifted `factory.ts` and
  `measures.ts` anchors. A date formula over a date column with no level keeps
  `datatype: 'datetime'`, without a level-keyed mask. Recorded in [measures](./sdk-data/measures.md).

## 2026-09-22

- **Fix**: wording pass over the measure-filter docs and comments, no behaviour change. Invariant 10
  was split into items 10, 11 and 12 (the level argument and write order, the two guards and when
  they are skipped, the compare id and the bucket rule), the bucket sentence now says the measure's
  bucket is dropped and the filter's own is kept, and the `filters.ts` line references were
  refreshed after the comment rewrites moved them.
  Recorded in [filters](./sdk-data/filters.md).

- **Creation**: measure members and relative-period filters. `MeasureMembersFilter` and
  `MeasureRelativeDateFilter` extend the dimension classes so the `filter` block stays one rule and
  only `jaql()` differs, and `filterFactory.measureMembers`, `measureDateRelative`,
  `measureDateRelativeFrom` and `measureDateRelativeTo` build them. The level the filter matches at
  is an explicit argument, not the measure's own operand level, which is the whole design: the
  server answers 200 with zero rows when it is wrong. Extracted the measure-key loop that MeasureFilter
  and MeasureRankingFilter each held a copy of. Added item 10 to Invariants and traps and the two new
  classes to the Entry point table. Both constructors refuse a non-date measure and a level from
  another dimension, through `guardMeasureFilterLevel`, with two new `errors.filter.dateMeasure.*`
  keys in en and uk; the deserialization path passes `skipGuards` so saved filters keep rebuilding.
  The filter level also clears `bucket`, `getFilterCompareId` includes the measure so two measure
  filters on one level no longer merge to one, deserialization rebuilds a saved `backgroundFilter`
  and keeps the relative-period config, and `CustomSuperJSON` gained an entry for each new class.
  Recorded in [filters](./sdk-data/filters.md).

- **Fix**: the measure-filter attribute search decides what to recurse into by TYPE, not by shape.
  A calculated attribute carries a `context` just like a calculated measure, so the old check
  descended into one and answered with an operand inside it instead of the attribute the caller
  named. Guarded with `MetadataTypes.isCalculatedMeasure`, which leaves a calculated attribute to be
  taken as the attribute candidate it is. Extended item 9 and refreshed the shifted `factory.ts`
  anchors. Recorded in [filters](./sdk-data/filters.md).

- **Fix**: measure-filter attribute resolution no longer stops at a nested bare attribute. The
  traversal now reports whether it found a measure/filter operand or only the last-resort bare
  attribute, so a nested formula over a bare attribute is held as a candidate and a real measure
  operand later in the outer context still wins, at any depth. Added item 9 to Invariants and traps
  and refreshed the `factory.ts` anchors the new helper moved.
  Recorded in [filters](./sdk-data/filters.md).

- **Fix**: corrected stale `file:line` anchors this branch had already moved or mis-resolved:
  `logic.and`/`or` and the `relate` flattening helper in
  [filter relations](./sdk-data/filter-relations.md), and `DimensionalMeasureTemplate` and
  `createMeasure` and `DimensionalCalculatedMeasure.jaql()` in [measures](./sdk-data/measures.md).

- **Update**: measure filters accept a date bound. `MeasureFilter` widens to
  `number | string | Date` and converts a `Date` in its constructor through the new module-scope
  `toLocalIsoDateTime`, which emits `yyyy-MM-ddTHH:mm:ss` with no `Z` so the server does not read
  the bound as UTC and shift the day. `DateRangeFilter` keeps its own `toISOString` path
  deliberately. Added the new export to the Entry point table, added item 7 to Invariants and traps,
  and refreshed the stale `file:line` references for `filters.ts` and `factory.ts`.
  The serializer rejects an invalid `Date` with the new `errors.filter.invalidDateValue`
  message rather than serializing `NaN`.
  Recorded in [filters](./sdk-data/filters.md).

## 2026-09-17

- **Update**: measures doc records that `getDateMeasureAttribute` now covers the formula shape as
  well as the aggregation shape. `DimensionalCalculatedMeasure` carries the `datatype` the saved
  jaql stamped, and its `jaql()` sends a date formula as a datetime with a mask. Adds
  `getDateMeasureAggregation`, the single place that says whether a date measure is a `min` or a
  `max`. Refreshed the `file:line` references that moved.
  Recorded in [measures](./sdk-data/measures.md).

- **Update**: `createCalculatedAttribute` builds raw JAQL context entries through
  `createDimensionalElementFromJaql` so calculated-dimension filters keep each column's real data type
  (text/numeric/datetime) and can be rebuilt via `createFilter(instance)`. Recorded in
  [attributes-and-dimensions](./sdk-data/attributes-and-dimensions.md).
- **Update**: measures doc records that `DimensionalBaseMeasure.jaql()` now emits a date mask for a
  date measure, and adds `getDefaultDateMeasureFormat` and `hasDateMeasureLevel` to the entry points.
  `hasDateMeasureLevel` is the shared predicate the jaql, CSV and Excel paths ask, and
  `getDefaultDateMeasureFormat` now keeps a caller's own format on a sub-day level instead of
  clamping it. Refreshed the `file:line` references that moved.
  Recorded in [measures](./sdk-data/measures.md).

- **Fix**: refreshed `file:line` anchors in four docs that were not edited but reference files this
  change moved lines in.
  Recorded in [filters](./sdk-data/filters.md),
  [filter-relations](./sdk-data/filter-relations.md),
  [attributes-and-dimensions](./sdk-data/attributes-and-dimensions.md) and
  [core-elements](./sdk-data/core-elements.md).

- **Update**: measures doc records the datatype-preserving aggregation rule: only `min` and `max`
  keep the aggregated column's datatype. Added `isDateMeasure` and `getDateMeasureAttribute` to the
  entry points and updated the `file:line` references that moved.
  Recorded in [measures](./sdk-data/measures.md).

## 2026-09-11

- **Creation**: OKF knowledge bundle bootstrapped for the `sdk-data` package and monorepo
  architecture — 8 concept docs plus an overview under `sdk-data/`, prescriptive invariants
  under `architecture/`. Maintenance contract installed in `CLAUDE.md` and
  `.claude/rules/okf-knowledge.md`; structural checks in `scripts/check-knowledge.sh`.
  Recorded in [sdk-data overview](./sdk-data/overview.md).
