---
type: Module
title: Dashboard model and DTO translation
description: The DashboardModel type, the REST loaders and hooks that produce it, the dashboardModelTranslator namespace, and the lossy DTO ↔ model translation layer including permission-derived config.
resource: packages/sdk-ui/src/domains/dashboarding/dashboard-model
tags: [sdk-ui, dashboarding, module]
---

## Purpose

Defines `DashboardModel` — a Fusion dashboard expressed in Compose SDK abstractions — and the only code that converts between it and the server `DashboardDto`. Reach for `useGetDashboardModel` / `getDashboardModel` to load, and for `dashboardModelTranslator.toDashboardProps` to render; the stateful counterpart lives in [dashboard-model-reducer](./dashboard-model-reducer.md).

## Entry point

| What                                                                                                                             | Where                                                                                                                                                                                                                                                                           | API level                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Type `DashboardModel`                                                                                                            | `packages/sdk-ui/src/domains/dashboarding/dashboard-model/dashboard-model.ts:33`                                                                                                                                                                                                | public                                                                       |
| Type `DashboardModelConfig` (`tabbers`)                                                                                          | `dashboard-model.ts:17`                                                                                                                                                                                                                                                         | not exported                                                                 |
| Types `WidgetsPanelCell` / `Row` / `Column` / `ColumnLayout`, `WidgetsOptions`, `SpecificWidgetOptions`, `DashboardStyleOptions` | `packages/sdk-ui/src/domains/dashboarding/dashboard-model/types.ts:19` / `:56` / `:63` / `:71` / `:96` / `:101` / `:140`                                                                                                                                                        | public                                                                       |
| Function `getDashboardModel(http, oid, options?, themeSettings?, appSettings?)`                                                  | `packages/sdk-ui/src/domains/dashboarding/dashboard-model/get-dashboard-model.ts:103`                                                                                                                                                                                           | @internal (`internal.ts:20`) and @sisenseInternal (`sisense-internal.ts:13`) |
| Type `GetDashboardModelOptions`                                                                                                  | `get-dashboard-model.ts:16`                                                                                                                                                                                                                                                     | public                                                                       |
| Function `getDashboardModels(http, options?, …)` / `GetDashboardModelsOptions`                                                   | `packages/sdk-ui/src/domains/dashboarding/dashboard-model/get-dashboard-models.ts:25` / `:11`                                                                                                                                                                                   | @internal / public                                                           |
| Hook `useGetDashboardModel` (tracked) / `useGetDashboardModelInternal`                                                           | `packages/sdk-ui/src/domains/dashboarding/dashboard-model/use-get-dashboard-model.ts:121` / `:131`                                                                                                                                                                              | public / not exported                                                        |
| Types `GetDashboardModelParams`, `DashboardModelState` (+ `Loading`/`Error`/`Success`)                                           | `use-get-dashboard-model.ts:18` / `:28`                                                                                                                                                                                                                                         | public                                                                       |
| Hook `useGetDashboardModels` / `DashboardModelsState`                                                                            | `packages/sdk-ui/src/domains/dashboarding/dashboard-model/use-get-dashboard-models.ts:105` / `:23`                                                                                                                                                                              | public                                                                       |
| Namespace `dashboardModelTranslator` (`toDashboardProps`, `fromDashboardDto`)                                                    | `packages/sdk-ui/src/domains/dashboarding/dashboard-model/dashboard-model-translator.ts:32` / `:72`; re-exported `public-api/public.ts:330`                                                                                                                                     | public namespace; `fromDashboardDto` is tagged `@internal`                   |
| DTO → model utils                                                                                                                | `packages/sdk-ui/src/domains/dashboarding/dashboard-model/translate-dashboard-utils.ts` — `translateLayout:76`, `extractDashboardFilters:156`, `translateWidgetsOptions:432`, `translateTabbersOptions:753`, `withSharedFormulas:778`                                           | not exported                                                                 |
| Model → DTO utils                                                                                                                | `translate-dashboard-utils.ts` — `withSpecificWidgetOptions:622`, `withTabberWidgetConfig:719`, `withDashboardWidgetContext:747`; `packages/sdk-ui/src/domains/dashboarding/dashboard-model/translate-dashboard-dto-utils.ts` — `filterToFilterDto:35`, `layoutToLayoutDto:185` | not exported                                                                 |
| Permission → config                                                                                                              | `packages/sdk-ui/src/domains/dashboarding/dashboard-model/as-permission-derived-config.ts` — `PERMISSION_MAPPINGS:80`, `asPermissionDerivedConfig:245`, `withoutUndefinedDerivedFlags:272`                                                                                      | not exported                                                                 |

