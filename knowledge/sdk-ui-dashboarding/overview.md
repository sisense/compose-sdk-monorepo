---
type: Module
title: sdk-ui dashboarding overview
description: Map of the dashboarding domain of @sisense/sdk-ui — the Dashboard components, the hook that composes widget props, the dashboard model with its persistence paths, and the per-dashboard features built on top.
resource: packages/sdk-ui/src/domains/dashboarding
tags: [sdk-ui, dashboarding, overview]
---

## Purpose

`packages/sdk-ui/src/domains/dashboarding` turns a set of widgets, filters and a layout into a
rendered dashboard: `Dashboard` renders props the caller owns, `DashboardById` fetches a
Fusion dashboard into a `DashboardModel` and persists changes back. Everything in between is
one hook, `useComposedDashboard`, that decorates each widget's props with the dashboard-level
features (common filters, edit-mode layout, jump-to-dashboard, tabber, header, persistence).

## Entry point

| What        | Where                                                                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Barrel      | `packages/sdk-ui/src/domains/dashboarding/index.ts` — components, composed hook, persistence manager, hooks, types                      |
| Components  | `Dashboard` — `dashboard.tsx:71`; `DashboardById` — `dashboard-by-id.tsx:47` (both wrapped in `asSisenseComponent`)                     |
| Composition | `useComposedDashboard` — `use-composed-dashboard.tsx:586`; `useComposedDashboardInternal` — `:168`                                      |
| Model       | sub-barrel `dashboard-model/index.ts`; reducer under `dashboard-model/use-dashboard-model/`                                             |
| Persistence | `DashboardPersistenceManager` — `persistence/types.ts:17`; `useWidgetUpdatesPersistence` — `hooks/use-widget-updates-persistence.ts:74` |
| Module      | `DASHBOARD_MODULE_NAME = 'dashboard'` — `dashboard-module/dashboard-module.ts:6`                                                        |
| Defaults    | `DEFAULT_DASHBOARD_CONFIG`, `DEFAULT_DASHBOARD_BY_ID_CONFIG` — `constants.ts`                                                           |
| Theme       | `useDashboardTheme` (@alpha) — `use-dashboard-theme.tsx:60`                                                                             |

Public-API level is decided per symbol by which barrel re-exports it: `public.ts`, `beta.ts` or
`alpha.ts` under `packages/sdk-ui/src/public-api/`, or the barrel of a non-public entry point
(`modules/internal/public-api/internal.ts`, `modules/sisense-internal/public-api/sisense-internal.ts`).
In this domain: the two components, the composed hook, the config and event
types, `DashboardHeaderTargets`, the JTD config types, `useJtdWidget`, `dashboardModelTranslator`
and `dashboardHelpers` are **public**; `DashboardWidgetDateLevelChangedEvent` is **@beta**;
`useDashboardTheme` is **@alpha**; `useComposedDashboardInternal`, `useDashboardModel`,
`getDashboardModel(s)` are **@internal** (consumed by the Vue composable and the Angular
service through `@sisense/sdk-ui-preact/internal`), and `getDashboardModel` and
`useDashboardModel` are also **@sisenseInternal**; the `dashboard` module, `withHeaderItem`,
`createDashboardPersistenceManager`, `useDashboardPersistence` and the reducer action enum are
**@sisenseInternal**. Each concept doc lists the level of every symbol it names.

## Module map

| Concept doc                                                 | Source                                                            | What it covers                                                                 |
| ----------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [Dashboard and DashboardById](./dashboard-components.md)    | `dashboard.tsx`, `dashboard-by-id.tsx`, `components/`, `types.ts` | Component tree, `DashboardConfig` family with defaults, `onChange` event union |
| [useComposedDashboard](./composed-dashboard.md)             | `use-composed-dashboard.tsx`                                      | The 12-step widget-props pipeline, options and result contract                 |
| [Dashboard header](./dashboard-header.md)                   | `components/dashboard-header/`, `dashboard-helpers.ts`            | Header targets, item resolution order, `dashboardHelpers`, `withHeaderItem`    |
| [Dashboard module](./dashboard-module.md)                   | `dashboard-module/`                                               | `customizations` middleware registry and how `Dashboard` applies it            |
| [Dashboard model and DTO translation](./dashboard-model.md) | `dashboard-model/` (except `use-dashboard-model/`)                | `DashboardModel`, REST fetch helpers, translator, permission-derived config    |
| [Dashboard model reducer](./dashboard-model-reducer.md)     | `dashboard-model/use-dashboard-model/`                            | Action enum, persist middleware, `useDashboardPersistence`                     |
| [Dashboard persistence manager](./persistence-manager.md)   | `persistence/`                                                    | `addWidget` / `updateWidget` contract, update kinds, `deepMerge` semantics     |
| [Common filters and cross-filtering](./common-filters.md)   | `common-filters/`                                                 | Dashboard filters to widget props, selection to filter, cascading, relations   |
| [Editable layout](./editable-layout.md)                     | `components/editable-layout/`, layout and edit-mode hooks         | dnd-kit drop model, resize, edit mode with undo history                        |
| [Jump to dashboard](./jump-to-dashboard.md)                 | `hooks/jtd/`, `use-jtd*.ts`, `components/jtd-dashboard.tsx`       | Config normalization, filter transfer rules, handlers, modal                   |
| [Widget actions](./widget-actions.md)                       | `hooks/` (tabber, duplicate, rename, downloads, updates)          | Menu-item hooks, tabber visibility rule, download and persistence paths        |

