---
name: check-public-api
description: Validate the sdk-ui public API surface. Use when adding exports to public-api/ barrels, after changing TSDoc tags, or before submitting an MR that touches public APIs.
allowed-tools: Bash(yarn public-api-check) Read
---

# Check Public API Surface

```bash
yarn public-api-check
```

Runs `packages/sdk-ui/scripts/public-api-check/index.cjs` using the TypeScript compiler API.

---

## What is validated

Four barrel files in `packages/sdk-ui/src/public-api/` are checked:

| Barrel                | Required TSDoc tag |
| --------------------- | ------------------ |
| `sisense-internal.ts` | `@sisenseInternal` |
| `beta.ts`             | `@beta`            |
| `alpha.ts`            | `@alpha`           |
| `internal.ts`         | `@internal`        |

`public.ts` and `index.ts` are **not** validated — wildcard exports are allowed there.

**Rules per barrel:**

1. No wildcard exports (`export *`, `export * as ns`) — named exports only
2. Each exported symbol's declaration must carry the barrel's TSDoc tag (tag can be on the declaration or an ancestor node)
3. Module must resolve via the TypeScript compiler

---

## Reading violations

```text
VIOLATION in src/public-api/beta.ts
  Export: MyComponent
  File: src/components/my-component.tsx:42
  Reason: Missing required tag @beta
```

Fields: `barrelPath`, `exportName` (`*` for wildcard), `file`, `line`, `reason`.

---

## Fixing violations

**Missing TSDoc tag** — add the tag to the source declaration:

```ts
/**
 * Renders a chart with custom data.
 *
 * @beta
 */
export const MyComponent = ...
```

**Wildcard export** — replace with named exports:

```ts
// Before (forbidden in checked barrels)
export * from '../components/my-component.js';

// After
export { MyComponent } from '../components/my-component.js';
```

Re-run after fixing: `yarn public-api-check`
Success: `Public API check passed.`

---

## Adding a new export to the public API

1. Decide stability level: `public`, `@beta`, `@alpha`, `@internal`, or `@sisenseInternal`
2. Add the TSDoc tag to the source declaration
3. Add a named export to the corresponding barrel in `packages/sdk-ui/src/public-api/`
4. Run `yarn public-api-check`
5. For stable public exports, verify the symbol is also in `public.ts` and regenerate docs: `yarn docs:gen:md`
