---
type: Module
title: Dashboard module
description: The built-in `dashboard` module — a registry of `DashboardCustomization` middlewares that other modules contribute to and that `useComposedDashboard` applies to every dashboard's props.
resource: packages/sdk-ui/src/domains/dashboarding/dashboard-module
tags: [sdk-ui, dashboarding, module]
---

## Purpose

`DashboardModule` declares one API field, `customizations`, so that independently shipped modules can rewrite `DashboardProps` (inject header items, change config, add widgets through `DashboardStateApi`) without touching dashboard code. It is registered automatically by `SisenseContextProvider`; contributors only need to `require` it and list their middleware under `integrations.dashboard.customizations`.

## Entry point

| What                                    | Where                                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Name                                    | `DASHBOARD_MODULE_NAME = 'dashboard'` (not exported) — `packages/sdk-ui/src/domains/dashboarding/dashboard-module/dashboard-module.ts:6`                                                                                                                                                                                                   |
| Module (@sisenseInternal)               | `DashboardModule: Module<DashboardModuleApiDefinition>` — `dashboard-module.ts:32`; `modules/sisense-internal/public-api/sisense-internal.ts:92`                                                                                                                                                                                           |
| API schema (not exported)               | `DashboardModuleApiDefinition` — `dashboard-module.ts:11`                                                                                                                                                                                                                                                                                  |
| Contributor contract (@sisenseInternal) | `DashboardModuleApi = ApiContract<DashboardModuleApiDefinition>` — `dashboard-module.ts:50`; `sisense-internal.ts:93`                                                                                                                                                                                                                      |
| Middleware type (@sisenseInternal)      | `DashboardCustomization` — `dashboard-module/types.ts:62`; `sisense-internal.ts:96`                                                                                                                                                                                                                                                        |
| State API (@sisenseInternal)            | `DashboardStateApi` — `dashboard-module/types.ts:16`; `sisense-internal.ts:97`                                                                                                                                                                                                                                                             |
| Apply site                              | `useModuleApiRegistry(DashboardModule, 'customizations')` → `reduce` — `packages/sdk-ui/src/domains/dashboarding/use-composed-dashboard.tsx:515-531`                                                                                                                                                                                       |
| Auto-registration                       | `[DashboardModule, QueryModule, ...(modules ?? [])]` — `packages/sdk-ui/src/infra/contexts/sisense-context/sisense-context-provider.tsx:153-155`, `<ModuleProvider>` `:178`; `custom-sisense-context-provider.tsx:54`                                                                                                                      |
| Generic module system                   | `packages/sdk-ui/src/infra/modules` — `Module` (`types.ts:42`, @beta), `ApiField` (`:4`), `ApiContract` (`:112`, @alpha), `buildModuleGraph` (`build-module-graph.ts:206`), `buildModuleRegistry` (`build-module-registry.ts:115`), `useModuleApiRegistry` (`modules-context.tsx:23`, @alpha), `ModuleProvider` (`module-provider.tsx:23`) |

## Contract

### Registry (`dashboard-module.ts:32-43`, verbatim)

```ts
export const DashboardModule: Module<DashboardModuleApiDefinition> = {
  name: DASHBOARD_MODULE_NAME,
  version: __PACKAGE_VERSION__,
  api: {
    customizations: {
      createRegistry: () => [],
      register: (newCustomizations, registry) => {
        registry.push(...newCustomizations);
      },
    },
  },
};
```

`customizations: ApiField<DashboardCustomization[], DashboardCustomization[]>` (`:16`) — the registry is a flat array, contributions are concatenated in topological module order (`build-module-registry.ts:78-105`).

### Middleware (`dashboard-module/types.ts`)

```ts
type DashboardCustomization = (
  dashboard: Readonly<DashboardProps>,
  stateApi: DashboardStateApi,
) => DashboardProps; // :62-73

interface DashboardStateApi {
  addWidget: (
    widget: WidgetProps,
    options?: {
      widgetOptions?: SpecificWidgetOptions;
      widgetsPanelLayout?: WidgetsPanelLayout;
    },
  ) => void; // :28
  setFilters: (filters: Filter[] | FilterRelations) => void; // :41
  setWidgetsLayout: (layout: WidgetsPanelLayout) => void; // :48
}
```

Required properties: pure with respect to `dashboard` and idempotent — "they are re-applied on every render" (`:57-58`).

### Contributing module

