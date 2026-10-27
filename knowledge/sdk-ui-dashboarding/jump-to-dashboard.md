---
type: Module
title: Jump to dashboard
description: Jump To Dashboard (JTD) — the public config types, their normalization to the internal legacy shape, the filter-carrying rules, the per-widget-family click handlers, and the read-only modal that renders the target dashboard.
resource: packages/sdk-ui/src/domains/dashboarding/hooks/jtd
tags: [sdk-ui, dashboarding, module, navigation]
---

## Purpose

JTD lets a click or right-click on a widget open another dashboard in a modal, pre-filtered by the clicked point plus a configurable subset of dashboard and widget filters. This doc also covers `hooks/use-jtd.ts` (dashboard-level hook and the shared `applyJtdToWidget`), `hooks/use-jtd-widget.ts` (the public standalone hook) and `components/jtd-dashboard.tsx` (the modal content).

## Entry point

| What                | Where                                                                                                                                                                                                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public types        | `JumpToDashboardConfig` — `packages/sdk-ui/src/domains/dashboarding/hooks/jtd/jtd-types.ts:115`; `JumpToDashboardConfigForPivot` — `:217`; `JtdTarget` — `:257`; `TriggerMethod` — `:362` (all public, `public-api/public.ts:79-84`)                                                                         |
| Public hook         | `useJtdWidget(widgetProps, config)` — `hooks/use-jtd-widget.ts:117` (public, `public-api/public.ts:85`; wrapped in `withTracking`)                                                                                                                                                                           |
| Dashboard hook      | `useJtdInternal` — `hooks/use-jtd.ts:130`; shared `applyJtdToWidget` — `:48` (both tagged `@internal`, not re-exported from sdk-ui)                                                                                                                                                                          |
| Normalization       | `normalizeToJtdConfig` — `jtd-config-transformers.ts:193` (tagged `@internal`, not re-exported); internal shape `JtdConfig` — `jtd-types.ts:377`                                                                                                                                                             |
| Filters             | `getFiltersFromDataPoint` — `jtd-filters.ts:474`; `filterByAllowedDimensions` — `:494`; `getFormulaContextFilters` — `:82`; `handleFormulaDuplicateFilters` — `:134`                                                                                                                                         |
| Handlers            | `getJtdClickHandler` — `jtd-handlers.tsx:45`; `getJtdClickHandlerForMultiplePoints` — `:119`; `handleDataPointClick` — `:220`; `handlePivotDataPointClick` — `:296`; `handleTextWidgetClick` — `:344`                                                                                                        |
| Menu                | `getJumpToDashboardMenuItem` — `jtd-menu.ts:15`; `getJumpToDashboardMenuItemForMultiplePoints` — `:78`; `jumpToDashboardMenuId = 'jump-to-dashboard-menu'` — `:4`                                                                                                                                            |
| Widget transforms   | `jtd-widget-transforms.tsx`: `addPointerCursorToChart :50`, `applyClickNavigationForChart :86`, `applyClickNavigationForPivot :136`, `applyClickNavigationForText :186`, `applyRightClickNavigation :223`, `applyRightClickNavigationForPivot :311`, `applyPivotLinkStyling :426`, `addJtdIconToHeader :509` |
| Pivot actionability | `isPivotClickHandlerActionable` — `jtd-formatters.ts:151`; `getPivotTargetActionability` — `:198`                                                                                                                                                                                                            |
| Modal content       | `JtdDashboard` — `components/jtd-dashboard.tsx:120`; `JTD_READ_ONLY_CONFIG` — `:41`                                                                                                                                                                                                                          |
| Widget type lists   | Loading: `JTD_SUPPORTED_WIDGET_KEYS` — `jtd-supported-widget-keys.ts:25`, `widgetTypeSupportsJtd(fusionType)` — `:55`. Run time: `JTD_APPLICABLE_WIDGET_KEYS` — `:70`, `isJtdApplicableWidgetKey(key)` — `:85`, `isJtdApplicableWidget(widgetProps)` — `:115`                                                |
| DTO read gate       | `jumpToDashboardConfigFromJtdDtoSlice` — `dashboard-model/translate-dashboard-utils.ts:410`                                                                                                                                                                                                                  |

## Contract

```ts
export type TriggerMethod = 'click' | 'rightclick'; // jtd-types.ts:362
export type JtdTarget =
  | { caption: string; id: string }
  | { caption: string; dashboard: DashboardProps }; // :257
```

`JumpToDashboardConfig` fields (`jtd-types.ts:115-210`): `enabled?`, `targets`, `interaction?: { triggerMethod?, captionPrefix?, showIcon? }`, `targetDashboardConfig?`, `filtering?: { extraFilters?, includeDashboardFilters?, includeWidgetFilters?, mergeWithTargetFilters? }`, `modal?: { width?, height?, measurementUnit? }`. `JumpToDashboardConfigForPivot` replaces `targets` with a `Map<Attribute | { dimension, location: 'row' | 'column' | 'value' } | Measure, JtdTarget[]>` (`:233-237`).