## Contract

`DashboardModel` fields (`dashboard-model.ts:33-102`); only `oid`, `title`, `dataSource`, `widgets` are untagged, every other field is `@internal`:

| Field                  | Type                                       | Source in `fromDashboardDto`                                              |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------------------- |
| `oid`, `title`         | `string`                                   | DTO as-is                                                                 |
| `dataSource`           | `DataSource`                               | `convertDataSource(dto.datasource)`                                       |
| `widgets`              | `WidgetModel[]`                            | `widgetModelTranslator.fromWidgetDto` per `dto.widgets`, `[]` when absent |
| `layoutOptions`        | `{ widgetsPanel: WidgetsPanelLayout }`     | `translateLayout(dto.layout)`, `{ columns: [] }` when absent              |
| `styleOptions`         | `DashboardStyleOptions`                    | only `palette.variantColors` from `dto.style.palette.colors`              |
| `filters`              | `Filter[] \| FilterRelations`              | `extractDashboardFilters(dto.filters, dto.filterRelations)`               |
| `widgetsOptions`       | `WidgetsOptions`                           | `translateWidgetsOptions(dto.widgets)`                                    |
| `config`               | `DashboardModelConfig`                     | `{ tabbers: translateTabbersOptions(dto.widgets) }`                       |
| `settings`, `userAuth` | `DashboardSettings?`, `DashboardUserAuth?` | DTO as-is                                                                 |

Loader options (`get-dashboard-model.ts:16-61`, `get-dashboard-models.ts:11-22`) and the REST calls they drive (`packages/sdk-ui/src/infra/api/rest-api.ts`):

```ts
// GetDashboardModelOptions
includeWidgets?: boolean;      // default false — adds 'layout' to fields, then loads widgets
includeFilters?: boolean;      // default false — adds 'filters', 'filterRelations' to fields
sharedMode?: boolean;          // @internal — co-authoring; forwarded as ?sharedMode=true
useLegacyApiVersion?: boolean; // @internal @deprecated — whole load via GET api/dashboards/:oid
adminAccess?: boolean;         // @sisenseInternal
// GetDashboardModelsOptions
searchByTitle?: string; includeWidgets?: boolean;
```

| Step                | Request                                                                                                                                                           | Where                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Dashboard (V1)      | `GET api/v1/dashboards/:oid?fields=…&expand=userAuth` with `fields = ['oid','title','datasource','style','settings','userId','shares']`                           | `get-dashboard-model.ts:116-134`, `rest-api.ts:121`       |
| `userAuth` fallback | `GET api/dashboards/:oid` when V1 omits `userAuth`; failure swallowed                                                                                             | `get-dashboard-model.ts:143-148`, `:74-88`                |
| Widgets             | `GET api/v1/dashboards/:oid/widgets`; under `http.auth.type === 'wat'` instead one `GET …/widgets/:widgetOid` per id in `layout`                                  | `:118`, `:150-168`, `rest-api.ts:154` / `:171`            |
| Palette             | `GET api/palettes` when `style.paletteId` is set without `style.palette`; failure → `console.warn`                                                                | `:173-189`, `rest-api.ts:200`                             |
| Shared formulas     | `GET api/v1/formulas/:id?flat=true` per unique `formulaRef` in widget panels, inlined into `jaql.context`                                                         | `translate-dashboard-utils.ts:778-872`, `rest-api.ts:345` |
| List                | `GET api/v1/dashboards?fields=oid,title,datasource,style`; with `includeWidgets` the `fields` list is emptied and `expand=widgets` used; results deduped by `oid` | `get-dashboard-models.ts:34-54`, `rest-api.ts:88`         |

Hook return shape (`use-get-dashboard-model.ts:36-85`) is a discriminated union on `status`:

