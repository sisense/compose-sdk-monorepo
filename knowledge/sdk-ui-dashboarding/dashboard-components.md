---
type: Component
title: Dashboard and DashboardById
description: The two dashboard React components, the container/content/header tree they render, the DashboardConfig family that drives them, and the onChange event union they emit.
resource: packages/sdk-ui/src/domains/dashboarding
tags: [sdk-ui, dashboarding, component]
---

## Purpose

`Dashboard` renders a fully composed dashboard from `DashboardProps` (widgets, filters, layout, config) and owns the view/edit-mode and filters-panel UI state; `DashboardById` fetches a Fusion dashboard by OID, translates it to `DashboardProps`, and wires `onChange` and a persistence manager back into the dashboard model. Everything about widget-prop composition is delegated to [useComposedDashboard](./composed-dashboard.md).

## Entry point

| What      | Where                                                                                                                                                                                                                                                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component | `Dashboard` (public) — `packages/sdk-ui/src/domains/dashboarding/dashboard.tsx:71`                                                                                                                                                                                                                                                          |
| Component | `DashboardById` (public) — `packages/sdk-ui/src/domains/dashboarding/dashboard-by-id.tsx:47`                                                                                                                                                                                                                                                |
| Component | `DashboardContainer` (not exported) — `packages/sdk-ui/src/domains/dashboarding/components/dashboard-container.tsx:61`                                                                                                                                                                                                                      |
| Component | `ContentPanel` (not exported) — `packages/sdk-ui/src/domains/dashboarding/components/content-panel.tsx:129`                                                                                                                                                                                                                                 |
| Component | `HorizontalCollapse` (not exported) — `packages/sdk-ui/src/domains/dashboarding/components/horizontal-collapse.tsx:66`                                                                                                                                                                                                                      |
| Component | `EditToggle` / `FilterToggle` (not exported) — `components/toolbar/edit-toggle.tsx:46`, `components/toolbar/filter-toggle.tsx:37`                                                                                                                                                                                                           |
| Types     | `DashboardProps` `:494`, `DashboardByIdProps` `:146`, `DashboardConfig` `:421`, `DashboardByIdConfig` `:458`, `WidgetsPanelConfig` `:229`, `EditModeConfig` `:319`, `DashboardFiltersPanelConfig` `:197`, `DashboardLayoutOptions` `:481`, `DashboardChangeEvent` `:135` (all public) — `packages/sdk-ui/src/domains/dashboarding/types.ts` |
| Types     | `TabbersConfig` `:48`, `TabberConfig` `:37`, `TabberTabConfig` `:27` (public) — `packages/sdk-ui/src/domains/dashboarding/hooks/use-tabber.ts`                                                                                                                                                                                              |
| Defaults  | `DEFAULT_DASHBOARD_CONFIG` `:10`, `DEFAULT_DASHBOARD_BY_ID_CONFIG` `:81` (not exported) — `packages/sdk-ui/src/domains/dashboarding/constants.ts`                                                                                                                                                                                           |
| Helpers   | `isDashboardHeaderVisible` `:37`, `getDefaultWidgetsPanelLayout` `:59` — `packages/sdk-ui/src/domains/dashboarding/utils.ts`                                                                                                                                                                                                                |

## Contract

### Component tree

```text
Dashboard (asSisenseComponent, shouldHaveOwnModalRoot)          dashboard.tsx:71
└─ ThemeProvider(themeSettings from useDashboardThemeInternal)   dashboard.tsx:290,351
   └─ DashboardContainer                                         dashboard-container.tsx:61
      ├─ DashboardHeader  (only if isDashboardHeaderVisible)     :107  → see dashboard-header.md
      ├─ ContentPanelWrapper  data-testid="csdk-widgets-panel"   :108
      │  ├─ EditableLayout   (editMode === true)                 :110  → see editable-layout.md
      │  └─ ContentPanel     (editMode === false) → Widget       :120, content-panel.tsx:187
      └─ HorizontalCollapse (only if filtersPanel.visible !== false)  :126
         └─ FiltersPanel (240px, panel borderWidth 0)            :143
```

`DashboardById` wraps `Dashboard` in `LoadingOverlay` (`dashboard-by-id.tsx:104`) and adds: fetch + persistence via `useDashboardModelInternal` (`:52`), `onChange` → `dashboardChangeEventToUseDashboardModelAction` → `dispatchChanges` (`:60-68`), a `DashboardPersistenceManager` from `createDashboardPersistenceManager(dispatchChanges)` passed only when `config.persist` (`:70-73`, `:108`), `withNarrativeRequestOptions({ sharedMode })` on widgets (`:83`), and a three-layer config merge `propConfig (withoutUndefinedDerivedFlags) > toDashboardProps(dashboard).config > DEFAULT_DASHBOARD_BY_ID_CONFIG` (`:91-101`). A load error throws `TranslatableError('errors.dashboardLoadFailed')` (`:76`).

