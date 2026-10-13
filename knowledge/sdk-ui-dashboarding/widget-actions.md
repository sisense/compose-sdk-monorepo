---
type: Module
title: Widget actions
description: The composition-layer hooks that decorate each widget's props with dashboard-level behaviour — tabber visibility, duplicate and rename menu items, CSV/Excel download defaults, debounced persistence of runtime state, and the filters-panel collapsed flag.
resource: packages/sdk-ui/src/domains/dashboarding/hooks
tags: [sdk-ui, dashboarding, module, hooks]
---

## Purpose

`useComposedDashboardInternal` runs the widget list through a fixed chain of small hooks, each returning `{ widgets }` with one concern added. This doc covers that chain minus the three documented elsewhere: JTD ([jump-to-dashboard](./jump-to-dashboard.md)), layout management and edit history ([editable-layout](./editable-layout.md)), and `useDashboardHeaderMenuItem` ([dashboard-header](./dashboard-header.md)).

## Entry point

| What                | Where                                                                                                                                                                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tabber              | `useTabber` — `packages/sdk-ui/src/domains/dashboarding/hooks/use-tabber.ts:179`; `TabbersConfig :48`, `TabberConfig :37`, `TabberTabConfig :27` (public types, `public-api/public.ts:48-50`); `isTabberButtonsWidget :50`; `modifyLayout :112` |
| Duplicate           | `useDuplicateWidgetMenuItem` — `hooks/duplicate-widget/use-duplicate-widget-menu-item.ts:93`; `getWidgetCellLocation`, `withNewCellInsertedToTheSameRow`, `withReplacedWidgetId` — `duplicate-widget-utils.ts:22`, `:45`, `:90`                 |
| Rename              | `useWidgetRenaming` — `hooks/rename-widget/use-widget-renaming.ts:68`                                                                                                                                                                           |
| CSV / Excel         | `useWidgetCsvDownload` — `hooks/use-widget-csv-download.ts:26` (`@internal`); `useWidgetExcelDownload` — `hooks/use-widget-excel-download.ts:25`                                                                                                |
| Updates persistence | `useWidgetUpdatesPersistence` — `hooks/use-widget-updates-persistence.ts:74` (tagged `@sisenseInternal`); payload `WidgetPropsUpdate` — `persistence/update-types.ts:15`                                                                        |
| Filters panel flag  | `useFiltersPanelCollapsedState` — `hooks/use-filters-panel-collapsed-state.tsx:11`; `LS_KEY_FILTERS_PANEL_COLLAPSED = 'csdk_dashboard_filters_panel_collapsed'` — `:6`                                                                          |
| Caller              | chain in `use-composed-dashboard.tsx:285-369`                                                                                                                                                                                                   |

None of the hooks above is re-exported from `public-api/`; only the tabber config types are public.

## Contract

Composition order (`use-composed-dashboard.tsx`): change detection `:249` → duplicate `:285` → rename `:305` → CSV `:313` → Excel `:320` → common filters `:327` → JTD `:350` → updates persistence `:354` → tabber `:360` → layout management `:366`.

Tabber (`use-tabber.ts`). A tabber is a custom widget with `customWidgetType === 'tabber-buttons'` (`:50-52`); `TabbersConfig = Record<WidgetId, TabberConfig>` where each tab lists `displayWidgetIds`. Visibility rule, verbatim from `:87`:

```ts
/** For each tabber widget config, the tab is visible in case it is either visible or not controlled by the tabber config at all. */
```

Implemented by `isVisible` (`:89-110`): a widget is hidden iff some tabber mentions it in _any_ tab but not in its active tab; `activeIndex = tabberState[tabberOid] ?? 0` (`:96`). Configs for tabbers no longer in the layout are ignored (`filterTabbersConfigByLayout`, `:73`). The hook injects `customOptions.activeTab` and `customOptions.onTabSelected` into each tabber widget (`:185-197`) and returns a `WidgetPanelLayoutManager` named `'tabber-buttons'` (`:244`) that sets `cell.hidden` (`:223-233`). Selected tabs live in `useSyncedState` seeded from `customOptions.activeTab` (`:166-169`); `TabberButtonsWidget` calls only `onTabSelected` (`widgets/components/tabber-buttons-widget/tabber-buttons-widget.tsx:204`), so a tab change is runtime state and is not persisted.