```ts
{
  isLoading: true;
  isError: false;
  isSuccess: false;
  error: undefined;
  dashboard: DashboardModel | undefined;
  status: 'loading';
}
{
  isLoading: false;
  isError: true;
  isSuccess: false;
  error: Error;
  dashboard: undefined;
  status: 'error';
}
{
  isLoading: false;
  isError: false;
  isSuccess: true;
  error: undefined;
  dashboard: DashboardModel;
  status: 'success';
}
// useGetDashboardModels: identical with `dashboards: DashboardModel[]` (use-get-dashboard-models.ts:31-80)
```

`toDashboardProps` (`dashboard-model-translator.ts:32-61`) maps `oid → id`, `dataSource → defaultDataSource`, widgets through `widgetModelTranslator.toWidgetProps` wrapped by `withNarrativeDashboardId(oid)`, and builds `config = { ...asPermissionDerivedConfig(userAuth), tabbers }`.

Permission rows (`as-permission-derived-config.ts:80-224`) — `DashboardConfig` dot-path ← `DashboardUserAuth` reader; a reader returning `undefined` leaves the flag out:

```text
widgetsPanel.editMode.enabled                     ← dashboards.toggle_edit_mode
widgetsPanel.editMode.renameWidget.enabled        ← widgets.rename
widgetsPanel.editMode.deleteWidget.enabled        ← widgets.delete
widgetsPanel.editMode.duplicateWidget.enabled     ← allGranted(widgets.duplicate, widgets.create)
widgetsPanel.actions.downloadCsv.enabled          ← widgets.export_csv
widgetsPanel.actions.downloadExcel.enabled        ← widgets.export_csv
filtersPanel.actions.addFilter.enabled            ← dashboards.filters.create
filtersPanel.actions.editFilter.enabled           ← () => true
filtersPanel.actions.editFilter.ranking.visible   ← dashboards.filters.modify_type
filtersPanel.actions.addFilter.ranking.visible    ← dashboards.filters.modify_type
filtersPanel.actions.deleteFilter.enabled         ← inverted(widgets.widgetViewOnly)
filtersPanel.actions.reorderFilters.enabled       ← inverted(widgets.widgetViewOnly)
filtersPanel.actions.lockFilter.enabled           ← allGranted(dashboards.filters.advanced, dashboards.toggle_edit_mode)
filtersPanel.actions.addFilter.multiSelect.visible  ← dashboards.filters.modify_type
filtersPanel.actions.editFilter.multiSelect.visible ← dashboards.filters.modify_type
filtersPanel.actions.toggleFilter.visible         ← dashboards.filters.on_off
filtersPanel.actions.expandFilter.visible         ← dashboards.filters.toggle_expansion
```

## How it connects

- `getDashboardModel` is the single loader behind `useGetDashboardModel`, `useDashboardModel` ([dashboard-model-reducer](./dashboard-model-reducer.md)) and `DashboardById` ([dashboard-components](./dashboard-components.md)); `Dashboard` renders a model through `toDashboardProps` (`packages/sdk-ui/src/domains/dashboarding/dashboard.tsx:58`, `dashboard-by-id.tsx:81`, `components/jtd-dashboard.tsx:97`).
- Filters are rebuilt from JAQL by `createFilterFromJaql` and relations by `convertFilterRelationsModelToRelationRules` + `combineFiltersAndRelations` ([filter relations](../sdk-data/filter-relations.md)); the reverse path `filterToFilterDto` feeds `translateFiltersAndRelationsToDto` ([dashboard-model-reducer](./dashboard-model-reducer.md)).
- `widgetsOptions[id]` is the dashboard-level home for common-filter mode, JTD config and a raw-DTO snapshot (`partialDtoOptions`) — consumed by [common-filters](./common-filters.md), [jump-to-dashboard](./jump-to-dashboard.md) and the persist middleware. `filterWidgetOptions` is never produced here; the composed dashboard writes it at runtime (`packages/sdk-ui/src/domains/dashboarding/use-composed-dashboard.tsx:331-335`).
- `withDashboardWidgetContext` is the model → DTO write path used by `ADD_WIDGET` persistence (see [persistence-manager](./persistence-manager.md)) to re-attach `widgetsOptions[id]` and `config.tabbers[id]` to a freshly translated `WidgetDto`.
- `withoutUndefinedDerivedFlags` is applied to developer props in `dashboard-by-id.tsx:94`, so the merge order is `code defaults → permission-derived → props`.