Normalization (`transformJumpToDashboardConfigToJtdConfigCommon`, `jtd-config-transformers.ts:80-108`) applies the documented defaults: `enabled ?? true`, `navigateType ?? 'rightclick'`, `showJtdIcon ?? true`, `mergeTargetDashboardFilters ?? false`, modal `85`/`85` when `measurementUnit === '%'` else `1200`/`800`, `modalWindowMeasurement ?? 'px'`. Internal field names (`JtdConfig`): `includeDashFilterDims` ← `filtering.includeDashboardFilters`, `includeWidgetFilterDims` ← `filtering.includeWidgetFilters`, `jumpTargets` ← `targets`. `normalizeToJtdConfig` (`:193-222`) returns an input that already is a `JtdConfig` unchanged, maps a pivot `Map` to `jumpTargets[].pivotDimensions` (`PivotDimId` such as `rows.0`, `:302`) via `mapTargetsToArrayTargets` (`:392`), and returns `{ enabled: false, jumpTargets: [] }` with a `console.warn` when a pivot config meets a non-pivot widget or vice versa (`:200-217`).

Legacy `version` gate: the Fusion DTO (`JtdConfigDto`, `jtd-types.ts:318`) carries `version?: string` (`:351`). `jumpToDashboardConfigFromJtdDtoSlice` restores a JTD config only when `drillToDashboardConfig.version` is set (`translate-dashboard-utils.ts:413-416`), and the write path stamps `version: '1'` (`:515`) so a config saved from Compose SDK survives the next load. Nothing in `jtd-config-transformers.ts` reads `version`.

Filter rules. Include lists (`filterByAllowedDimensions`, `jtd-filters.ts:494-535`): `undefined` → all, `[]` → none, otherwise match `filter.attribute.expression`; a cascading filter keeps only matching levels and collapses to a plain filter when one level remains. Point filters (`getFiltersFromDataPoint`, `:474`): `category` and `breakBy` entries, plus scatter `breakByColor`/`breakByPoint`; KPI points are lifted from single entries to arrays first (`convertKpiToDataPoint`, `:448`); pivot points become `category = [...rows, ...columns]` (`convertPivotToDataPoint`, `jtd-handlers.tsx:269`). Date-level values are normalized to the start of their granularity in `yyyy-MM-dd'T'HH:mm:ss` (`normalizeDateForGranularity`, `:221`). Formula-context filters come from `dataOptions.value[*].column.context` of the clicked widget only (`:82-124`), de-duplicated per dimension by `sendFormulaFiltersDuplicate` (`'none'` | 1-based index | other → first, `:134-186`). Merge order in `getJtdClickHandler` (`jtd-handlers.tsx:74-83`), later wins: dashboard filters → widget filters → formula-context filters → point filters → `extraFilters`. Multi-point selection unions members per dimension before merging (`:130-157`).

Widget type lists (`jtd-supported-widget-keys.ts`), two on purpose. The loading list `JTD_SUPPORTED_WIDGET_KEYS` (`pie`, `indicator`, `text`, `column`, `bar`, `line`, `area`, `pivot`, `scatter`, `polar`) mirrors the widget types the Fusion Jump to Dashboard add-on supports: on load, `widgetTypeSupportsJtd` drops the saved JTD config of any other Fusion type (`translate-dashboard-utils.ts:276`). The run-time list `JTD_APPLICABLE_WIDGET_KEYS` is derived from `BUILT_IN_WIDGET_DESCRIPTORS`: every key whose `widgetType` is `chart`, plus `pivot` and `text`. Click and right-click handling, the pointer cursor and the header icon all read it through `isJtdApplicableWidget`: `applyJtdToWidget` returns any other widget (filter, narrative, every custom widget) unchanged (`use-jtd.ts:68-74`), and `addPointerCursorToChart` and `addJtdIconToHeader` check it too. A config given in code (`widgetsOptions`, `useJtdWidget`) therefore works on chart types the loader would drop.

