# Pattern: Hook port

**HookAdapter style is the only supported style for new hook ports.** It requires `@sisense/sdk-ui` to expose a `useXxxInternal` variant of the hook. If that export is missing, **create it first in `sdk-ui` by splitting the hook** into a `useXxxInternal` (untracked, the real body) and `useXxx = withTracking('useXxx')(useXxxInternal)` (tracked, the public export) — see Phase 0.5 in `SKILL.md`. Only after the split should you proceed with the port.

Do not write a manual reimplementation. The legacy reimplementation pattern still exists in the codebase but is being phased out; do not add more of it.

Reference implementations:

- **Simple** (one-shot async result): `useExecuteCsvQuery` → `QueryService.executeCsvQuery` (Angular), `useExecuteCsvQuery` composable (Vue)
- **Complex** (reactive state + imperative callbacks): `useComposedDashboard` → `DashboardService.createComposedDashboard` (Angular, returns Observable + methods), `useComposedDashboard` composable (Vue)

## Decide "simple" vs "complex"

Read the React hook's return shape:

- **Simple**: returns a single data payload once per params change — e.g. `{ data, isLoading, isError, error, refetch }`. Callers only need the terminal result. → Angular exposes a single `async` method returning `{ data }`. Vue composable returns `toRefs` of the reactive state.
- **Complex**: returns an object with both reactive state AND callbacks/methods (e.g. `{ dashboard, setFilters, setWidgetsLayout }`). Callers need ongoing state updates and imperative actions. → Angular returns `{ data$: Observable<T>, <method1>, <method2>, destroy }`. Vue composable returns the reactive refs plus callback facades.

If unsure, prefer the simple shape and escalate to complex only when the React hook exposes callbacks the caller must invoke.

## Angular shape — method on a service

Prefer adding the method to the closest existing service in `packages/sdk-ui-angular/src/lib/services/` when one fits the hook's domain. If no existing service fits, create a new service.

### Mapping existing hooks to existing services

- `useExecuteQuery*`, `useExecuteCsvQuery`, `useExecutePivotQuery`, `useGetFilterMembers` → `QueryService`
- `useGetDashboardModel*`, `useComposedDashboard`, `useJtdWidget` → `DashboardService`
- `useGetWidgetModel` → `WidgetService`
- `useGetHierarchyModels` → `HierarchyService`
- `useGetSharedFormula` → `FormulaService`
- `useCustomWidgets`, `useExecuteCustomWidgetQuery` → `CustomWidgetsService`

### When no existing service fits

Create a new one at `packages/sdk-ui-angular/src/lib/services/<kebab-name>.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { TrackableService } from '../decorators/trackable.decorator';
import { SisenseContextService } from './sisense-context.service';

/**
 * <Adapted TSDoc — see patterns/tsdoc.md>
 */
@Injectable({ providedIn: 'root' })
@TrackableService<<Name>Service>(['<methodName>'])
export class <Name>Service {
  constructor(private sisenseContextService: SisenseContextService) {}
  // …method body per shape below
}
```

Register in `packages/sdk-ui-angular/src/lib/services/index.ts`.

Decide "fit or not" by the hook's **domain responsibility**, not syntactic similarity. A hook that fetches query data → `QueryService`; a hook that reconciles dashboard state → `DashboardService`; a genuinely new concept (collaboration, annotations, alerts) → its own service.

### Simple hook shape (Promise-returning method)

For hooks whose payload is a single terminal result. Pattern: run the HookAdapter once, resolve on first success, reject on first error, tear down.

```typescript
import { firstValueFrom } from 'rxjs'; // only if you need it elsewhere
import {
  HookAdapter,
  useExecuteCsvQueryInternal,
  type ExecuteCsvQueryParams,
} from '@sisense/sdk-ui-preact';

import { getFilterListAndRelationsJaql } from '@sisense/sdk-data';
import {
  createSisenseContextConnector,
  createPluginContextConnector,
} from '../component-wrapper-helpers/context-connectors';

/**
 * <Adapted TSDoc — see patterns/tsdoc.md>
 */
async executeCsvQuery(
  params: ExecuteCsvQueryParams,
): Promise<{ data: Blob | string }> {
  const hookAdapter = new HookAdapter(useExecuteCsvQueryInternal, [
    createSisenseContextConnector(this.sisenseContextService),
    createPluginContextConnector(this.sisenseContextService),
  ]);

  const { filters: filterList, relations: filterRelations } =
    getFilterListAndRelationsJaql(params.filters);

  const resultPromise = new Promise<{ data: Blob | string }>((resolve, reject) => {
    hookAdapter.subscribe((res) => {
      const { data, isSuccess, isError, error } = res;
      if (isSuccess) resolve({ data });
      else if (isError) reject(error);
    });
  });

  hookAdapter.run({ ...params, filters: filterList, filterRelations });

  return resultPromise.finally(() => hookAdapter.destroy());
}
```