### Config shape (field → type → default)

| Type / field                                                          | Type                                                                           | Default                                                                                                 |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `DashboardConfig.filtersPanel`                                        | `DashboardFiltersPanelConfig`                                                  | see below                                                                                               |
| `DashboardConfig.header`                                              | `DashboardHeaderConfig`                                                        | no defaults merged (excluded in `constants.ts:11`)                                                      |
| `DashboardConfig.toolbar.visible`                                     | `boolean` (**deprecated**, use `header.visible`)                               | `true`                                                                                                  |
| `DashboardConfig.widgetsPanel`                                        | `WidgetsPanelConfig`                                                           | see below                                                                                               |
| `DashboardConfig.tabbers`                                             | `TabbersConfig = Record<WidgetId, { tabs: { displayWidgetIds: string[] }[] }>` | none                                                                                                    |
| `DashboardByIdConfig.persist`                                         | `boolean`                                                                      | `false`                                                                                                 |
| `DashboardByIdConfig.sharedMode`                                      | `boolean` (@internal)                                                          | `false`                                                                                                 |
| `DashboardFiltersPanelConfig.visible`                                 | `boolean`                                                                      | `true`                                                                                                  |
| `…collapsedInitially`                                                 | `boolean`                                                                      | `false`                                                                                                 |
| `…persistCollapsedStateToLocalStorage`                                | `boolean`                                                                      | `false` (key `csdk_dashboard_filters_panel_collapsed`, `hooks/use-filters-panel-collapsed-state.tsx:6`) |
| `…showFilterIconInToolbar`                                            | `boolean`                                                                      | `false`                                                                                                 |
| `…actions.{addFilter,editFilter,deleteFilter,reorderFilters}.enabled` | `boolean` (inherited from `FiltersPanelConfig`)                                | `false`                                                                                                 |
| `…actions.lockFilter.enabled`                                         | `boolean`                                                                      | `true` in `Dashboard`, `false` in `DashboardById` (`constants.ts:93`)                                   |
| `…actions.{toggleFilter,expandFilter}.visible`                        | `boolean`                                                                      | `true`                                                                                                  |
| `WidgetsPanelConfig.responsive`                                       | `boolean`                                                                      | `false`                                                                                                 |
| `WidgetsPanelConfig.editMode`                                         | `EditModeConfig`                                                               | see below                                                                                               |
| `WidgetsPanelConfig.actions.{downloadCsv,downloadExcel}.enabled`      | `boolean`                                                                      | `false`                                                                                                 |
| `EditModeConfig.enabled`                                              | `boolean`                                                                      | `false`                                                                                                 |
| `EditModeConfig.isEditing`                                            | `boolean`                                                                      | absent → uncontrolled (internal `mode` state, `dashboard.tsx:93-99`)                                    |
| `EditModeConfig.applyChangesAsBatch.enabled`                          | `boolean`                                                                      | `true`                                                                                                  |
| `EditModeConfig.applyChangesAsBatch.historyLimit`                     | `number`                                                                       | `20`                                                                                                    |
| `EditModeConfig.showDragHandleIcon`                                   | `boolean`                                                                      | `true`                                                                                                  |
| `EditModeConfig.deleteWidget.enabled`                                 | `boolean` (@internal)                                                          | `true`                                                                                                  |
| `EditModeConfig.{duplicateWidget,renameWidget}.enabled`               | `boolean`                                                                      | `false`                                                                                                 |

For `DashboardById`, permission-derived defaults come from `toDashboardProps` and sit between explicit props and the constants — see [Dashboard model](./dashboard-model.md).

### `onChange` event union (`types.ts:135`)

```ts
type DashboardChangeEvent =
  | { type: 'filters/updated'; payload: Filter[] | FilterRelations } // :37
  | { type: 'filtersPanel/collapse/changed'; payload: boolean } // :47
  | { type: 'widgetsPanel/layout/updated'; payload: WidgetsPanelLayout } // :63
  | { type: 'widgetsPanel/editMode/isEditing/changed'; payload: boolean } // :73
  | { type: 'widgets/deleted'; payload: string[] } // :90
  | {
      type: 'widget/dateLevelChanged';
      payload: {
        widgetId: string;
        levelJaql: {
          dim?: string;
          level?: string;
          dateTimeLevel?: string;
          bucket?: string;
        } & Record<string, unknown>;
      };
    }; // :105, @beta
```

