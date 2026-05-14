---
name: port-to-frameworks
description: Port React functionality (components, hooks, providers, utilities, types) from sdk-ui to sdk-ui-angular and/or sdk-ui-vue. Also supports porting a single newly-added property/param of an already-ported symbol. Use when the user requests "/port-to-frameworks <name>" or asks to port/wrap/mirror a React symbol — or a new field on one — to Angular and Vue.
argument-hint: <React-symbol-name-or-path> [.<property-name>] [--angular] [--vue]
disable-model-invocation: false
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
---

# Port React functionality to Angular and Vue

Automates porting a React symbol (component/hook/provider/util/type) — or a newly-added property of an already-ported symbol — from `packages/sdk-ui` to `packages/sdk-ui-angular` and/or `packages/sdk-ui-vue`. Input: `$ARGUMENTS`.

## Input parsing

Accept either form:

- **Slash**: `/port-to-frameworks Chart --angular --vue` or `/port-to-frameworks Chart.onBeforeRender --angular --vue`
- **Freeform**: "port the Chart component to Angular and Vue", "port the new `onBeforeRender` prop on Chart", "add the `count` param to `useExecuteQuery` in the Angular and Vue wrappers"

Extract:

1. **Target symbol** — name (e.g. `Chart`) or path (e.g. `packages/sdk-ui/src/domains/visualizations/components/chart/chart.tsx`).
2. **Optional property selector** — if the user names a specific prop / param / return field of the symbol (e.g. `Chart.onBeforeRender`, "the `count` param on `useExecuteQuery`"). When present, the symbol's kind is "property change on an already-ported symbol" (see Phase 0 classification).
3. **Targets** — `{ angular: bool, vue: bool }`. If neither flag is given, default to **both**.

If the symbol is ambiguous (not a path and multiple matches exist), run `Grep` for `export.*<Name>` inside `packages/sdk-ui/src` and ask the user once to disambiguate. Don't guess.

## Phase 0 — Discover

Before writing anything:

1. **Locate the React source** via `Glob`/`Grep`. Read the full file.
2. **Classify the symbol**:
   - React component (JSX return, `FC`/`FunctionComponent` or `asSisenseComponent(...)` wrapper) → `patterns/component.md`
   - React hook (`use*` name, no JSX) → `patterns/hook.md`. Always use **HookAdapter style**. If the `useXxxInternal` variant is missing, **create it in `sdk-ui` first** (see Phase 0.5 below), then proceed. Do NOT fall back to a manual reimplementation — that's the legacy style and is being phased out.
   - Provider / React Context (`createContext`, `Provider` wrapper) → `patterns/provider.md`
   - Pure utility / type → `patterns/type-or-util.md` (re-export from preact or copy type aliases)
   - **Property change on an already-ported symbol** (user named a specific prop / param / return field, and a wrapper for the symbol already exists in the target framework) → `patterns/property.md`. Use this when the task is surgical — bring one field across, not the whole symbol.
3. **Enumerate related symbols that must also be ported**. Scan the source's `Props` type and public return type. Any referenced non-primitive type, enum, event handler alias, or sibling component _not_ already re-exported from the target package must be ported too. Build a list; you'll ship it in the summary.
4. **Confirm the `sdk-ui` public-API export.** `@sisense/sdk-ui-preact` wildcard-re-exports everything from `@sisense/sdk-ui`, so the only thing to verify is that the symbol (and, for hooks, its `*Internal` variant) is exported from `sdk-ui`'s public API (`packages/sdk-ui/src/index.ts` or `packages/sdk-ui/src/public-api/*.ts`). If missing, add the entry — no edits to the `sdk-ui-preact` package itself are needed.

## Phase 0.5 — Create the `useXxxInternal` in `sdk-ui` (hooks only, when missing)

Applies only when porting a React hook and the internal variant doesn't exist yet. Skip otherwise.

The repo convention is to split every hook into a tracked public export and an untracked internal export:

