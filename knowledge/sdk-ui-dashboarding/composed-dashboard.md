---
type: Module
title: useComposedDashboard
description: The hook that turns raw DashboardProps into coordinated widget props — common filters, drilldown/JTD menus, widget actions, tabber layout, persistence and module customizations — and exposes setters for filters and layout.
resource: packages/sdk-ui/src/domains/dashboarding/use-composed-dashboard.tsx
tags: [sdk-ui, dashboarding, hook]
---

## Purpose

`useComposedDashboard` is the composition layer under `Dashboard`: it keeps the inner widget/layout/options/config state, runs every widget through a fixed pipeline of prop transformers, and returns the composed `dashboard` plus `setFilters` / `setWidgetsLayout`. Headless consumers call it directly to render widgets with their own markup while keeping cross-filtering, drilldown and JTD.

## Entry point

| What             | Where                                                                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hook (public)    | `useComposedDashboard` — `packages/sdk-ui/src/domains/dashboarding/use-composed-dashboard.tsx:586` (wraps internal with `withTracking('useComposedDashboard')`, `:590`)                          |
| Hook (@internal) | `useComposedDashboardInternal` — `use-composed-dashboard.tsx:168`; re-exported from `packages/sdk-ui/src/modules/internal/public-api/internal.ts:106`; used by `Dashboard` (`dashboard.tsx:247`) |
| Type (public)    | `ComposableDashboardProps` — `use-composed-dashboard.tsx:53`                                                                                                                                     |
| Type (public)    | `UseComposedDashboardOptions` — `use-composed-dashboard.tsx:112`                                                                                                                                 |
| Type (public)    | `ComposedDashboardResult<D>` — `use-composed-dashboard.tsx:144`                                                                                                                                  |
| Menu merge       | `combineWidgetMenus` (module-private) — `use-composed-dashboard.tsx:66`, fed to `useCombinedMenu` (`:209`)                                                                                       |

## Contract

```ts
type ComposableDashboardProps = Pick<
  DashboardProps,
  'filters' | 'widgets' | 'widgetsOptions' | 'layoutOptions' | 'config'
>; // :53

type UseComposedDashboardOptions = {
  onFiltersChange?: (filters: Filter[] | FilterRelations) => void; // @internal        :116
  onWidgetChangeEvent?: (widgetId: string, event: WidgetChangeEvent) => void; // @internal    :124
  persistence?: DashboardPersistenceManager; // @sisenseInternal :130
  isEditing?: boolean; // @internal @deprecated runtime edit flag       :138
};

type ComposedDashboardResult<D extends ComposableDashboardProps | DashboardProps> = {
  dashboard: D; // :146
  setFilters: (filters: Filter[] | FilterRelations) => void; // :149
  setWidgetsLayout: (newLayout: WidgetsPanelLayout) => void; // :152
  filterWidgetLinkedIds: readonly string[]; // @internal :160
};
```

`useComposedDashboard(initialDashboard, options?)` and `useComposedDashboardInternal` share the signature; the only difference is tracking. `Dashboard` uses the internal one so a dashboard render is tracked once, as `Dashboard`, not twice.

### Inner state (all `useSyncedState`, re-synced when the prop changes)

| State                               | Seeded from                                                              | Line           |
| ----------------------------------- | ------------------------------------------------------------------------ | -------------- |
| `widgetsFromProps` → `innerWidgets` | `widgets`                                                                | `:180`, `:182` |
| `innerWidgetsLayout`                | `layoutOptions.widgetsPanel` or `getDefaultWidgetsPanelLayout(widgets)`  | `:184`         |
| `innerWidgetsOptions`               | `widgetsOptions ?? {}`                                                   | `:188`         |
| `innerConfig`                       | `config` (only `tabbers` is ever written, via `setTabbersConfig` `:199`) | `:192`         |

### Widget pipeline (order is load-bearing)

| #   | Step                                                                                                                                        | Hook / transformer                                                   | Line       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------- |
| 1   | Change detection: widget `onChange` events → `widgetChangeEventToDelta` merged into `innerWidgets`; forwards event to `onWidgetChangeEvent` | `useWithChangeDetection`                                             | `:249-274` |
| 2   | "Duplicate widget" menu item (gated, see trap 2)                                                                                            | `useDuplicateWidgetMenuItem`                                         | `:285`     |
| 3   | "Rename widget" menu item (gated)                                                                                                           | `useWidgetRenaming`                                                  | `:305`     |
| 4   | "Download CSV" menu item                                                                                                                    | `useWidgetCsvDownload`                                               | `:313`     |
| 5   | "Download Excel" menu item                                                                                                                  | `useWidgetExcelDownload`                                             | `:320`     |
| 6   | Common filters: pass 1 `connectToWidgetProps` (filters, highlights, FilterWidget link), pass 2 `withExcludedDateLevels`                     | `useCommonFilters` (`:223`)                                          | `:326-348` |
| 7   | Jump-to-dashboard handlers / header icon                                                                                                    | `useJtdInternal` (`:241`) → `connectToWidgetPropsJtd`                | `:350-352` |
| 8   | Scroll/customOptions write-back to persistence                                                                                              | `useWidgetUpdatesPersistence`                                        | `:354`     |
| 9   | Tabber: hide widgets of inactive tabs, contribute a layout manager                                                                          | `useTabber`                                                          | `:360`     |
| 10  | Final layout = inner layout run through layout managers                                                                                     | `useWidgetsLayoutManagement`                                         | `:365`     |
| 11  | Narrative widgets get their sibling widgets (layout-restricted)                                                                             | `withNarrativeSiblings(finalWidgetsLayout)`                          | `:373`     |
| 12  | Module customizations over the whole `DashboardProps`, in registration order                                                                | `useModuleApiRegistry(DashboardModule, 'customizations')` → `reduce` | `:515-531` |

