---
type: Module
title: Dashboard persistence manager
description: The DashboardPersistenceManager contract and its default adapter over dispatchChanges, the props-shaped WidgetPropsUpdate channel, the shared deepMerge semantics, and the debounced useWidgetUpdatesPersistence middleware.
resource: packages/sdk-ui/src/domains/dashboarding/persistence
tags: [sdk-ui, dashboarding, module, persistence]
---

## Purpose

Gives the composition layer (`useComposedDashboard` and its feature hooks) a two-method, props-shaped way to persist widget changes without knowing action types or Fusion DTO field names. The default manager is a thin adapter over the reducer's `dispatchChanges` ([dashboard-model-reducer](./dashboard-model-reducer.md)); design rationale lives in `packages/sdk-ui/src/domains/dashboarding/persistence/__dev-docs__/persistence-workflow.md` and is not restated here.

## Entry point

| What                                                                  | Where                                                                                                                       | API level                                                                        |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Factory `createDashboardPersistenceManager(dispatchChanges)`          | `packages/sdk-ui/src/domains/dashboarding/persistence/persistence-manager.ts:21`                                            | @sisenseInternal (`modules/sisense-internal/public-api/sisense-internal.ts:106`) |
| Type `DashboardPersistenceManager`                                    | `packages/sdk-ui/src/domains/dashboarding/persistence/types.ts:17`                                                          | @sisenseInternal (`sisense-internal.ts:107`)                                     |
| Type `WidgetPropsUpdate` / `OnWidgetUpdate`                           | `packages/sdk-ui/src/domains/dashboarding/persistence/update-types.ts:15` / `:57`                                           | not exported                                                                     |
| Function `deepMerge(base, update)`                                    | `packages/sdk-ui/src/domains/dashboarding/persistence/deep-merge.ts:19`                                                     | not exported                                                                     |
| Barrel                                                                | `packages/sdk-ui/src/domains/dashboarding/persistence/index.ts:1-2`; re-exported `domains/dashboarding/index.ts:13`         | —                                                                                |
| Hook `useWidgetUpdatesPersistence(widgets, setWidgets, persistence?)` | `packages/sdk-ui/src/domains/dashboarding/hooks/use-widget-updates-persistence.ts:74`                                       | not exported                                                                     |
| Dev docs                                                              | `persistence/__dev-docs__/persistence-workflow.md`, `unified-widget-updates-persistence.md`, `widget-plugin-persistence.md` | —                                                                                |

## Contract

`DashboardPersistenceManager` (`types.ts:17-72`):