```typescript
// packages/sdk-ui/src/…/use-foo/use-foo.ts
export function useFooInternal(params: UseFooParams): UseFooResult {
  // actual implementation
}

export function useFoo(params: UseFooParams): UseFooResult {
  return withTracking('useFoo')(useFooInternal)(params);
}
```

If the existing hook is still one-function (no `Internal` split):

1. Rename the current function body to `useXxxInternal` (same params, same return, same module).
2. Add the tracked wrapper: `export function useXxx(params: UseXxxParams): UseXxxResult { return withTracking('useXxx')(useXxxInternal)(params); }`
3. Export the `*Internal` variant from `packages/sdk-ui/src/public-api/internal.ts` (this is the dedicated barrel for `@internal` symbols). The tracked public `useXxx` stays wherever neighbor hooks already live (e.g. `public-api/public.ts`, `public-api/beta.ts`, or `public-api/alpha.ts`). Match neighbor hooks — e.g. `useExecuteCsvQueryInternal` is exported from `public-api/internal.ts` while `useExecuteCsvQuery` is exported from the public stability barrel.
4. Do not change call sites inside `sdk-ui` — they should keep using the tracked `useXxx` (tracking still fires for React consumers).
5. Run `yarn workspace @sisense/sdk-ui type-check` to confirm the split compiles.
6. After this refactor, proceed with the port using HookAdapter style as normal.

Be careful:

- Don't break existing tracking — the public name must stay `useXxx` and route through `withTracking`.
- Don't leak `useXxxInternal` out of the API you didn't intend — but since Vue/Angular wrappers need it, surface it at the same level as the other `*Internal` hooks.
- **Stability tags**: the `*Internal` variant is always tagged `@internal` (regardless of source). The tracked public export keeps the source hook's tags verbatim (`@beta`, `@alpha`, none, etc.). The framework ports (Angular service method, Vue composable) also mirror the source hook's stability tags — not `@internal`.

## Phase 1 — Generate ports

Follow the recipe for the symbol's class. Each recipe is a self-contained file in `patterns/`:

- **Component** → read `patterns/component.md`
- **Hook** → read `patterns/hook.md`
- **Provider / context** → read `patterns/provider.md`
- **Type / utility** → read `patterns/type-or-util.md`
- **Property change on an already-ported symbol** → read `patterns/property.md`

For each framework target, produce:

### Angular (`packages/sdk-ui-angular/`)

- Component → `src/lib/components/<domain>/<kebab-name>.component.ts`, class `<Pascal>Component`, selector `csdk-<kebab-name>`
- Hook → **prefer adding a method** to the closest existing service under `src/lib/services/` (e.g. `QueryService`, `DashboardService`, `ThemeService`). If no existing service fits the hook's domain, **create a new service** at `src/lib/services/<kebab-name>.service.ts` following the conventions of neighbors (`@Injectable({ providedIn: 'root' })`, inject `SisenseContextService`, etc.) and register it in `src/lib/services/index.ts`. Decorate with `@TrackableService<Service>(['methodName', ...])` (extend the existing list or start a new one).
- Provider → `src/lib/services/<kebab-name>.service.ts`, class `<Pascal>Service`, `@Injectable({ providedIn: 'root' })`
- Type/util → extend `src/lib/types.ts` or `src/lib/sdk-ui-core-exports.ts`

### Vue (`packages/sdk-ui-vue/`)

- Component → `src/components/<domain>/<kebab-name>.ts` (use `.vue` only if matching neighbor file convention)
- Hook → `src/composables/use-<kebab-name>.ts`
- Provider → `src/providers/<kebab-name>-provider/<kebab-name>-provider.ts`
- Type/util → extend `src/sdk-ui-core-exports.ts` or create adjacent file

## Phase 2 — TSDoc adaptation

Copy the TSDoc from React source, then adapt per framework. **Every `@example` must be rewritten** — React JSX does not compile in Angular/Vue docs. See `patterns/tsdoc.md`. Preserve `@group`, `@shortDescription`, `@beta`/`@alpha`/`@internal` tags verbatim.

## Phase 3 — Public-API barrels