## Cross-cutting invariants

1. **Widget decoration order is load-bearing.** `useComposedDashboardInternal` applies its
   steps as a fixed sequence of hook calls (change detection, duplicate, rename, CSV, Excel,
   common filters, JTD, widget-updates persistence, tabber, layout managers, narrative
   siblings, module customizations). Common filters run after duplicate so clones are
   connected; updates-persistence runs before tabber so the custom-widget `onChange` wrapper
   survives the tabber's `customOptions` spread; module customizations run last, un-memoized,
   so their output is what `Dashboard` renders but never feeds back into the hook's gating.
   See [composed-dashboard](./composed-dashboard.md) and [dashboard-module](./dashboard-module.md).
2. **Config defaults are applied in `Dashboard`, not in the hook.** `useDefaults` runs twice in
   `dashboard.tsx:88` and `:291`; the hook receives the raw prop config and gates
   duplicate/rename/download on it. `header` and `tabbers` are deliberately outside
   `DEFAULT_DASHBOARD_CONFIG` (`constants.ts:11`). For `DashboardById` precedence is
   `code defaults → asPermissionDerivedConfig(userAuth) → props`
   (`dashboard-model-translator.ts:51`). See [dashboard-components](./dashboard-components.md)
   and [dashboard-model](./dashboard-model.md).
3. **Batch edit mode disables immediate-persist features.** With `applyChangesAsBatch.enabled`
   (default `true`), layout changes and deletions are buffered until Apply and the
   duplicate/rename menu items are gated off, because the undo history cannot revert them.
   See [editable-layout](./editable-layout.md) and [widget-actions](./widget-actions.md).
4. **Two persistence paths, chosen by event kind.** Of the `DashboardChangeEvent` types,
   `DashboardById` routes only `'filters/updated'` and `'widgetsPanel/layout/updated'` through
   the reducer (`use-dashboard-model-utils.ts:16`), and a layout update that drops widgets also deletes them on the server; per-widget writes (duplicate, rename,
   scroller, column widths, custom options) go through `DashboardPersistenceManager`,
   fire-and-forget with `console.error`. The reducer path runs the persist middleware
   **before** dispatch (`use-dashboard-persistence.ts:172`), so REST bodies are built from the
   pre-reducer snapshot and there is no reducer-level optimistic insert. See
   [dashboard-model-reducer](./dashboard-model-reducer.md) and
   [persistence-manager](./persistence-manager.md).
5. **Fusion PATCH replaces whole objects.** A widget patch must carry full `options`, `style`
   and `customOptions`, rebuilt from `widgetsOptions[oid].partialDtoOptions` snapshotted at
   load; dashboard-level widget context (`widgetsOptions[id]`, `config.tabbers[id]`) lives
   outside `WidgetModel` and must be re-projected onto the DTO on add/duplicate. See
   [dashboard-model](./dashboard-model.md) and [persistence-manager](./persistence-manager.md).
6. **Filter identity is `config.guid`** across the domain: common filters reuse the guid of an
   existing same-attribute filter (`common-filters/utils.ts:51`), filter-widget writes replace
   under a guid, cascading reassembly keys on the original guid; JTD-generated filters get fresh
   guids on purpose because they target another dashboard. Continues
   [sdk-data filter relations](../sdk-data/filter-relations.md). See
   [common-filters](./common-filters.md) and [jump-to-dashboard](./jump-to-dashboard.md).
7. **WAT authentication disables persistence** (`use-dashboard-model-utils.ts:43`) and forces
   per-widget GETs on load. See [dashboard-model](./dashboard-model.md).
8. **Persistence identity churn can drop pending widget updates.** `DashboardById` memoises the
   manager on `dispatchChanges` (`dashboard-by-id.tsx:71-73`), and `dispatchChanges` depends on
   the local dashboard (`use-dashboard-persistence.ts:188-197`). A model update that changes the
   local dashboard therefore yields a new manager, and `useWidgetUpdatesPersistence` cancels its
   500 ms debouncers and discards pending updates on that change. An update scheduled inside the
   window is lost only when such a model update lands first, not on every dispatch. Read from
   code, not yet confirmed by a reproduction.
   See [persistence-manager](./persistence-manager.md).

## Known deviations from repo patterns

Recorded so nobody copies them; each concept doc carries the `file:line`.

- `'jump-to-dashboard-menu'` is a bare string literal repeated in five files instead of a
  `MenuIds` entry.
- `applyRightClickNavigation` and `useJtdWidget` mutate spread copies in place; the same
  registration pattern in `useCommonFilters` is safe only because it operates on a `cloneDeep`.
- `useFiltersPanelCollapsedState` reads `localStorage` synchronously during render.
- The dev docs under `persistence/__dev-docs__/` describe a `patchWidget` method and a
  `PATCH_WIDGET` action that do not exist; the manager has only `addWidget` and `updateWidget`.
- The `hooks/index.ts` comment says `applyJtdToWidget` and `normalizeToJtdConfig` are used by
  the Vue and Angular adapters; they are not, and neither is re-exported from a public-api
  barrel.

## Related

- [Monorepo architecture invariants](../architecture/overview.md) - the layer model; this
  domain sits in the top UI layer and is consumed by the framework wrappers via `sdk-ui-preact`.
- [sdk-data filters](../sdk-data/filters.md) - the filter classes the common-filters layer
  creates and matches.
