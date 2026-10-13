---
type: Module
title: Dashboard model reducer and persistence hook
description: useDashboardModel / useDashboardPersistence, the dashboard-model action union and reducer, and the persist middleware that mirrors each action to the Fusion REST API.
resource: packages/sdk-ui/src/domains/dashboarding/dashboard-model/use-dashboard-model
tags: [sdk-ui, dashboarding, module, state]
---

## Purpose

Holds a loaded `DashboardModel` in a React reducer and mirrors every accepted action to the server through one middleware, so local state and Fusion stay in step. It is the only place that performs dashboard REST writes; the composition layer reaches it through [persistence-manager](./persistence-manager.md).

## Entry point

| What                                                                                   | Where                                                                                                                                                     | API level                                                                                   |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Hook `useDashboardModel` (tracked) / `useDashboardModelInternal`                       | `packages/sdk-ui/src/domains/dashboarding/dashboard-model/use-dashboard-model/use-dashboard-model.ts:44` / `:51`                                          | @internal (`internal.ts:19`) and @sisenseInternal (`sisense-internal.ts:14`) / not exported |
| Types `UseDashboardModelParams`, `UseDashboardModelResult`                             | `use-dashboard-model.ts:8` / `:18`                                                                                                                        | not exported                                                                                |
| Hook `useDashboardPersistence`                                                         | `packages/sdk-ui/src/domains/dashboarding/dashboard-model/use-dashboard-model/use-dashboard-persistence.ts:144`                                           | @sisenseInternal (`sisense-internal.ts:103`, marked `/* legacy */`)                         |
| Types `UseDashboardPersistenceParams` / `UseDashboardPersistenceResult`                | `use-dashboard-persistence.ts:23` / `:43`                                                                                                                 | not exported                                                                                |
| Enum `UseDashboardModelActionType` / `UseDashboardModelActionTypeInternal`             | `packages/sdk-ui/src/domains/dashboarding/dashboard-model/use-dashboard-model/dashboard-model-reducer/types.ts:30` / `:20`                                | @sisenseInternal (`sisense-internal.ts:10`) / not exported                                  |
| Types `UseDashboardModelAction`, `UseDashboardModelInternalAction`, `WidgetPatch`      | `types.ts:110` / `:76` / `:44`                                                                                                                            | not exported                                                                                |
| Reducer `dashboardReducer`                                                             | `packages/sdk-ui/src/domains/dashboarding/dashboard-model/use-dashboard-model/dashboard-model-reducer/use-dashboard-model-reducer.ts:78`                  | not exported                                                                                |
| Middleware `persistDashboardModelMiddleware` / `PersistDashboardModelMiddlewareParams` | `packages/sdk-ui/src/domains/dashboarding/dashboard-model/use-dashboard-model/dashboard-model-reducer/persist-dashboard-model-middleware.ts:238` / `:203` | not exported                                                                                |
| Function `translateFiltersAndRelationsToDto`                                           | `packages/sdk-ui/src/domains/dashboarding/dashboard-model/use-dashboard-model/dashboard-model-reducer/utils.ts:30`                                        | @sisenseInternal (`sisense-internal.ts:9`)                                                  |
| Helpers `parseAddWidgetPayload`, `appendWidgetToFirstCell`                             | `utils.ts:50` / `:70`                                                                                                                                     | not exported                                                                                |
| Helpers `dashboardChangeEventToUseDashboardModelAction`, `checkPersistenceSupport`     | `packages/sdk-ui/src/domains/dashboarding/dashboard-model/use-dashboard-model/use-dashboard-model-utils.ts:16` / `:42`                                    | not exported                                                                                |

## Contract

`useDashboardModel(params)` = `useGetDashboardModelInternal` + `useDashboardPersistence` (`use-dashboard-model.ts:51-85`). Params extend `GetDashboardModelParams` with `persist?: boolean` (default `true`). Result:

```ts
{
  dashboard: DashboardModel | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  dispatchChanges: (action: UseDashboardModelAction) => Promise<UseDashboardModelInternalAction>;
}
```

Action union (`types.ts:20-36`, verbatim):

```ts
export enum UseDashboardModelActionTypeInternal {
  DASHBOARD_INIT = 'DASHBOARD.INIT',
  UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE = 'UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE',
}
export enum UseDashboardModelActionType {
  FILTERS_UPDATE = 'FILTERS.UPDATE',
  ADD_WIDGET = 'WIDGETS.ADD',
  UPDATE_WIDGET = 'WIDGETS.UPDATE',
  WIDGETS_PANEL_LAYOUT_UPDATE = 'WIDGETS_PANEL_LAYOUT.UPDATE',
  WIDGETS_DELETE = 'WIDGETS.DELETE',
}
```