Duplicate (`use-duplicate-widget-menu-item.ts`). Adds header menu item `WidgetHeaderMenuTargets.DuplicateWidget` (`'widget-header-menu-duplicate-widget'`), caption `widgetHeader.menu.duplicateWidget`, to every widget except `WIDGET_TYPES_WITHOUT_DUPLICATE = ['filter', 'narrative']` (`:62`). On click: clone with id `${widgetId}-copy-${uuid()}` (`:120`), insert a cell in the same row splitting the original's `widthPercentage` in half (`duplicate-widget-utils.ts:52-62`), copy `widgetsOptions[id]` and `config.tabbers[id]`. With `persistence` it awaits `persistence.addWidget(clone, layout, widgetOptions, tabberConfig)` and adopts the _returned_ widget/layout/options/tabber config (server-assigned id, `:129-148`); without it, local setters only (`:153-158`). `addWidget` dispatches `UseDashboardModelActionType.ADD_WIDGET` (`persistence/persistence-manager.ts:32-33`).

Rename (`use-widget-renaming.ts`). Sets `config.header.title.editing.enabled = true` on every widget (`:73-83`); for `chart | pivot | filter | narrative | custom` widgets (the ones whose `onChange` carries `WidgetChangeEvent`, `:12-33`) wraps `onChange` so `event.type === 'title/changed'` also calls `persistence.updateWidget(widget.id, { title })` before forwarding (`:86-101`). `updateWidget` dispatches `UseDashboardModelActionType.UPDATE_WIDGET` (`persistence-manager.ts:50-54`). The "Rename widget" menu item itself (`WidgetHeaderMenuTargets.RenameWidget`) is rendered by the widget header, not by this hook.

CSV / Excel (`use-widget-csv-download.ts`, `use-widget-excel-download.ts`). For `chart | pivot | custom` widgets only, copies the dashboard flag into `widget.config.actions.downloadCsv.enabled` / `downloadExcel.enabled` unless the widget already set it (`:31-39`). The widgets then add menu items `WidgetHeaderMenuTargets.DownloadCsv` / `DownloadExcel` (`widgets/hooks/use-with-csv-download-menu-item.ts:30`, `use-with-excel-download-menu-item.ts:29`). CSV runs `useExecuteCsvQuery` → `QueryClient.executeCsvQuery` (`sdk-query-client/src/query-client.ts:116`) → `${jaqlUrl}/csv` (`query-api-dispatcher.ts:330`). Excel posts the JAQL to `RestApi.exportJaqlToXlsx` → `api/v1/export/jaql/xlsx` (`infra/api/rest-api.ts:393-394`, called from `use-execute-excel-query.ts:101`).

Updates persistence (`use-widget-updates-persistence.ts`). A "widget update" is a `WidgetPropsUpdate` (`update-types.ts:15-46`): `title?`, `styleOptions?.navigator?.scrollerLocation`, `styleOptions?.columns?.widths`, opaque extra `styleOptions` keys and `customOptions?` for custom widgets. `wireWidget` (`:126-199`) injects an emitter into: chart `styleOptions.navigator.onScrollerChange` (`:144-147`), resizable table `styleOptions.columns.onColumnsResize` (`:163-166`, eligibility `isResizableTableChartWidget :30`), and custom-widget `onChange`, translating the `visualizationState/changed` event's `VisualizationStateUpdate` payload → `WidgetPropsUpdate` (`:179-195`). Each injected handler then calls the widget's incoming callback synchronously with the same arguments (`:127-130`) — the custom branch forwards every event, `title/changed` included — so consumer callbacks keep firing inside a composed dashboard. `emit` (`:96-116`) applies the update optimistically through `applyOptimistic` (`:276`), deep-merges it into a per-widget pending map, and debounces `persistence.updateWidget(oid, pending)` by `DEBOUNCE_MS = 500` (`:46`) per widget id; failures are logged, local state is not rolled back. When `persistence` changes identity, cleanup cancels the timers and clears the pending map without calling `updateWidget` (`:86-94`), so a queued edit stays applied locally but is never persisted. See [persistence-manager](./persistence-manager.md) for when that identity changes.

