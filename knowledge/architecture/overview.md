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
   directly (stated in [CLAUDE.md](../../CLAUDE.md); enforced by intent).
4. Imports of `lodash`, `lodash-es`, `@mui/material`, and `@mui/icons-material` must use
   direct subpaths (`lodash-es/debounce`, `@mui/material/Button`) — enforced by the
   `no-restricted-imports` ESLint rule at [eslint.config.mjs:257](../../eslint.config.mjs:257).
5. Source code must not reference Sisense-internal systems; the repo is mirrored to public
   GitHub. Jira tickets belong in commit messages only ([CLAUDE.md](../../CLAUDE.md);
   enforced by review intent).
6. `sdk-data` builds with `tsc` (`tsc --build tsconfig.build.json` in
   [packages/sdk-data/package.json](../../packages/sdk-data/package.json)), not Vite —
   keep it free of bundler-only syntax and assets.
7. Changes to the `sdk-ui` public API surface must pass `yarn public-api-check`; stability
   is declared with TSDoc tags (`@beta`, `@alpha`, `@internal`, `@sisenseInternal`) under
   [packages/sdk-ui/src/public-api](../../packages/sdk-ui/src/public-api).
8. No `any` type without an inline single-line rationale at the usage site
   ([CLAUDE.md](../../CLAUDE.md); enforced by review intent).

# Related

- [sdk-data overview](../sdk-data/overview.md) - the first documented layer of the chain.
