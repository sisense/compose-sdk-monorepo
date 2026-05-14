# Pattern: Property-level port

Use this pattern when a **single new field** (component prop, component event, hook param, hook return field, service-method arg, provider config field) has been added to a React symbol that is **already ported** in the target framework. The goal is a minimal surgical edit — add just that field to the existing wrapper, matching the surrounding style.

Classify as this pattern when:

- The user named a specific property (e.g. `Chart.onBeforeRender`, "the `count` param on `useExecuteQuery`", "the `theme` prop on `ThemeProvider`"), AND
- The symbol's wrapper file already exists in the target framework.

If either is false, use `patterns/component.md` / `patterns/hook.md` / `patterns/provider.md` for a full port instead.

## Step 1 — Locate the existing wrapper

For each target framework:

- **Angular**: `Grep` for `class <SymbolName>Component` or the service-method name under `packages/sdk-ui-angular/src/lib/`.
- **Vue**: `Grep` for `export const <SymbolName> = defineComponent` or `export const <useHook> =` under `packages/sdk-ui-vue/src/`.

Read the wrapper file(s) in full before editing — match the surrounding declaration style (required/optional markers, `PropType` usage, translator helpers, TSDoc tone).

If a target framework lacks the wrapper, finish the execution and describe the outcome in the summary.

## Step 2 — Read the React-side declaration

Find the property on the React source's `Props` / params / return type. Read:

- Its TypeScript type (primitive, union, function, non-primitive object, enum).
- Its TSDoc (copy the tags verbatim; rewrite `@example` per `patterns/tsdoc.md`).
- Any translator/adapter step the React side applies (e.g. a wrapper hook that reshapes the callback argument).

If the property's type is a non-primitive that isn't yet re-exported from the wrapper package, plan to add the re-export in Step 5.

## Step 3 — Apply the delta by property kind

### Component prop (data-bound input)

**Angular** (`<kebab-name>.component.ts`):

```typescript
/** <short TSDoc> */
@Input() <propName>!: <SymbolName>Props['<propName>'];   // use `?:` if optional
```

Then add the field to `getPreactComponentProps()`:

```typescript
return {
  // …existing
  <propName>: this.<propName>,
};
```

**Vue** (`<kebab-name>.ts`):

```typescript
props: {
  // …existing
  <propName>: {
    type: <JS ctor or tuple> as PropType<<SymbolName>Props['<propName>']>,
    required: <bool>,
  },
},
```

`setupHelper` forwards the new prop automatically; no template / return changes needed.

### Component event (callback prop that React calls)

**Angular**:

```typescript
/** <short TSDoc> */
@Output() <eventName> = new EventEmitter<<EventType>>();
```

Wire in `getPreactComponentProps()`:

```typescript
on<Event>: (arg) => this.<eventName>.emit(arg),
```

If `<EventType>` is a new alias, also add a re-export (Step 5).

**Vue**: add a `Function` prop — `setupHelper` passes the user's handler straight through to preact:

```typescript
on<Event>: {
  type: Function as PropType<<SymbolName>Props['on<Event>']>,
  required: false,
},
```

### Hook param field (added to a hook's params type)

**Angular service method**:

- If the method spreads `params` directly into the preact call, no code change is needed — TypeScript picks up the new field through the preact-level type. Update the method's TSDoc if it enumerates params.
- If the method maps fields one-by-one, add the new field at the preact call-site.

**Vue composable**:

- `toPlainObject(params)` forwards arbitrary fields to the preact hook — no code change in the body.
- Update the composable's TSDoc if it enumerates params.

### Hook return field (new field exposed by the hook)

**Angular simple method** (Promise-returning): widen the resolved return type and include the new field in the resolved object.

```typescript
async <methodName>(params): Promise<{ data: D; <newField>: T }> {
  // …
  resolve({ data, <newField> });
}
```

**Angular complex method** (Observable + callbacks): choose the right surface for the new field:

- Reactive state → extend the existing `BehaviorSubject` payload, or add a sibling `<newField>$: Observable<T>` if it has a different lifecycle.
- Callback → expose via a new `createHookApiFacade(hookAdapter, '<newField>', <async?>)` entry alongside the existing facades.

**Vue composable**: extend the initial state passed to `useRefState` so the new field is included; `toRefs` automatically exposes it. No consumer-side changes needed.

### Provider config field (new field on the provider's config type)

**Angular service**:

- The `InjectionToken<<ConfigType>>` already carries the new field through TypeScript. Wire it into `setConfig` / `init` / the stream emission.

**Vue provider**:

- Add a new entry to the `defineComponent` `props` (with matching `PropType`).
- Read it inside `watchEffect` / `watch` so changes rebuild the context.

## Step 4 — TSDoc

Copy the property's TSDoc from the React source verbatim for the tags (`@param`, `@returns`, `@beta`, `@alpha`, `@internal`, `@deprecated`). Rewrite any `@example` per `patterns/tsdoc.md` — React JSX doesn't compile in Angular/Vue docs. Keep stability tags unchanged.

Place the TSDoc directly above the new `@Input` / `@Output` / `props` entry — do not touch TSDoc on unrelated members.

## Step 5 — Barrels and types

Usually nothing changes. Exceptions:

- **New non-primitive type** referenced by the prop/param:
  - If it's the `Props` type for a component → re-export from the component file itself (per `patterns/component.md`).
  - Otherwise → add to `packages/sdk-ui-angular/src/lib/sdk-ui-core-exports.ts` and `packages/sdk-ui-vue/src/sdk-ui-core-exports.ts`.
- **New event-type alias** (Angular `@Output` event payload) → add to `packages/sdk-ui-angular/src/lib/types.ts` if neighbor events live there.

All re-exports come from `@sisense/sdk-ui-preact`.

## Step 6 — Tests

Add a focused case to the existing test file — do not regenerate it. Add one new `it(...)` or extend the existing one to verify the new field is forwarded to preact:

- **Angular component**: assert that the `componentAdapter.render` call receives `<propName>: <value>` (or that `<eventName>.emit` fires for events).
- **Angular service method**: assert the preact `use<X>Internal` (via `HookAdapter`) was called with the new param, or that the resolved Promise includes the new return field.
- **Vue component**: assert that the `setupHelper` render function receives the new prop.
- **Vue composable**: assert that `toRefs` exposes the new ref, or that `toPlainObject` forwards the new param.

Patterns: `patterns/tests.md`.

## Step 7 — Validate

Run only the affected framework's `build`:

```bash
yarn workspace @sisense/sdk-ui-angular build
```

```bash
yarn workspace @sisense/sdk-ui-vue build
```

## Pitfalls

- **Don't regenerate the wrapper.** Adding a single `@Input` or `props` entry is the whole change. If you feel the urge to rewrite the file, you picked the wrong pattern — use the full port pattern instead.
- **Stability tag drift**: if the React-side property is `@beta` and the existing wrapper is not, copying the tag verbatim will flag the whole wrapper as beta-adjacent. Keep the tag on _just the new field_, not the class. Same for `@deprecated`.
- **Event payload shape mismatches**: if the React callback receives `(a, b, c)` but the Angular `@Output` convention is a single-object payload, wrap in `getPreactComponentProps` — don't change the preact contract.
- **Missing translator update**: if the wrapper uses a props-translator helper (e.g. `chart-props-preact-translator.ts`), check whether the new field needs to flow through it. A new field that maps one-to-one does not; a new field that needs shape conversion does.