Filters panel flag (`use-filters-panel-collapsed-state.tsx`). `[isCollapsed, set]`; when `shouldUseLocalStorage` the initial value comes from `localStorage` and every set writes `'true' | 'false'` back (`:15-30`). `Dashboard` passes `config.filtersPanel.collapsedInitially` and `persistCollapsedStateToLocalStorage` (`dashboard.tsx:168-171`) and emits `'filtersPanel/collapse/changed'` on toggle (`:174-178`).

## How it connects

- Gates (`use-composed-dashboard.tsx:279-284`, `:299-304`): duplicate and rename require `editMode.enabled && isEditing && !applyChangesAsBatch.enabled && <feature>.enabled`; CSV/Excel read `config.widgetsPanel.actions.*.enabled` (`:311-324`). Config shapes in `types.ts:250-300`, `:319-420`; permission-derived defaults in [dashboard-model](./dashboard-model.md).
- Both duplicate and rename and the updates hook write through `DashboardPersistenceManager` (`persistence/types.ts:17`, `@sisenseInternal`) — see [persistence-manager](./persistence-manager.md) and the reducer actions in [dashboard-model-reducer](./dashboard-model-reducer.md).
- The tabber's layout manager is the only manager fed to `useWidgetsLayoutManagement` (`:366-369`, [editable-layout](./editable-layout.md)); `withNarrativeSiblings` then restricts narrative inputs to visible cells (`:374`).
- Header menu ids are the public `WidgetHeaderMenuTargets` constants (`public-api/public.ts:146`) so hosts can reposition or remove these items; see [dashboard-header](./dashboard-header.md) for the dashboard-level analogue.

## Invariants and traps

1. Order matters: common filters run _after_ duplicate/rename/download so clones and renamed widgets are connected; updates persistence runs _before_ the tabber so the tabber's `customOptions` spread (`use-tabber.ts:186-196`) keeps the custom-widget `onChange` wrapper intact.
2. Duplicate must adopt the server-returned id (`use-duplicate-widget-menu-item.ts:139-148`); the temp `-copy-` id is never valid for persistence, and layout, options and tabber config all have to be re-keyed together.
3. Rename wraps `onChange` only for change-event-capable widget types (`use-widget-renaming.ts:86`), custom included: a custom widget's `onChange` is a `CustomWidgetChangeEvent` channel (`widgets/change-events.ts:151`), and `CustomWidget` adapts the plugin's `VisualizationStateUpdate` into a `visualizationState/changed` event (`custom-widget.tsx:76`). Updates persistence runs later and wraps that `onChange` instead of replacing it, so `title/changed` still reaches the rename wrapper.
4. `debounce` alone keeps the last call's arguments — the pending-map deep merge (`use-widget-updates-persistence.ts:100`, `mergeUpdates :205`) is what preserves two fields emitted in one window; do not replace it with plain debounce.
5. `useWidgetUpdatesPersistence` and `useWidgetRenaming` are fire-and-forget by design (`.catch` + `console.error`), consistent with `DashboardPersistenceManager.updateWidget`'s contract (`persistence/types.ts:64-67`); the reducer applies the update before the REST call.
6. Widget-level `config.actions.download*.enabled` beats the dashboard flag (`use-widget-csv-download.ts:39`), so a dashboard cannot force-disable a widget that opted in.
7. `useFiltersPanelCollapsedState` reads `localStorage` synchronously on every render (`:15`); SSR or storage-blocked contexts need the flag left `false`.
8. `isVisible` treats a widget referenced by two tabbers as hidden if _either_ hides it (`use-tabber.ts:94-109`); overlapping tabber configs are AND-ed, not OR-ed.

## Related

- [Composed dashboard](./composed-dashboard.md) - the hook chain and its gates
- [Persistence manager](./persistence-manager.md) - `addWidget` / `updateWidget` contract these hooks call
- [Dashboard model reducer](./dashboard-model-reducer.md) - `ADD_WIDGET` / `UPDATE_WIDGET` handling
- [Editable layout](./editable-layout.md) - layout managers and the batch-mode coupling
- [Dashboard header](./dashboard-header.md) - `useDashboardHeaderMenuItem`, the dashboard-level menu counterpart