| Action                                           | Payload (`types.ts`)                                                                           | Reducer effect (`use-dashboard-model-reducer.ts`)                                                                      | Middleware REST write (`persist-dashboard-model-middleware.ts`, `rest-api.ts`)                                                                                                                                         | Await / error                                                                                                                            |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `DASHBOARD_INIT`                                 | `DashboardModel`                                                                               | spread over state (`:83-87`)                                                                                           | none                                                                                                                                                                                                                   | —                                                                                                                                        |
| `FILTERS_UPDATE`                                 | `Filter[] \| FilterRelations` (`:122`)                                                         | replace `filters` (`:88-92`)                                                                                           | `PATCH api/v1/dashboards/:oid` body `translateFiltersAndRelationsToDto(payload)` (`:252-256`, `rest-api.ts:262`)                                                                                                       | fire-and-forget, `console.error`                                                                                                         |
| `ADD_WIDGET`                                     | `WidgetModel` or `{ widget, widgetsPanelLayout?, widgetOptions?, tabberConfig? }` (`:139-154`) | append widget, `widgetsOptions[oid]`, `config.tabbers[oid]`, layout (custom or `appendWidgetToFirstCell`) (`:129-164`) | `POST api/v1/dashboards/:oid/widgets` with `withDashboardWidgetContext(...)(toWidgetDto(...))`; then, if a layout was given, `PATCH …/:oid { layout }` with the server oid substituted (`:258-329`, `rest-api.ts:280`) | awaited; returns a NEW action carrying the server widget; a failed layout PATCH deletes the orphan and rethrows (`:187-200`, `:311-314`) |
| `UPDATE_WIDGET`                                  | `{ widgetOid, update: WidgetPropsUpdate }` (`:97-103`)                                         | `applyWidgetPropsUpdate`: `deepMerge` `styleOptions` / `customOptions`, set `title` (`:63-69`, `:93-102`)              | `PATCH api/v1/dashboards/:oid/widgets/:widgetOid` with the `WidgetPatch` built by `widgetPropsUpdateToFusionPatch` (`:331-355`, `rest-api.ts:316`)                                                                     | fire-and-forget; no mapping → `console.error`, no request (`:345-351`)                                                                   |
| `WIDGETS_PANEL_LAYOUT_UPDATE`                    | `WidgetsPanelLayout` (`:161`)                                                                  | replace `layoutOptions.widgetsPanel` (`:103-110`)                                                                      | `PATCH …/:oid { layout: layoutToLayoutDto(payload) }` (`:357-369`)                                                                                                                                                     | fire-and-forget                                                                                                                          |
| `WIDGETS_DELETE`                                 | `string[]` (`:173`)                                                                            | filter out widgets (`:111-117`)                                                                                        | `DELETE …/widgets/:widgetOid` per id via `Promise.all` (`:370-378`, `rest-api.ts:298`)                                                                                                                                 | fire-and-forget                                                                                                                          |
| `UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE` | `{ widgetsPanel, widgets: string[] }` (`:82-88`)                                               | both of the above (`:118-128`)                                                                                         | layout PATCH + per-widget DELETEs (`:379-398`)                                                                                                                                                                         | fire-and-forget                                                                                                                          |

`widgetPropsUpdateToFusionPatch` (`:89-179`) — one `WidgetPropsUpdate` field → one `WidgetPatch` destination: `title → title`; `styleOptions.navigator.scrollerLocation → options.previousScrollerLocation` spread over `partialDtoOptions.options`; `styleOptions.columns.widths` (table chart) → `style.tableState.colResize.{columns: '<n>px'[], tableSize: sum}` via `applyPartialDtoStyle`; any `styleOptions` (custom widget) → `style` via `withWidgetDesign(deepMerge(current, update), …)`; `customOptions → customOptions` deep-merged. The three `styleOptions` branches are mutually exclusive `if / else if` (`:111-167`).

`translateFiltersAndRelationsToDto` (`utils.ts:30-48`) returns `{ filters: FilterDto[], filterRelations: [{ datasource: string, filterRelations }] | undefined }` — one relations entry, `datasource` is the single data-source title found on the filters or `''`.

`useDashboardPersistence` pipeline (`use-dashboard-persistence.ts:162-198`): `transformAction` (`WIDGETS_DELETE` → combined action when a layout exists `:63-85`; `WIDGETS_PANEL_LAYOUT_UPDATE` that drops widgets → combined action `:95-119`) → `await persistDashboardModelMiddleware(...)` when `persist && auth.type !== 'wat'` → `dispatch(processedAction)`. `?sharedMode=true` is appended to every write when `sharedMode` is set (`rest-api.ts:257-259`).

