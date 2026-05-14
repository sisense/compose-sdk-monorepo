# Pattern: Type or pure utility port

If the React symbol is a type alias, interface, enum, or pure function (no React/hooks), the port is almost always a re-export from `@sisense/sdk-ui-preact`.

## Angular

Add to `packages/sdk-ui-angular/src/lib/sdk-ui-core-exports.ts`:

```typescript
export { <utilName>, type <TypeName> } from '@sisense/sdk-ui-preact';
```

If it's an **event type** used by `@Output()` emitters, add to `packages/sdk-ui-angular/src/lib/types.ts` (and surface via `public-api.ts` if the neighbor events are there).

If the type needs framework-specific adaptation (e.g. React `MouseEventHandler<HTMLElement>` → plain function type), create a small adapter in `src/lib/types.ts`:

```typescript
export type <AngularEventName>Handler = (event: <EventShape>) => void;
```

## Vue

Add to `packages/sdk-ui-vue/src/sdk-ui-core-exports.ts`:

```typescript
export { <utilName>, type <TypeName> } from '@sisense/sdk-ui-preact';
```

If it's an event callback type, usually no adaptation needed — Vue callbacks are plain functions.

## When NOT to re-export

- Type refers to `React.ReactNode`, `React.FC`, `React.RefObject`, etc. — must be replaced (Angular: `TemplateRef` / Vue: `VNode | Slot`).
- Utility takes a React element as input — rewrite or do not expose.
- Type is marked `@internal` or `@sisenseInternal` — skip.

## Pitfalls

- **Double export collision**: before adding to `sdk-ui-core-exports.ts`, grep for the name — it may already be exported via `export *` from a barrel. If so, skip.
- **`type` keyword**: Always use `export type { X }` for types; TypeScript errors under `verbatimModuleSyntax` otherwise.
