# Pattern: Provider / React-context port

A React provider is a component that (1) accepts config via props, (2) builds/stores some derived context value, (3) exposes it to descendants via `Context.Provider`. The port rebuilds each piece in framework-native terms:

| React primitive                     | Angular                                                            | Vue                                                                          |
| ----------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Provider component with props       | `@Injectable({ providedIn: 'root' })` service                      | `defineComponent` with `props`, renders `<slot/>`                            |
| `useState`/`useReducer` for context | `BehaviorSubject` (has default) or `ReplaySubject(1)` (no default) | `ref<T>(initial)`                                                            |
| Config via props                    | `InjectionToken<ConfigType>` + optional `setConfig()` method       | `props` declared with `PropType<ConfigType>`                                 |
| `useEffect` for async init          | Constructor + `initializationPromise`                              | `watchEffect` / `watch(..., { immediate: true })`                            |
| `Context.Provider` + `children`     | `getX$()` Observable accessor                                      | `provide(key, ref)` + `slots.default?.()`                                    |
| Descendant `useContext(X)`          | Inject the service                                                 | `inject(key)` — or exported getter like `getX = () => inject(key, fallback)` |
| Parent provider dependency          | Inject the parent service                                          | `inject(parentKey)` inside `setup`                                           |

Reference implementations:

- **`SisenseContextProvider`** (no sensible default — caller must supply config): `SisenseContextService` (Angular), `SisenseContextProvider` (Vue)
- **`ThemeProvider`** (has system default, can nest/merge with outer theme): `ThemeService` (Angular), `ThemeProvider` (Vue)

## Angular shape

File: `packages/sdk-ui-angular/src/lib/services/<kebab-name>.service.ts`

```typescript
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { BehaviorSubject, /* or */ ReplaySubject, firstValueFrom, type Observable } from 'rxjs';
import {
  <initBuilder>,           // e.g. factory, application creator, or a default-getter
  type <ConfigType>,
  type <ContextShape>,
} from '@sisense/sdk-ui-preact';

import { TrackableService } from '../decorators/trackable.decorator';

/**
 * Token used to inject {@link <ConfigType>} into your application.
 *
 * @group Contexts
 */
export const <CONFIG_TOKEN> = new InjectionToken<<ConfigType>>('<kebab-name> configuration');

export type { <ConfigType> };

/**
 * <Adapted TSDoc — see patterns/tsdoc.md>
 *
 * @group Contexts
 */
@Injectable({ providedIn: 'root' })
@TrackableService<<Name>Service>([/* public method names that need tracking */])
export class <Name>Service {
  // Pick based on whether a sensible default exists:
  //   BehaviorSubject(initial)       — default known at construction (e.g. ThemeService, getDefaultThemeSettings())
  //   ReplaySubject<T>(1)            — no default; emit only after async init (e.g. SisenseContextService)
  private readonly state$ = new BehaviorSubject<<ContextShape>>(<initialValue>);

  private initializationPromise: Promise<void> = Promise.resolve();

  constructor(
    // Inject parent-provider services the React provider's hook calls (e.g. useSisenseContext)
    @Optional() private parentService?: <ParentService>,
    @Optional() @Inject(<CONFIG_TOKEN>) config?: <ConfigType>,
  ) {
    this.initializationPromise = this.init(config);
  }

  private async init(config?: <ConfigType>): Promise<void> {
    try {
      // Mirror whatever the React provider does on mount: fetch defaults, merge with user config,
      // subscribe to parent-service changes, etc. Keep branches aligned with the React source.
      const value = await <initBuilder>({ ...config, packageName: 'sdk-ui-angular' });
      this.state$.next(value);
    } catch (error) {
      this.state$.error(error as Error);
    }
  }

  /** Observable of the current context. @internal (or public per React provider's surface) */
  getState$(): Observable<<ContextShape>> {
    return this.state$.asObservable();
  }

  /** Async accessor for one-shot consumers. */
  async getValue(): Promise<<ContextShape>> {
    await this.initializationPromise;
    return firstValueFrom(this.state$);
  }

  /**
   * Imperative update — optional, mirror whatever setter the React provider exposes
   * (e.g. ThemeProvider's theme prop change → ThemeService.updateThemeSettings).
   */
  async update<Field>(next: <FieldType>): Promise<void> {
    await this.initializationPromise;
    // recompute and emit
  }
}
```

### Choosing `BehaviorSubject` vs `ReplaySubject(1)`

- **`BehaviorSubject(initial)`** — use when a sensible default is computable synchronously at construction (`ThemeService` starts from `getDefaultThemeSettings()`). Late subscribers immediately see the latest value.
- **`ReplaySubject<T>(1)`** — use when there is no meaningful value until async init completes (`SisenseContextService` has no app until it connects). Late subscribers still get the last emitted value, but no emission happens until `next()` is called.

### InjectionToken and module wiring

If the provider takes user-supplied config, register a `InjectionToken<<ConfigType>>` (naming convention: `<NAME>_CONFIG_TOKEN`) at the top of the service file, and document the injection pattern in TSDoc (users provide via `{ provide: <TOKEN>, useValue: ... }` in their `NgModule`). Do **not** register a default provider in `sdk-ui.module.ts` for the config — it's optional.

Export the service and token from `packages/sdk-ui-angular/src/lib/services/index.ts`.

### Context connector pairing

Each provider-service must have a matching connector at `packages/sdk-ui-angular/src/lib/component-wrapper-helpers/context-connectors.ts`:

```typescript
export const create<Name>ContextConnector = (
  service: <Name>Service,
): ContextConnector<<PreactProviderProps>> => {
  const propsObserver = new DataObserver<<PreactProviderProps>>({ /* initial */ });

  service.getState$().subscribe({
    next: (value) => propsObserver.setValue({ context: value /* or derived shape */ }),
    error: (error) => propsObserver.setValue({ error }),
  });

  return {
    propsObserver,
    providerComponent: <PreactProviderComponent>,
  };
};
```

Every wrapper component that depends on this context must include the connector in its `ComponentAdapter` constructor array.

## Vue shape

File: `packages/sdk-ui-vue/src/providers/<kebab-name>-provider/<kebab-name>-provider.ts`

```typescript
import { defineComponent, provide, ref, watchEffect, type PropType } from 'vue';
import {
  <initBuilder>,
  type <ConfigType>,
  type <ContextShape>,
} from '@sisense/sdk-ui-preact';

import { get<Parent>Context } from '../<parent-kebab>-provider/<parent-kebab>-context';
import { <contextKey> } from './<kebab-name>-context';

/**
 * <Adapted TSDoc — see patterns/tsdoc.md>
 *
 * @group Contexts
 */
export const <Name>Provider = defineComponent({
  props: {
    // One entry per field of <ConfigType>. Use PropType<...> to preserve type info.
    // Multi-type unions use tuple: [Object, String] as PropType<'a' | 'b' | MyObj>.
  },
  setup(props, { slots }) {
    // 1. Read parent contexts this provider depends on (matches React hook calls)
    const parentCtx = get<Parent>Context();

    // 2. Local reactive state — seed with default or parent value, mirror React `useState` initial
    const state = ref<<ContextShape>>(<initial or parentCtx?.value>);

    // 3. React to prop/parent changes and rebuild the context
    watchEffect(async () => {
      try {
        const value = await <initBuilder>({
          ...(props as any),
          packageName: 'sdk-ui-vue',
          // merge with parent context if this provider nests (e.g. ThemeProvider)
        });
        state.value = value;
      } catch (error) {
        console.error('<Name>Provider failed:', error);
      }
    });

    // 4. Publish via provide()
    provide(<contextKey>, state);

    // 5. Render children
    return () => slots.default?.();
  },
});
```

### Context keys and getters

Keys live in a sibling file `<kebab-name>-context.ts` (match neighbor convention):

```typescript
// <kebab-name>-context.ts
import { inject, ref, type InjectionKey, type Ref } from 'vue';
import type { <ContextShape> } from '@sisense/sdk-ui-preact';

export const <contextKey>: InjectionKey<Ref<<ContextShape> | undefined>> = Symbol('<Name>Context');

export const get<Name>Context = () =>
  inject(<contextKey>, /* fallback */ ref(undefined));
```

Export the provider from the provider folder's `index.ts` and from `packages/sdk-ui-vue/src/providers/index.ts`. Re-export via `src/lib.ts` matching the neighbor entry style.

### Context connector pairing

File: `packages/sdk-ui-vue/src/helpers/context-connectors/<kebab-name>-context-connector.ts`

```typescript
import { watch } from 'vue';
import { DataObserver, type ContextConnector } from '@sisense/sdk-ui-preact';
import { get<Name>Context } from '../../providers/<kebab-name>-provider/<kebab-name>-context';

export const create<Name>ContextConnector = (): ContextConnector<...> => {
  const ctx = get<Name>Context();
  const propsObserver = new DataObserver({ context: ctx?.value });
  if (ctx) watch(ctx, (v) => propsObserver.setValue({ context: v }));
  return { propsObserver, providerComponent: <PreactProviderComponent> };
};
```

Register in `packages/sdk-ui-vue/src/helpers/context-connectors/index.ts`.

## Deciding what to port

The React provider often wraps framework-only plumbing (`<EmotionCacheProvider>`, `<I18nProvider>`, `<ErrorBoundary>`) — **do not port those wrappers**. Port only the domain context that the preact-level provider expects. A rough cut:

- **Port**: context shape, async init logic, merge-with-parent logic, imperative setters, error propagation, config prop → context derivation.
- **Skip**: React error boundaries, emotion/i18n providers, component-tree wrappers, `children` prop plumbing.

If the React source's `Provider` _is_ doing something like composing multiple nested providers, port each layer separately (one service / one Vue provider per domain concern), not as a single monolith.

## Pitfalls

- **Package-name tag**: every call to a preact application creator / factory must set `packageName: 'sdk-ui-angular'` or `'sdk-ui-vue'` for attribution.
- **Default vs no-default choice drives Subject type.** `BehaviorSubject` needs a synchronously-computable initial; `ReplaySubject(1)` gives late subscribers the last `next()` but nothing before init. Pick deliberately — mismatched choice either emits stale defaults or leaves consumers waiting forever.
- **Initial state emission**: if the React provider's `useContext(X)` synchronously yields a value on first render, the port must match — seed the Vue `ref` with the same initial, or `next()` the Angular `BehaviorSubject` with the same default at construction.
- **Error propagation**: emit errors via the stream (`state$.error(err)` / `state$.next({ error })`) or an adjacent `errorRef`, never throw from a setter. The context connector's `error` branch handles rendering.
- **Nesting / inheritance**: providers like `ThemeProvider` merge with an outer provider's value. In Angular, inject the parent service and subscribe; in Vue, read the parent's context via `inject`/getter in `setup` and merge inside `watchEffect`. Test with nested providers before reporting success.
- **Don't port React wrapper nesting** (`<EmotionCacheProvider><I18nProvider><ErrorBoundary>...`) — that's React-framework plumbing.