Key points:

- Return a **Promise** resolving to the terminal payload. Drop `isLoading`/`isError`/`refetch` — callers drive lifecycle via Promise semantics.
- **Always** call `hookAdapter.destroy()` in `.finally()` — don't leak subscriptions.
- Extend the service's existing `@TrackableService<Service>([...])` decorator with the new method name.

### Complex hook shape (Observable + callback methods)

For hooks returning reactive state plus callbacks the caller must invoke. Pattern: long-lived HookAdapter, `BehaviorSubject` mirrors each emission, `createHookApiFacade` exposes callbacks, explicit `destroy()`.

```typescript
import { BehaviorSubject, type Observable } from 'rxjs';
import {
  HookAdapter,
  createHookApiFacade,
  useComposedDashboardInternal,
  type ComposedDashboardConfig,
  type DashboardProps as DashboardPropsPreact,
} from '@sisense/sdk-ui-preact';

import {
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../component-wrapper-helpers/context-connectors';
import {
  toDashboardProps,
  toPreactDashboardProps,
} from '../helpers/dashboard-props-preact-translator';

export interface ComposedDashboardHandle<D> {
  dashboard$: Observable<D>;
  setFilters: (filters: Filter[] | FilterRelations) => Promise<void>;
  setWidgetsLayout: (layout: WidgetsPanelLayout) => Promise<void>;
  destroy: () => void;
}

/**
 * <Adapted TSDoc — see patterns/tsdoc.md>
 */
createComposedDashboard<D extends DashboardProps | ComposableDashboardProps>(
  initialDashboard: D,
  options: ComposedDashboardConfig = {},
): ComposedDashboardHandle<D> {
  const hookAdapter = new HookAdapter(useComposedDashboardInternal<DashboardPropsPreact>, [
    createSisenseContextConnector(this.sisenseContextService),
    createThemeContextConnector(this.themeService),
  ]);

  const dashboard$ = new BehaviorSubject<D>(initialDashboard);

  hookAdapter.subscribe(({ dashboard }) => {
    dashboard$.next(toDashboardProps(dashboard) as D);
  });

  hookAdapter.run(toPreactDashboardProps(initialDashboard), options);

  // `createHookApiFacade` awaits the next adapter state and invokes the named callback.
  // Second arg `true` makes the returned function async (returns a Promise).
  const setFilters = createHookApiFacade(hookAdapter, 'setFilters', true);
  const setWidgetsLayout = createHookApiFacade(hookAdapter, 'setWidgetsLayout', true);

  const destroy = () => {
    hookAdapter.destroy();
    dashboard$.complete();
  };

  return { dashboard$, setFilters, setWidgetsLayout, destroy };
}
```

Key points:

- Return an object: `{ <state>$: Observable<T>, <callback>, <callback>, destroy }`. Callers subscribe and must invoke `destroy()` when done.
- Use `BehaviorSubject` (not `ReplaySubject`) — late subscribers get the _latest_ value, not every historical emission.
- `createHookApiFacade(adapter, 'methodName', isAsync)` wraps a callback from the hook's return object. The third arg controls whether the facade returns a Promise.
- Preserve input/output shape mismatch with translator helpers (`toDashboardProps` / `toPreactDashboardProps`) — don't cast.

### Imports

- Import the **preact** `use*Internal` (not the tracked `use*`) and the preact types.
- Never import from `@sisense/sdk-ui` in the wrapper packages.

## Vue shape — composable

File: `packages/sdk-ui-vue/src/composables/use-<kebab-name>.ts`

### Simple composable shape

For hooks whose React return is reactive state only (no imperative callbacks).