Per-family dispatch (`applyJtdToWidget`, `use-jtd.ts:68-113`): `'click'` + chart → `applyClickNavigationForChart` (adds pointer cursor, `onDataPointClick` → `handleDataPointClick`: one target jumps directly, several open the menu); `'click'` + text → `applyClickNavigationForText` (always first target, no point filters); `'click'` + pivot → `applyClickNavigationForPivot` + `applyPivotLinkStyling` (hyperlink formatters on actionable cells); `'rightclick'` + chart → `applyRightClickNavigation` (`onDataPointContextMenu` and `onDataPointsSelected`); `'rightclick'` + pivot → `applyRightClickNavigationForPivot`; `'rightclick'` + text attaches nothing. The pointer cursor is set only in `'click'` mode, on every chart in the run-time list, by chaining `onBeforeRender` to set `plotOptions.series.cursor` on the Highcharts options (the widget's own `onBeforeRender` runs after it). Charts that do not render through Highcharts options (scatter map, area map, indicator, KPI, table) get no JTD cursor. The JTD header icon (`WidgetHeaderTargets.JtdIcon`, tooltip `jumpToDashboard.jumpableTooltip`) is added to every widget in the run-time list, text included, when `showJtdIcon` (`:109-111`). Zero targets throws `TranslatableError('jumpToDashboard.noJumpTargets')` (`jtd-handlers.tsx:34`).

Pivot actionability (`jtd-formatters.ts`): a cell is actionable when some target's `pivotDimensions` includes the cell's dimension id; when no target has `pivotDimensions` at all, every cell falls back to the first target (`getJtdActionabilityResult`, `:28-55`).

Modal (`JtdDashboard`): `openModal({ title: target.caption, width, height, measurement: 'px' | '%' })` (`jtd-handlers.tsx:92-96`). A target by `id` loads via `useDashboardModel({ persist: false })` (`jtd-dashboard.tsx:86-92`) and gets `JTD_READ_ONLY_CONFIG` pinned _over_ its permission-derived config (`:158`, `:167`); a target given as `dashboard` props gets the pin only under its own config (`:163-164`). `targetDashboardConfig` deep-merges on top, arrays replaced (`:178-182`). `mergeTargetDashboardFilters` chooses `mergeFilters(targetFilters, runtimeFilters)` vs replace (`:137-147`).

## How it connects

- `useComposedDashboardInternal` calls `useJtdInternal({ widgetOptions, dashboardFilters, widgetFilters, openMenu })` (`use-composed-dashboard.tsx:241-246`) and maps every widget after common filters (`:350-352`); per-widget config comes from `widgetsOptions[id].jtdConfig` (`dashboard-model/types.ts:109`, see [dashboard-model](./dashboard-model.md)). `dashboardFilters` are the connected [common filters](./common-filters.md).
- Both hooks are gated by `app.settings.jumpToDashboardConfig.enabled` (`use-jtd.ts:150`, `use-jtd-widget.ts:141`; setting at `infra/app/settings/settings.ts:246`).
- Menu coexistence: `useJtdWidget` uses `useCombinedMenu` with `combineWidgetMenus` (`use-jtd-widget.ts:27-51`) to append JTD sections to the drilldown menu; the composed dashboard does the same for crossfiltering + drilldown + JTD (`use-composed-dashboard.tsx:66-105`).
- Vue and Angular consume `useJtdWidget` through sdk-ui-preact (`packages/sdk-ui-vue/src/composables/use-jtd-widget.ts`, `packages/sdk-ui-angular/src/lib/services/widget.service.ts:8`); dashboards get JTD via `useComposedDashboardInternal` ([composed-dashboard](./composed-dashboard.md)).
- The modal renders the full `Dashboard` ([dashboard-components](./dashboard-components.md)), so cross-filtering and nested JTD work inside it.

## Invariants and traps

1. Point filters outrank dashboard and widget filters, `extraFilters` outrank everything (`jtd-handlers.tsx:74-83`); changing the nesting order changes which same-dimension filter survives `mergeFilters`.
2. `useJtdWidget` passes `dashboardFilters: []` and `originalWidgetFilters: []` (`use-jtd-widget.ts:151-152`): `filtering.includeDashboardFilters` has no effect outside a dashboard, as its TSDoc says.
3. A JTD config without `version` on the DTO is dropped on load (`translate-dashboard-utils.ts:413`); any new serializer must stamp `version: '1'`.
4. `hooks/index.ts:14-26` says `applyJtdToWidget` / `normalizeToJtdConfig` are "used by framework adapters" — `grep` over `sdk-ui-vue`, `sdk-ui-angular`, `sdk-ui-preact` finds no such use; adapters only import `useJtdWidget`. Treat the comment as stale.
5. Mutation inside `applyRightClickNavigation`: `registerDataPoint*Handler` mutates the spread copy (`jtd-widget-transforms.tsx:295-297`), and `useJtdWidget` reassigns `enhancedWidgetProps.onBeforeMenuOpen` (`use-jtd-widget.ts:159-168`) — a deviation from the repo's immutability rule; do not rely on referential equality of the returned props.
6. Pivot handlers forward to the widget's own `onDataPointClick` only when the cell is _not_ actionable (`jtd-widget-transforms.tsx:151-153`); actionable clicks swallow the original handler.
7. `JTD_READ_ONLY_CONFIG` must list every structural flag in the permission mapping (`jtd-dashboard.tsx:36-39`); download actions are deliberately left out.

## Related

- [Composed dashboard](./composed-dashboard.md) - wires `useJtdInternal` into the widget pipeline
- [Common filters](./common-filters.md) - source of `dashboardFilters` and of the combined context menu
- [Dashboard model](./dashboard-model.md) - `widgetsOptions[id].jtdConfig` and the DTO translation that gates on `version`
- [Dashboard components](./dashboard-components.md) - the `Dashboard` rendered inside the modal
- [Filters & filterFactory](../sdk-data/filters.md) - `filterFactory.members` / `cascading` used to build carried filters