Widget context menus from steps 6 and 7 plus drilldown are merged by `combineWidgetMenus` (`:66-106`): one points-selection section (cross-filtering wins over drilldown, `:78`), then cross-filtering items, drilldown items, JTD items.

### Side APIs

- `addWidget` (`:457-507`): resolves `dataSource` from `[dashboard.defaultDataSource, app.defaultDataSource]` (`withResolvedWidgetDataSource`, `utils.ts:107`), appends a full-width row (`withWidgetAppendedToPanelLayout`, `utils.ts:79`); with `persistence` it awaits `persistence.addWidget` and stores the server-returned widget/layout/options (`:476-493`).
- `stateApi: DashboardStateApi = { addWidget, setFilters, setWidgetsLayout }` (`:509`) is the second argument to every customization — see [Dashboard module](./dashboard-module.md).
- FilterWidget deletion effect (`:421-450`): when a FilterWidget id disappears from the pre-tabber `innerWidgetsLayout`, its linked dashboard filter (resolved by `resolveFilterWidgetFilter`) is removed via `setFilters`.

## How it connects

- Caller: `Dashboard` (`dashboard.tsx:247`) passes `config: propConfig` (raw) and `isEditing` and consumes `dashboard.{filters,widgets,layoutOptions,config,title,defaultDataSource,styleOptions}` — see [Dashboard and DashboardById](./dashboard-components.md).
- Filters state lives inside `useCommonFilters` (`common-filters/use-common-filters.tsx:36`) — see [Common filters](./common-filters.md).
- JTD: `useJtdInternal` (`hooks/use-jtd.ts:126`) — see [Jump to dashboard](./jump-to-dashboard.md).
- Steps 2–5, 8, 9: [Widget actions](./widget-actions.md). Persistence contract: [Persistence manager](./persistence-manager.md).
- Step 12 reads the `dashboard` module registry — see [Dashboard module](./dashboard-module.md).

## Invariants and traps

1. Feature gating reads `initialDashboard.config` (raw props), not `innerConfig` and not the defaults-merged config (`:278-283`, `:299-304`, `:311`, `:318`); a module customization that flips `config.widgetsPanel.actions` changes the rendered container config only (`dashboard.tsx:291`), never the pipeline.
2. Duplicate and rename are disabled whenever `applyChangesAsBatch.enabled` is true (`:276-277`, `:299-304`) because the undo history cannot replay them; `isEditing` from options wins over `config.widgetsPanel.editMode.isEditing` (`:278`).
3. Customizations run on every render, un-memoized, inside `try/catch` (`:524-531`): a throwing customization is logged and skipped; a non-idempotent one accumulates (e.g. appends a header item each render).
4. `widgetsFromProps` is a `useSyncedState` of `widgets` (`:180`): an update that passes a structurally identical widgets array is ignored (`:178-179`).
5. Deletion detection must stay on the pre-tabber `innerWidgetsLayout`, not `finalWidgetsLayout` — tab switching only reshapes the latter and would otherwise look like a deletion (`:402-407`).
6. `addWidget` with persistence is fire-and-forget: the promise is `void`-ed and failures are only `console.error`-ed (`:476-496`); local state is updated only after the server round-trip.
7. `isJumpToDashboardMenu` compares against the literal `'jump-to-dashboard-menu'` (`:109`) while its siblings use `MenuIds` constants (`:59`, `:63`) — the JTD menu id is defined in [jump-to-dashboard](./jump-to-dashboard.md) and the two must stay in sync.
8. The result is `customizedDashboard as D` (`:534`) and widget filters are read via `widget as { filters?: Filter[] }` (`:236`) — the generic is a convenience for callers, not a guarantee that `ComposableDashboardProps` input yields no extra fields.

## Related

- [Dashboard and DashboardById](./dashboard-components.md) - the component that drives this hook
- [Common filters](./common-filters.md) - `useCommonFilters` and `connectToWidgetProps`
- [Widget actions](./widget-actions.md) - tabber, duplicate, rename, downloads, widget-updates persistence
- [Jump to dashboard](./jump-to-dashboard.md) - `useJtdInternal`
- [Dashboard module](./dashboard-module.md) - `DashboardCustomization` and `DashboardStateApi`
- [Filter relations](../sdk-data/filter-relations.md) - why `commonFilters` may be a relations tree, not an array (`:243`, `getFiltersArray` `:341`)