```typescript
import {
  type ExecuteCsvQueryParams,
  type ExecuteCsvQueryResult,
  HookAdapter,
  useExecuteCsvQueryInternal,
} from '@sisense/sdk-ui-preact';
import { onBeforeUnmount, toRefs, watch } from 'vue';

import { useTracking } from '../composables/use-tracking';
import { createSisenseContextConnector } from '../helpers/context-connectors/sisense-context-connector';
import { useRefState } from '../helpers/use-ref-state';
import { collectRefs, type MaybeRefOrWithRefs, toPlainObject } from '../utils';

/**
 * <Adapted TSDoc — see patterns/tsdoc.md>
 */
export const useExecuteCsvQuery = (params: MaybeRefOrWithRefs<ExecuteCsvQueryParams>) => {
  useTracking('useExecuteCsvQuery');

  const hookAdapter = new HookAdapter(useExecuteCsvQueryInternal, [
    createSisenseContextConnector(),
  ]);

  const [state, setState] = useRefState<ExecuteCsvQueryResult>({
    isLoading: true,
    isError: false,
    isSuccess: false,
    data: undefined,
    error: undefined,
    status: 'loading',
  });

  hookAdapter.subscribe((result) => setState(result));
  hookAdapter.run(toPlainObject(params));

  watch([...collectRefs(params)], () => {
    hookAdapter.run(toPlainObject(params));
  });

  onBeforeUnmount(() => hookAdapter.destroy());

  return toRefs(state.value);
};
```

### Complex composable shape

For hooks exposing both state AND callbacks. Return reactive refs plus facade functions (sync — Vue callers are fine with the HookAdapter's internal sequencing).

```typescript
import {
  type ComposedDashboardConfig,
  createHookApiFacade,
  type DashboardProps,
  HookAdapter,
  useComposedDashboardInternal,
} from '@sisense/sdk-ui-preact';
import { type MaybeRef, onBeforeUnmount, watch } from 'vue';

import { useTracking } from '../composables/use-tracking';
import { createSisenseContextConnector } from '../helpers/context-connectors/sisense-context-connector';
import { useRefState } from '../helpers/use-ref-state';
import { collectRefs, toPlainObject } from '../utils';

/**
 * <Adapted TSDoc — see patterns/tsdoc.md>
 */
export const useComposedDashboard = <D extends DashboardProps>(
  initialDashboard: MaybeRef<D>,
  options: ComposedDashboardConfig = {},
) => {
  useTracking('useComposedDashboard');

  const hookAdapter = new HookAdapter(useComposedDashboardInternal<D>, [
    createSisenseContextConnector(),
  ]);

  const [dashboard, setDashboard] = useRefState<D>(toPlainObject(initialDashboard));

  hookAdapter.subscribe(({ dashboard }) => setDashboard(dashboard));
  hookAdapter.run(toPlainObject(initialDashboard), options);

  watch([...collectRefs(initialDashboard)], () => {
    hookAdapter.run(toPlainObject(initialDashboard), options);
  });

  onBeforeUnmount(() => hookAdapter.destroy());

  const setFilters = createHookApiFacade(hookAdapter, 'setFilters');
  const setWidgetsLayout = createHookApiFacade(hookAdapter, 'setWidgetsLayout');

  return { dashboard, setFilters, setWidgetsLayout };
};
```

Initial state must match the shape of the hook's first return. Copy from the React source's `initialState` if exported; otherwise synthesize by reading the reducer/state type (e.g. `{ isLoading: true, isError: false, isSuccess: false, data: undefined, error: undefined }`).

### Connectors

Scan the React hook source for `useSisenseContext`, `useThemeContext`, `usePluginContext`, `useCustomWidgets` — each could corresponds to one or more connectors in the HookAdapter's connector array. The set must match the hook's internal context reads exactly; missing a connector causes the hook to read `undefined` at runtime.

### Barrel

Add to `packages/sdk-ui-vue/src/composables/index.ts`:

```typescript
export { useExecuteCsvQuery } from './use-execute-csv-query.js';
```

(Note the `.js` extension in the source barrel — match repo convention.)

## Pitfalls

- **Missing `useXxxInternal`**: split the hook in `sdk-ui` first (Phase 0.5 in `SKILL.md`). The split is a mechanical refactor — rename the function body to `...Internal`, add `withTracking` wrapper, surface both through the `sdk-ui` public API. Only stop and ask if the split is non-trivial (module-level state, entangled side effects).
- **Connector mismatch**: the connector list must mirror the hook's internal context reads. Grep the React hook body for `useSisenseContext`, `useThemeContext`, `usePluginContext`, `useCustomWidgets` before writing the adapter.
- **Callbacks inside params** (e.g. `onBeforeQuery`) — `toPlainObject` preserves them. Don't wrap them.
- **Tracking**: `useTracking(name)` is called once at the top of the Vue composable; Angular uses the class-level `@TrackableService` decorator. Don't wrap with `withTracking` (that's React-only).
- **Destroy discipline**: simple Angular methods destroy in `.finally()`; complex Angular methods require the caller to invoke the returned `destroy()`; Vue composables destroy in `onBeforeUnmount`.
- **BehaviorSubject vs ReplaySubject for complex hooks**: prefer `BehaviorSubject` initialized with the initial state so late subscribers see the latest only.