```ts
const myModule: Module = {
  name: 'my-feature',
  version: '1.0.0',
  requires: ['dashboard'],                                      // mandatory, or boot throws
  integrations: { dashboard: { customizations: [myCustomization] } },
};
<SisenseContextProvider modules={[myModule]} … />              // DashboardModule is already there
```

Shape taken from the `Module` TSDoc example (`infra/modules/types.ts:30-37`) and the demo modules under `packages/sdk-ui/src/__demo__/pages/dashboards/dashboard-module-demo/modules/`. The canonical header-item customization is `withHeaderItem(item)(dashboard)` (`dashboard-helpers.ts:355`) — see [Dashboard header](./dashboard-header.md).

### How `Dashboard` applies customizations

1. `useComposedDashboardInternal` assembles `composedDashboard` from inner state after the whole widget pipeline (`use-composed-dashboard.tsx:516-523`).
2. `customizations.reduce((current, customize) => customize(current, stateApi), composedDashboard)`, each call in `try/catch`; a throw is `console.error`-ed and that middleware's output discarded (`:524-531`).
3. `Dashboard` renders from the customized result: `config` and `styleOptions` → theme and container config (`dashboard.tsx:288-291`), `header` → `headerConfig` (`:365`), `title`, `widgets`, `layoutOptions`, `filters` (`:235-247`).

## How it connects

- `stateApi` is built in [useComposedDashboard](./composed-dashboard.md) (`use-composed-dashboard.tsx:509-512`); `addWidget` persists through the [persistence manager](./persistence-manager.md) when one is configured (`:468-496`).
- `ModuleProvider` builds one registry per provider instance (`buildModuleRegistry`, fresh `createRegistry` each build, `build-module-registry.ts:35-51`) and exposes it via `ModulesContext` (`module-provider.tsx:27-30`).
- Graph validation at boot (`build-module-graph.ts`): `includes` flattened and deduped by name (`:47-76`), hard `requires` must exist and satisfy `requiredVersion` (`:78-107`), every `integrations` target must be in `requires` (`:121`) and name a known `api` field (`:147`), topological sort rejects cycles (`:158-192`).
- `CoreModule` (`infra/modules/core-module.ts:29`) is the sibling producer: its `providers` field mounts React providers; `DashboardModule` is the second built-in producer.

## Invariants and traps

1. Only `SisenseContextProvider` / `CustomSisenseContextProvider` register `DashboardModule`; under a bare `ModuleProvider` without it, `useModuleApiRegistry(DashboardModule, 'customizations')` throws `"dashboard" is not registered…` (`modules-context.tsx:31-36`), which breaks every `Dashboard`.
2. `version` is `__PACKAGE_VERSION__` (`dashboard-module.ts:34`): two bundled copies of sdk-ui at different versions registering `'dashboard'` throw `Conflicting versions` at boot (`build-module-graph.ts:54-57`).
3. The `modules` prop is memoized by reference (`sisense-context-provider.tsx:153-155`, `module-provider.tsx:27`); an inline array literal rebuilds the registry and re-runs every `register` on each render — hoist or memoize it.
4. Customizations run every render, un-memoized, after all other transforms (`use-composed-dashboard.tsx:515`): appending without an id check duplicates header items; mutating `dashboard` in place leaks into inner state because `composedDashboard` spreads `initialDashboard` shallowly (`:517`).
5. Config changes made by a customization do not feed back into the hook's own gating (duplicate/rename/download read `initialDashboard.config`, `:278-318`); they affect only what `Dashboard` renders.
6. `stateApi.setWidgetsLayout` is the post-tabber `setFinalWidgetsLayout` (`:510`), while `addWidget` appends to the pre-tabber `innerWidgetsLayout` (`:466`) — pass an explicit `widgetsPanelLayout` to `addWidget` when a tabber is active.
7. Every exported symbol here is `@sisenseInternal` (stripped from public docs); the generic `Module` / `ModuleRequirement` types are `@beta` (`public-api/beta.ts:13`) and `useModuleApiRegistry` is `@alpha` (`public-api/alpha.ts:49`) — a third party can write a module today but cannot type its customization without the `@sisense/sdk-ui/sisense-internal` entry point.

## Related

- [useComposedDashboard](./composed-dashboard.md) - the apply site and `stateApi`
- [Dashboard header](./dashboard-header.md) - `withHeaderItem`, the usual customization payload
- [Dashboard and DashboardById](./dashboard-components.md) - how the customized props are rendered
- [Persistence manager](./persistence-manager.md) - what `stateApi.addWidget` calls when persistence is on
- [Monorepo architecture](../architecture/overview.md) - package layering the module system sits in