## How it connects

- `DashboardById` owns the hook, converts `DashboardChangeEvent` (`filters/updated`, `widgetsPanel/layout/updated`) into actions via `dashboardChangeEventToUseDashboardModelAction` and wraps `dispatchChanges` in `createDashboardPersistenceManager` (`packages/sdk-ui/src/domains/dashboarding/dashboard-by-id.tsx:52-73`) — see [dashboard-components](./dashboard-components.md) and [persistence-manager](./persistence-manager.md).
- DTO writers come from [dashboard-model](./dashboard-model.md): `layoutToLayoutDto`, `filterToFilterDto`, `withDashboardWidgetContext`; the fetched model is re-synced into the reducer with `DASHBOARD_INIT` whenever the `dashboard` reference changes (`use-dashboard-persistence.ts:202-209`).
- `WidgetPropsUpdate` and `deepMerge` are owned by `persistence/` ([persistence-manager](./persistence-manager.md)); the debounce that batches `UPDATE_WIDGET` lives in `useWidgetUpdatesPersistence`, not here.
- Relations are split and re-serialised with `splitFiltersAndRelations` / `filterRelationRulesToFilterRelationsModel` ([filter relations](../sdk-data/filter-relations.md)).

## Invariants and traps

1. The middleware runs BEFORE the reducer: `persistentDispatch` awaits `persistDashboardModelMiddleware` and only then dispatches (`use-dashboard-persistence.ts:172-182`). Every REST request is therefore issued against the pre-reducer `model` snapshot (`persist-dashboard-model-middleware.ts:222-229`), and `ADD_WIDGET` reaches the reducer only after the server answers — there is no reducer-level optimistic insert.
2. `ADD_WIDGET` is the only awaited write and the only one that transforms its action: callers must use the returned payload's `widget.oid`, not the one they dispatched (`:294-329`). `createDashboardPersistenceManager` relies on this to echo server artefacts.
3. Fusion replaces `options`, `style` and `customOptions` wholesale on PATCH; `WidgetPatch` therefore always carries the full object (`types.ts:50-68`), rebuilt from `widgetsOptions[oid].partialDtoOptions` and the live `WidgetModel` (`:334-344`). Adding a field to `WidgetPropsUpdate` without a row in `widgetPropsUpdateToFusionPatch` yields a logged "no DTO mapping" and silent non-persistence (`:345-351`).
4. `RestApi.PatchWidgetInDashboardBody` declares only `title` and the scroller `options` shape (`packages/sdk-ui/src/infra/api/rest-api.ts:35-38`), yet the middleware sends `style` and `customOptions` too; the type compiles only because `Partial<Pick<WidgetDto,'title'>>` is a weak type. Extend the REST type when adding patch kinds.
5. `translateFiltersAndRelationsToDto` throws `'Persisting filters from multiple datasources is not supported now'` (`utils.ts:115`) — a `FILTERS_UPDATE` spanning two data sources rejects inside the middleware and is never dispatched to the reducer.
6. `checkPersistenceSupport` disables all writes under `wat` auth and warns once per `persist` value (`use-dashboard-model-utils.ts:42-53`); the reducer still updates local state.
7. `dispatchChanges` identity changes with every `localDashboard` change (`use-dashboard-persistence.ts:188-197`), so any `useMemo` keyed on it (the persistence manager, `dashboard-by-id.tsx:71-73`) churns per state update — see trap 4 in [persistence-manager](./persistence-manager.md).
8. The legacy `WidgetModel`-only `ADD_WIDGET` payload is still accepted (`types.ts:131-137`); it carries no `widgetOptions` / `tabberConfig`, so dashboard-level context for that widget is lost on the write path.
9. Failures of `FILTERS_UPDATE`, layout and delete writes are logged, not surfaced; the local model keeps the change and diverges from the server until the next load.

## Related

- [Dashboard model](./dashboard-model.md) - the state shape and DTO translators this reducer drives
- [Dashboard persistence manager](./persistence-manager.md) - props-shaped façade and debounced update channel over `dispatchChanges`
- [Dashboard components](./dashboard-components.md) - `DashboardById`, the only owner of `useDashboardModelInternal`
- [Editable layout](./editable-layout.md) - producer of `widgetsPanel/layout/updated` events and `deleteWidgetsFromLayout`
- [Filter relations](../sdk-data/filter-relations.md) - split / rebuild helpers behind `translateFiltersAndRelationsToDto`