Wire the new symbols into the package's public surface. Exact locations:

**Angular:**

- `packages/sdk-ui-angular/src/public-api.ts` — top-level type re-exports (only for new type aliases)
- `packages/sdk-ui-angular/src/lib/components/index.ts` — components
- `packages/sdk-ui-angular/src/lib/services/index.ts` — services
- `packages/sdk-ui-angular/src/lib/sdk-ui.module.ts` — components go in `declarations` AND `exports` of `@NgModule`
- `packages/sdk-ui-angular/src/lib/types.ts` — event types

**Vue:**

- `packages/sdk-ui-vue/src/lib.ts` — main barrel (components, providers, composables, types)
- `packages/sdk-ui-vue/src/composables/index.ts` — composables
- Individual domain barrels under `src/components/<domain>/index.ts` if they exist — follow neighbors

Always match the style of adjacent exports (named vs default, `type` keyword usage).

## Phase 4 — Tests

Generate minimal test files so CI has coverage for the new symbol. Patterns in `patterns/tests.md`. Files:

- Angular component → `<kebab-name>.component.test.ts` next to the component (note: `.test.ts`, not `.spec.ts` — match existing repo convention)
- Angular service → extend the existing `<name>.service.test.ts` with a `describe('<newMethod>')` block
- Vue component → `<kebab-name>.test.ts` next to component
- Vue composable → `use-<kebab-name>.test.ts`

Tests must mock `@sisense/sdk-ui-preact` and the `TrackableService`/`useTracking` decorators, and verify the port calls preact correctly.

## Phase 5 — Validate

If you split a hook in Phase 0.5 (touched `packages/sdk-ui`), run:

```bash
yarn workspace @sisense/sdk-ui build
yarn public-api-check
```

Run in this order, per touched framework:

```bash
yarn workspace @sisense/sdk-ui-angular build
```

```bash
yarn workspace @sisense/sdk-ui-vue build
```

If a build fails, **fix the issue before reporting success**. Do not paper over errors with `any` or `@ts-ignore`. Common failures:

- Missing connector import (add to context-connectors list)
- Event type not exported from `@sisense/sdk-ui` (export gap — surface to user)
- Angular `@Input`/`@Output` name collision with a lifecycle method (rename the `@Output`)

## Phase 6 — Summary

Report back with a short bullet list:

```
Ported <symbol> to [angular, vue].

Angular:
- Created: <paths>
- Modified: <paths>
- Style: <component | hook-adapter method | provider-service | property-delta>

Vue:
- Created: <paths>
- Modified: <paths>
- Style: <component | hook-adapter composable | provider-component | property-delta>

Related symbols also ported: <type X, handler Y, ...>

Validation: build ✓, tests generated ✓
```

Keep the summary under 30 lines. For property-delta ports, "Created" is usually empty and the summary lists only the modified wrapper and test files plus the property name.

## Non-negotiable rules

- **Wrap preact, not React.** Angular/Vue imports come from `@sisense/sdk-ui-preact`, never `@sisense/sdk-ui`.
- **No `any` casts** without a documented reason.
- **No Sisense internals** in comments/strings (this repo mirrors to public GitHub). Jira IDs are fine in commit messages only, but this skill doesn't commit.
- **Prefer editing existing files** over creating new ones (especially services, barrels, types.ts).
- **Kebab-case filenames**, PascalCase classes, camelCase functions (matches repo convention).
- **Direct imports only** — `lodash-es/flow` not `{ flow } from 'lodash-es'`.
- **No stale `// removed X` comments**, no backwards-compat shims.

## When to stop and ask

- Symbol not found in `sdk-ui`, or multiple candidates.
- Target symbol not (yet) exported from `sdk-ui` **and** adding the export would require non-trivial structural changes to the source package.
- Hook's existing body has side effects outside the function scope that make the `useXxxInternal` split non-mechanical (e.g. module-level state that would double-initialize).
- User-facing API shape differs significantly between frameworks (e.g. callback vs. observable) — confirm the translation.

Otherwise proceed without interruption; the user asked for full generation.