Emit sites in `dashboard.tsx`: mode `:109`, layout + deleted `:137-146`, collapse `:174`, filters `:262`, date level `:271-279`. `DashboardById` maps only `'filters/updated'` and `'widgetsPanel/layout/updated'` to reducer actions (`dashboard-model/use-dashboard-model/use-dashboard-model-utils.ts:16-32`); the standalone `'widgets/deleted'` event is dropped. Deletions still reach the server: when a layout update removes widget ids, `transformAction` rewrites it to `UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE` (`dashboard-model/use-dashboard-model/use-dashboard-persistence.ts:88-132`) and the middleware deletes each removed widget (`persist-dashboard-model-middleware.ts:379-396`). The collapse, edit-mode and date-level events are UI-only.

## How it connects

- `Dashboard` calls `useComposedDashboardInternal` (`dashboard.tsx:247`) with `config: propConfig` (raw, not defaults-merged) and reads back `filters`, `widgets`, `layoutOptions`, `config`, `title`, `styleOptions`, `filterWidgetLinkedIds` — see [useComposedDashboard](./composed-dashboard.md).
- Built-in header items `[editModeToolbar, editToggle, filterToggle, menu]` (`dashboard.tsx:345-348`) are passed to the container, which prepends title + spacer (`dashboard-container.tsx:95-102`) — see [Dashboard header](./dashboard-header.md).
- Edit mode with undo history: `useEditModeWithHistory` (`hooks/use-edit-mode-with-history.tsx:122`), active when `editMode.enabled && applyChangesAsBatch.enabled` (`dashboard.tsx:100`) — see [Editable layout](./editable-layout.md).
- `DashboardById` → `useDashboardModelInternal` (`dashboard-model/use-dashboard-model/use-dashboard-model.ts:51`) and `createDashboardPersistenceManager` (`persistence/persistence-manager.ts:21`) — see [Dashboard model reducer](./dashboard-model-reducer.md) and [Persistence manager](./persistence-manager.md).
- `FiltersPanel` receives `dataSources` deduplicated by data-source _title_, not id (`dashboard-container.tsx:159-177`).

## Invariants and traps

1. Defaults are applied twice in `Dashboard`: `useDefaults(propConfig, …)` (`dashboard.tsx:88`) drives local toggles, and `useDefaults(composedConfig, …)` (`:291`) drives the rendered container — module customizations to `config` reach only the second. `header` and `tabbers` are excluded from `DEFAULT_DASHBOARD_CONFIG` (`constants.ts:11`), so `header.visible` undefined falls through to the deprecated `toolbar.visible` with a one-time warning (`utils.ts:37-49`).
2. `isEditing` present in `editMode` makes edit mode fully controlled: `handleModeChange` skips `setMode` and only emits the event (`dashboard.tsx:96`, `:108`).
3. In batch mode, `'widgetsPanel/layout/updated'` and `'widgets/deleted'` fire only on Apply (`dashboard.tsx:124-127`, documented at `types.ts:55-59`); with `applyChangesAsBatch.enabled: false` they fire on every change (`:157-166`).
4. `showFilterIconInToolbar` is honored only when the header is visible and the filters panel is visible (`dashboard.tsx:152-155`); it replaces the collapse arrow (`dashboard-container.tsx:82-85`, `horizontal-collapse.tsx:83`) and collapses the panel to `0px` instead of `8px` (`:60-61`).
5. `ContentPanel` drops `hidden` cells and equalizes widths of the remaining cells in that row (`content-panel.tsx:142-150`); a row renders `height: auto` only when every widget in it has auto-height enabled, otherwise auto-height is forced off per widget (`:171`, `:188`, `utils.ts:150`). Fixed heights get `+32px` for the widget header (`:83-84`).
6. `DashboardProps.persistence` is `@sisenseInternal` and `DashboardProps.id` is `@internal` (`types.ts:502`, `:536`) — public consumers get persistence only through `DashboardById`.
7. `useFiltersPanelCollapsedState` reads `localStorage` during render (`hooks/use-filters-panel-collapsed-state.tsx:15`); the stored state is shared across all dashboards.
8. `dashboard.tsx:17` imports `MenuItemSection` from `'../..'` (the package root barrel) — an upward import inside the package; use `@/props` as `use-dashboard-header-menu-item.tsx:7` does.

## Related

- [Dashboarding overview](./overview.md) - module map and public-API levels
- [useComposedDashboard](./composed-dashboard.md) - where widget props are actually composed
- [Dashboard header](./dashboard-header.md) - header items, targets and `onBeforeRender`
- [Editable layout](./editable-layout.md) - `EditableLayout`, drag/resize and the undo history
- [Dashboard model](./dashboard-model.md) - `toDashboardProps` and permission-derived config
- [Filters](../sdk-data/filters.md) - the `Filter` / `FilterRelations` carried in `filters/updated`