## Invariants and traps

1. `styleOptions` is lossy both ways: `fromDashboardDto` reads only the palette (`dashboard-model-translator.ts:92-94`); `backgroundColor` / divider fields of `DashboardStyleOptions` never come from the DTO.
2. `translateLayout` reads `subcell.elements[0]` only and rescales subcell widths to fill 100 % when their sum is below 100 (`translate-dashboard-utils.ts:79-92`); `layoutToLayoutDto` re-adds defaults `height '500px'`, `maxWidth 2048`, `MIN_COLUMN_WIDTH`, `MIN_ROW_HEIGHT`, `MAX_ROW_HEIGHT` and drops `WidgetsPanelCell.hidden` (`translate-dashboard-dto-utils.ts:185-206`). A round-trip is not byte-identical.
3. A members filter stored as `{ all: true }` becomes a select-all _exclude_ (`excludeMembers: true`, empty list) via `asFilterWidgetSelectAll` (`translate-dashboard-utils.ts:118`, `:128`), and only that shape is written back as `{ all: true, multiSelection }` (`translate-dashboard-dto-utils.ts:93-97`). Deactivated members are re-appended after active members — original order is lost (`:121-134`).
4. `getFilterBaseDto` serialises with `disabled: false` forced into the JAQL and moves `disabled` to the DTO top level (`translate-dashboard-dto-utils.ts:70-80`); do not read `jaql.filter` to learn whether a dashboard filter is off.
5. Fusion stores one relations group per `filterRelations[]` entry; `extractDashboardFilters` ANDs all entries and collapses trivial single-node groups to a flat `Filter[]` (`translate-dashboard-utils.ts:166-184`). Callers must keep accepting `Filter[] | FilterRelations`.
6. `translateWidgetsOptions` always sets `forceApplyBackgroundFilters: true` and snapshots `options` plus unsupported `style` fields into `partialDtoOptions` (`:452-455`). `withSpecificWidgetOptions` spreads the `options` snapshot _under_ the rebuilt DTO because the server replaces whole objects on PATCH (`:631-635`), but layers the `style` snapshot _over_ the rebuilt style through `applyPartialDtoStyle` (`:679`, `types.ts:111-118`). That snapshot holds only fields the widget model does not capture (axis `inactive` / `ticks` / `labels.rotation`, indicator `inactive` flags, pie `navigator`, …), so the original Fusion values replace the defaults the rebuild writes, while every modeled value still follows the current props. A field added to `extractUnsupportedStyleOptions` must therefore never be one the model derives, or a stale snapshot will override it.
7. `useLegacyApiVersion` is deprecated and skips widgets/palette/WAT handling entirely (`get-dashboard-model.ts:190-196`); `userAuth` already arrives through `expand=userAuth` with a legacy fallback.
8. `asPermissionDerivedConfig` emits a value for every row whose permission is present and never emits `widgetsPanel.editMode.isEditing` (`as-permission-derived-config.ts:237-239`) — its presence hands edit state to the host. Absent `userAuth` derives nothing (`:246-248`), so permissive code defaults survive.
9. `getDashboardModels` mutates `dashboard.style` in place while resolving palettes (`get-dashboard-models.ts:74`) — the DTO array returned by `RestApi.getDashboards` is not reusable afterwards.
10. `useGetDashboardModelInternal` reloads only when `dashboardOid`, `sharedMode` or `adminAccess` change (`use-get-dashboard-model.ts:132`); flipping `includeWidgets` alone does not refetch.

## Related

- [Dashboard model reducer](./dashboard-model-reducer.md) - stateful hook over this model and the DTO write path
- [Dashboard persistence manager](./persistence-manager.md) - composition-layer façade over the reducer
- [Dashboard components](./dashboard-components.md) - `Dashboard` / `DashboardById` consumers of `toDashboardProps`
- [Common filters](./common-filters.md) - consumer of `widgetsOptions[id].filtersOptions`
- [Jump to dashboard](./jump-to-dashboard.md) - consumer of `widgetsOptions[id].jtdConfig`
- [Filters](../sdk-data/filters.md) - `createFilterFromJaql`, `filterFactory` used to rebuild filters
- [Filter relations](../sdk-data/filter-relations.md) - model ↔ rules converters used by `extractDashboardFilters`
