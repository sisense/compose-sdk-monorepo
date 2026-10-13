# sdk-ui dashboarding

Descriptive map of `packages/sdk-ui/src/domains/dashboarding` — the React dashboard layer of
`@sisense/sdk-ui`: the `Dashboard` / `DashboardById` components, the hook that composes widget
props, the dashboard model and its persistence, and the per-dashboard features (common filters,
editable layout, header, jump-to-dashboard, widget actions). One concept doc per subsystem;
start with the overview.

## Orientation

- [Dashboarding overview](overview.md) - Domain purpose, module map, public-API level per export, cross-cutting invariants.

## Components and composition

- [Dashboard and DashboardById](dashboard-components.md) - Component tree, `DashboardConfig` family, `onChange` event union.
- [useComposedDashboard](composed-dashboard.md) - The hook that wires filters, layout, JTD, tabber, header and persistence into widget props.
- [Dashboard header](dashboard-header.md) - Header config, targets, header-item transforms, `dashboardHelpers`.
- [Dashboard module](dashboard-module.md) - The `dashboard` module and its `customizations` middleware registry.

## Model and persistence

- [Dashboard model and DTO translation](dashboard-model.md) - `DashboardModel`, fetch helpers, `dashboardModelTranslator`, permission-derived config.
- [Dashboard model reducer and persistence hook](dashboard-model-reducer.md) - `useDashboardModel`, action types, persist middleware, `useDashboardPersistence`.
- [Dashboard persistence manager](persistence-manager.md) - `createDashboardPersistenceManager`, update types, deep-merge.

## Features

- [Common filters and cross-filtering](common-filters.md) - Dashboard filters to widget props, selection to filter, cascading, filter relations.
- [Editable layout](editable-layout.md) - dnd-kit layout editing, resize, edit mode with undo history.
- [Jump to dashboard](jump-to-dashboard.md) - JTD config normalization, filter transfer rules, handlers, modal.
- [Widget actions](widget-actions.md) - Tabber, duplicate, rename, CSV/Excel download, widget-updates persistence.