| Method         | Signature                                                                                                                           | Dispatches                                                                                         | Returns                                                                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addWidget`    | `(widget: WidgetProps, widgetsPanelLayout: WidgetsPanelLayout, widgetOptions?: SpecificWidgetOptions, tabberConfig?: TabberConfig)` | `ADD_WIDGET` with `widgetModelTranslator.fromWidgetProps(widget)` (`persistence-manager.ts:31-35`) | `Promise<{ widget: WidgetProps; widgetsPanelLayout; widgetOptions?; tabberConfig? }>` — the server-echoed artefacts from the processed action (`:36-48`) |
| `updateWidget` | `(widgetOid: string, update: WidgetPropsUpdate)`                                                                                    | `UPDATE_WIDGET` (`:50-55`)                                                                         | `Promise<void>`; fire-and-forget REST, errors logged by the caller                                                                                       |

`WidgetPropsUpdate` (`update-types.ts:15-46`, verbatim shape) — the only persistable kinds:

```ts
export type WidgetPropsUpdate = {
  readonly title?: string;
  readonly styleOptions?: {
    readonly navigator?: {
      readonly scrollerLocation?: { readonly min: number; readonly max: number };
    };
    readonly columns?: { readonly widths?: ReadonlyArray<number> };
    readonly [key: string]: unknown; // custom (plugin) widgets only: opaque, deeply partial
  };
  readonly customOptions?: Readonly<Record<string, unknown>>; // custom widgets only
};
export type OnWidgetUpdate = (update: WidgetPropsUpdate) => void;
```

`deepMerge` (`deep-merge.ts:19-21`) is `ts-deepmerge` `merge.withOptions({ mergeArrays: false }, base, update)`. Verified semantics: nested plain objects merge recursively; arrays, primitives, `Date` and `null` replace wholesale in either direction (`{a:{x:1}} + {a:null} → {a:null}`; `{a:null} + {a:{x:1}} → {a:{x:1}}`); keys cannot be deleted — an `undefined` value in `update` is copied as an own key holding `undefined`. Pure.

`useWidgetUpdatesPersistence` (`use-widget-updates-persistence.ts:74-124`) wires one emitter per widget via `wireWidget` (`:126-199`):

| Widget                                                                            | Injected callback                                                                     | Emitted update                                          |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| chart with `styleOptions.navigator`                                               | `styleOptions.navigator.onScrollerChange(min, max)` (`:137-151`)                      | `{ styleOptions: { navigator: { scrollerLocation } } }` |
| table chart, `columns.resizable !== false && columns.width !== 'auto'` (`:30-44`) | `styleOptions.columns.onColumnsResize(widths)` (`:156-169`)                           | `{ styleOptions: { columns: { widths } } }`             |
| `widgetType: 'custom'`                                                            | `onChange(event: CustomWidgetChangeEvent)`, `visualizationState/changed` (`:179-195`) | `{ styleOptions?, customOptions? }` from `payload`      |

Each injected handler then calls the widget's incoming callback with the same arguments, after scheduling the write (`:127-130`); the custom branch forwards every event upstream. Each emit (`:96-116`) applies `applyOptimistic` to the composition widget list, deep-merges into a per-oid pending accumulator, and (re)starts a per-oid `lodash debounce` of `DEBOUNCE_MS = 500` (`:46`) that calls `persistence.updateWidget(oid, pending)`. With `persistence` undefined only the optimistic apply runs.

## How it connects

- Created once per `dispatchChanges` in `DashboardById` (`packages/sdk-ui/src/domains/dashboarding/dashboard-by-id.tsx:71-73`) and passed as the `persistence` prop into `Dashboard` → `useComposedDashboardInternal` ([composed-dashboard](./composed-dashboard.md)), which threads it to `useWidgetUpdatesPersistence` (`use-composed-dashboard.tsx:354-358`).
- Callers of `addWidget`: `useDuplicateWidgetMenuItem` (`hooks/duplicate-widget/use-duplicate-widget-menu-item.ts:138`) — see [widget-actions](./widget-actions.md). Callers of `updateWidget`: `useWidgetUpdatesPersistence` and `useWidgetRenaming` (`hooks/rename-widget/use-widget-renaming.ts:92-93`, `{ title }`).
- The reducer and persist middleware ([dashboard-model-reducer](./dashboard-model-reducer.md)) are the sole REST writers; the manager never touches `RestApi`. `UPDATE_WIDGET` is translated to a Fusion `WidgetPatch` by `widgetPropsUpdateToFusionPatch` using the same `deepMerge`.
- `deepMerge` is applied at four points of the update channel with identical semantics: the pending accumulator (`use-widget-updates-persistence.ts:209`), the optimistic apply (`:261`, `:271`), the model reducer (`use-dashboard-model-reducer.ts:30`, `:43`) and the DTO patch (`persist-dashboard-model-middleware.ts:117`, `:153`, `:174`).
- Plugin-facing `onChange` / `VisualizationStateUpdate` is the custom-widget edge of this channel: the `CustomWidget` container wraps each update into a `visualizationState/changed` `CustomWidgetChangeEvent` (`widgets/components/custom-widget/custom-widget.tsx:76`) before it reaches `wireWidget`. Its design is in `persistence/__dev-docs__/widget-plugin-persistence.md`.

## Invariants and traps

1. `addWidget` is optimistic-then-confirm; `updateWidget` is optimistic-apply + fire-and-forget. Callers of `addWidget` must replace their temporary widget id with the returned `widget.id` (`persistence-manager.ts:42-48`); callers of `updateWidget` get no rollback on failure.
2. A `WidgetPropsUpdate` field persists only if `widgetPropsUpdateToFusionPatch` has a row for it (`persist-dashboard-model-middleware.ts:105-176`); otherwise the reducer applies it locally and the middleware logs "no DTO mapping". `update-types.ts:1-14` requires a middleware row plus a roundtrip test per new field.
3. Custom-widget `styleOptions` go to the opaque DTO `style`; chart `styleOptions` other than `navigator.scrollerLocation` / `columns.widths` have no mapping (`:111-167`). The three `styleOptions` branches are exclusive, so a single update carrying both `navigator.scrollerLocation` and `columns.widths` persists only the scroller.
4. The hook cancels every debouncer and clears all pending updates when `persistence` changes identity (`use-widget-updates-persistence.ts:86-94`). `dispatchChanges` — and hence the memoised manager — changes on every dashboard-model state change (`use-dashboard-persistence.ts:188-197`, `dashboard-by-id.tsx:71-73`), so a not-yet-flushed update for widget B is discarded, not flushed, when a model update that changes the local dashboard lands inside B's 500 ms window.
5. `deepMerge` cannot delete keys; send an explicit `null` (`deep-merge.ts:12-13`). Because `undefined` values are copied as own keys, pass only defined leaves in `customOptions` — the bag is sent whole to the server.
6. `onColumnsResize` is injected only for resizable, non-`'auto'` width tables (`:30-44`); a table in `width: 'auto'` mode never persists widths, by design (Fusion parity).
7. `useWidgetRenaming` includes custom widgets in the title channel (`use-widget-renaming.ts:12-15`, `:86`): their `onChange` carries `CustomWidgetChangeEvent` (`visualizationState/changed` and `title/changed`), and `wireWidget` chains to it rather than replacing it. Both channels converge on `updateWidget`.

Dev-doc drift (code is authoritative):

- `persistence-workflow.md:60-85`, `:123` and `:295` describe a third method `patchWidget` and a `PATCH_WIDGET` action, and have `useWidgetRenaming` calling `patchWidget`. The current manager has only `addWidget` / `updateWidget` (`types.ts:17-72`), `UseDashboardModelActionType` has no `PATCH_WIDGET` (`dashboard-model-reducer/types.ts:30-36`), and renaming calls `updateWidget(widget.id, { title })` (`use-widget-renaming.ts:92-93`). The doc's `addWidget` signature also lacks the `tabberConfig` parameter (`types.ts:39`).
- `persistence-workflow.md:414-418` and the TSDoc at `types.ts:65-67` say the reducer applies `updateWidget` before the REST call fires; in code the middleware (which issues the PATCH) is awaited before `dispatch` (`use-dashboard-persistence.ts:172-182`), so the request is sent first against the pre-reducer snapshot — consistent with `persistence-workflow.md:231`.
- `widget-plugin-persistence.md:710-734` (§6.1) still shows the custom branch returning early on `visualizationState/changed` without forwarding it and the other branches replacing their callbacks; the note at `:747` says every branch now chains to the incoming callback, which matches `use-widget-updates-persistence.ts:126-199`.
- `widget-plugin-persistence.md:794-824` shows the "as implemented" patch builder without the `title` and table `columns.widths` rows that exist in `persist-dashboard-model-middleware.ts:105-147`.

## Related

- [Dashboard model reducer](./dashboard-model-reducer.md) - the `dispatchChanges` this manager wraps and the `UPDATE_WIDGET` patch table
- [Dashboard model](./dashboard-model.md) - `SpecificWidgetOptions` / `partialDtoOptions` the write path depends on
- [Composed dashboard](./composed-dashboard.md) - where `persistence` is threaded into feature middlewares
- [Widget actions](./widget-actions.md) - duplicate / rename hooks that call `addWidget` / `updateWidget`
- [Dashboard components](./dashboard-components.md) - `DashboardById`, which constructs the manager
