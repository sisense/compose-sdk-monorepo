---
type: Architecture
title: Monorepo architecture invariants
description: Prescriptive layer model and invariants that new code in the Compose SDK monorepo must respect.
resource: packages
tags: [architecture, invariants, monorepo]
---

# Layers

Packages form layers; imports flow only downward — a package may import from lower layers,
never from a higher one ("never import upward", [CLAUDE.md](../../CLAUDE.md)). Actual
workspace dependencies per `package.json`:

```text
Layer 3 (top):  UI packages (sdk-ui, sdk-pivot-ui, …) — may depend on any lower layer
Layer 2:        sdk-query-client — depends on sdk-data, sdk-rest-client, sdk-common
Layer 1:        sdk-data, sdk-rest-client — depend on sdk-common only
Layer 0 (base): sdk-common — no workspace dependencies
```

Framework wrappers sit on top of a Preact adapter, not on sdk-ui directly:

```text
sdk-ui → sdk-ui-preact → { sdk-ui-angular, sdk-ui-vue }
```

Internal dependencies use the `workspace:*` protocol in each `package.json`.

# Invariants

1. A package must not import "upward" in the layer model above (enforced by workspace
   `package.json` dependency declarations and review intent — there is no NX
   `depConstraints` config).
2. `sdk-data` must stay UI-free: its only runtime dependencies are `@sisense/sdk-common`,
   `hash-it`, and `lodash-es` ([packages/sdk-data/package.json](../../packages/sdk-data/package.json)).
   Never add React, DOM, or HTTP dependencies to it.
3. `sdk-ui-angular` and `sdk-ui-vue` must depend on `sdk-ui-preact`, never on `sdk-ui`
   directly (stated in [CLAUDE.md](../../CLAUDE.md); enforced by intent). They take public APIs
   from `@sisense/sdk-ui-preact` and sdk-ui's `@internal` APIs plus the Preact adapter layer
   from `@sisense/sdk-ui-preact/internal`.
4. Imports of `lodash`, `lodash-es`, `@mui/material`, and `@mui/icons-material` must use
   direct subpaths (`lodash-es/debounce`, `@mui/material/Button`) — enforced by the
   `no-restricted-imports` ESLint rule at [eslint.config.mjs:305](../../eslint.config.mjs:305).
5. Source code must not reference Sisense-internal systems; the repo is mirrored to public
   GitHub. Jira tickets belong in commit messages only ([CLAUDE.md](../../CLAUDE.md);
   enforced by review intent).
6. `sdk-data` builds with `tsc` (`tsc --build tsconfig.build.json` in
   [packages/sdk-data/package.json](../../packages/sdk-data/package.json)), not Vite —
   keep it free of bundler-only syntax and assets.
7. Changes to the `sdk-ui` public API surface must pass `yarn public-api-check`; stability
   is declared with TSDoc tags (`@beta`, `@alpha`, `@internal`, `@sisenseInternal`) and listed in
   per-level barrels: public/beta/alpha under
   [packages/sdk-ui/src/public-api](../../packages/sdk-ui/src/public-api), the two non-public
   levels in their own entry points under
   [packages/sdk-ui/src/modules/internal](../../packages/sdk-ui/src/modules/internal) and
   [packages/sdk-ui/src/modules/sisense-internal](../../packages/sdk-ui/src/modules/sisense-internal).
8. No `any` type without an inline single-line rationale at the usage site
   ([CLAUDE.md](../../CLAUDE.md); enforced by review intent).
9. `@sisense/sdk-ui/internal` exports only `@internal` names and
   `@sisense/sdk-ui/sisense-internal` only `@sisenseInternal` names; `yarn public-api-check`
   fails when an entry exports a name outside its level. The internal entry also re-exports the
   `query` module's internal tier; that is interim, and long term a module serves its internals from
   a sub-entry of its own (e.g. `@sisense/sdk-ui/query/internal`). The package root exports neither
   level; the in-company UMD entry (`src/index.umd.ts`) re-exports both. Rules for these entries:
   [structure guideline](../../packages/sdk-ui/__dev-docs__/PACKAGE_CODEBASE_STRUCTURE_GUIDELINE.md),
   §9.

# Related

- [sdk-data overview](../sdk-data/overview.md) - the first documented layer of the chain.
