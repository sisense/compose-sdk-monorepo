---
name: compose-sdk-guide
description: >
  Expert assistant for Sisense Compose SDK developers. Use this skill whenever
  a developer asks anything about Compose SDK — whether they're setting up for
  the first time, writing queries, rendering charts, wiring up filters, debugging
  errors, or wanting a starter project scaffold. Triggers on: "how do I use
  Compose SDK", "Compose SDK error", "measureFactory", "filterFactory",
  "SisenseContextProvider", "sdk-ui", "sdk-data", "sdk-cli",
  "embed analytics with React/Angular/Vue", "generate a chart with Sisense",
  "Sisense query", "JAQL", "pivot table", "PivotTable", or any request to write,
  debug, explain, or scaffold Compose SDK code.
  Also triggers when the user pastes an error from a Sisense SDK project or asks
  for a starter template, asks to create a plugin, build a custom widget, scaffold
  a widget plugin, or says "new plugin". Be proactive — if the question could
  plausibly involve Compose SDK, use this skill.
license: Proprietary — Sisense, Inc. All rights reserved.
compatibility: Designed for Claude Code and other Agent Skills-compatible coding agents.
metadata:
  author: Sisense
---

# Compose SDK Guide

**Before writing any code that uses SDK APIs, always read the actual signatures from the installed packages** — see "Finding detailed API documentation" below. Never guess prop names, hook parameters, or method names.

**Use only the officially public packages.** The public Compose SDK packages are `@sisense/sdk-ui`, `@sisense/sdk-ui-angular`, `@sisense/sdk-ui-vue`, `@sisense/sdk-data`, and `@sisense/sdk-cli`. Never import from any other `@sisense/*` package, and never use exports tagged `@internal` or `@alpha` — they are unstable and unsupported for customer use.

---

## Before writing implementation code: confirm context

Before generating implementation code (not for conceptual explanations), confirm:

1. **Framework** — React, Angular, or Vue? (Default to React if already indicated.)
2. **Data model** — data source name and relevant fields/measures, or ask them to share the generated data model types.
3. **SDK version** — only if the question is version-sensitive.
4. **Credentials** — only when writing setup or provider code: where should the Sisense URL and token come from? (env vars, a config file, passed as props, etc.)

Ask all questions in a single message. Skip for general or conceptual questions.

For Angular or Vue, read the installed package types before generating any setup or component code — see "Finding detailed API documentation" below.

---

## SDK packages

| Package | Purpose | Scope |
|---|---|---|
| `@sisense/sdk-ui` | React components — `Chart`, `PivotTable`, `DashboardById`, `WidgetById`, `Widget`, `DrilldownWidget`, filter tiles, hooks | `dependencies` |
| `@sisense/sdk-data` | Query utilities — `measureFactory`, `filterFactory`, data model types | `dependencies` |
| `@sisense/sdk-cli` | Dev CLI — generates TypeScript data model from a live Sisense instance; scaffolds widget plugins | `devDependencies` or `npx` |
| `@sisense/sdk-ui-angular` | Angular components (`SdkUiModule`, `ChartComponent`, etc.) | `dependencies` |
| `@sisense/sdk-ui-vue` | Vue components and composables | `dependencies` |

---

## Gotchas

- **Prefer a `DataSource` object over a bare string for `dataSet`.** `dataSet` accepts either a data source name string (e.g. `"Sample ECommerce"`) or a `DataSource` object — both work. Prefer the generated `DM.DataSource` when it is available: it carries the correct data source type and location, avoiding ambiguity when a name alone is not enough.
- **Never guess `measureFactory` or `filterFactory` method names.** They vary by SDK version. Always read the exported types from `@sisense/sdk-data` before writing any factory call — see "Finding detailed API documentation" below.
- **`filters` vs `highlights`.** `filters` removes non-matching rows entirely. `highlights` keeps all data but visually dims non-matching values — use it when the chart shape should stay intact while emphasizing a selection.
- **Next.js / SSR.** CSDK is client-side only. Every file importing from `@sisense/sdk-ui` or `@sisense/sdk-data` needs `'use client'` at the top. **Never suggest `next/dynamic` with `ssr: false`** in any form. When listing packages that require `'use client'`, always name `@sisense/sdk-ui` and `@sisense/sdk-data` explicitly — do not use the `@sisense/*` glob.
- **Angular setup is module/provider-based, not JSX.** There is no context-provider component in templates. Add `SdkUiModule` (from `@sisense/sdk-ui-angular`) to the app's NgModule `imports[]` (or a standalone component's `imports[]`), and supply the connection by providing `SISENSE_CONTEXT_CONFIG_TOKEN` with a `SisenseContextConfig` (`{ url, token, ... }`); alternatively configure it at runtime via `SisenseContextService.setConfig()`. CSDK components go in `imports[]`, not `declarations[]`, and all selectors use the `csdk-` prefix. Read the actual exports from `@sisense/sdk-ui-angular` before writing setup code.
- **Vue uses the `SisenseContextProvider` component, not a plugin.** There is no `app.use(...)` registration. Wrap the app with the `<SisenseContextProvider>` component (from `@sisense/sdk-ui-vue`), binding `:url`, `:token`, etc. Props holding objects or arrays require the `:prop` v-bind syntax. Read the setup API from `@sisense/sdk-ui-vue`.
- **`PivotTable` is a public component in `@sisense/sdk-ui`.** Import it from `@sisense/sdk-ui` like any other component — do not look for it in other packages.
- **Stay within the public packages.** Every public symbol lives in `@sisense/sdk-ui`, `@sisense/sdk-ui-angular`, `@sisense/sdk-ui-vue`, `@sisense/sdk-data`, or `@sisense/sdk-cli`. If you can't find a symbol there, it is not part of the public API — do not reach into other `@sisense/*` packages.

---

## Setup

### Credentials — use env vars, never hardcode

Never hardcode the Sisense URL or token. Ask the user where credentials should come from before writing any setup code — see "Before writing implementation code: confirm context" above.

> The setup below is written for **React**. Angular and Vue initialize the Sisense connection differently — see the Angular and Vue gotchas above (Angular: `SdkUiModule` + `SISENSE_CONTEXT_CONFIG_TOKEN` / `SisenseContextService.setConfig()`; Vue: the `<SisenseContextProvider>` component). The components (`DashboardById`, `WidgetById`, `Chart`, …) are the same across frameworks; only context setup differs.

### `SisenseContextProvider` (React)

Wrap the app root with `SisenseContextProvider` (from `@sisense/sdk-ui`). Every CSDK component must be a descendant.

### Smoke test — `DashboardById`

Before touching the data model, render an existing dashboard with `DashboardById` (from `@sisense/sdk-ui`) to confirm the URL and token work. Pass the dashboard OID from the Sisense dashboard URL.

### Single widget — `WidgetById`

`WidgetById` (from `@sisense/sdk-ui`) embeds one widget from an existing dashboard. Requires both dashboard OID and widget OID — get the widget OID from the Sisense URL when the widget is selected.

---

## Widget plugin

Compose SDK supports **custom widget plugins**: you register a plugin on the Sisense context (in React, via the `plugins` prop on `SisenseContextProvider`) and then render it like a built-in widget. For anything beyond a trivial plugin, Sisense recommends developing it in a **dedicated plugin repository** scaffolded by the CLI, rather than inline in the host app.

```bash
npx @sisense/sdk-cli@latest create-plugin --name <name> --template <template> --path <abs-path> --install npm
```

Templates: `empty`, `line-chart`, `simple-table`. Plugin name: `[a-zA-Z0-9_-]` only.

`--install` accepts `npm`, `yarn`, `pnpm`, or `none` (skip). If omitted, the CLI prompts interactively. When a package manager is given, the CLI installs dependencies and copies `.env.local.example` → `.env.local` automatically.

Set `VITE_APP_SISENSE_URL` and `VITE_APP_SISENSE_TOKEN` in `.env.local` — do not commit.

Then read and follow the plugin's built-in implementation skill at:

```text
<absolute-plugin-path>/.claude/skills/design-custom-widget/SKILL.md
```

If not found, stop — do not fall back to your own implementation.

Build verification:

```bash
npm run build    # produces dist/react + dist/cross-framework
npm test
```

Register in the host app by passing the plugin to the `plugins` prop on `SisenseContextProvider`.

---

## Data model generation

```bash
npx @sisense/sdk-cli@latest get-data-model \
  --url https://your-instance.sisense.com \
  --token <token> \
  --dataSource "Sample ECommerce" \
  --output src/models/sample-ecommerce.ts
```

- Use `--token`, not `--username`/`--password` — most instances are SSO-only.
- `--dataSource` must match the model name **exactly** as shown in Sisense Admin, including case and spaces.
- Regenerate only when the schema changes. Data refreshes don't require it.
- The generated file exports a typed `DM` object — typos in field names become compile errors.

---

## Chart

`Chart` (from `@sisense/sdk-ui`) renders many chart types, and its `dataOptions` is a union whose shape depends on the chart type. The `category` / `value` / `breakBy` fields below apply to **cartesian charts** (line, bar, column, area). Other families — categorical (pie/funnel), scatter, indicator, boxplot, areamap/scattermap, and others — use different `dataOptions` shapes. Read the `dataOptions` type for the specific chart type before writing.

Cartesian `dataOptions`:

- `category` — dimension attributes (X-axis / grouping)
- `value` — measures from `measureFactory`
- `breakBy` — optional dimension attributes for series splitting

`category`/`breakBy` take attributes; `value` takes measures. Mixing them is the most common type error.

`filters` removes non-matching rows; `highlights` keeps all data and dims non-matching values.

`useExecuteQuery` accepts an `enabled: boolean` param — set to `false` to skip fetching until a condition is met.

---

## Headless queries — `useExecuteQuery`

`useExecuteQuery` (from `@sisense/sdk-ui`) returns `{ data: { rows, columns }, isLoading, isError }`. Use for custom tables, maps, or third-party visualizations instead of `Chart`.

Read its parameter and return types from `@sisense/sdk-ui` — see "Finding detailed API documentation" below.

---

## Highcharts access — `onBeforeRender`

`Chart` exposes an `onBeforeRender` callback that receives the Highcharts options object before rendering. Modify and return it for customizations beyond what SDK props support.

---

## Theming

`ThemeProvider` (from `@sisense/sdk-ui`) controls chart colors, fonts, and backgrounds — **separate from page CSS**. "Dark chart background" and "dark page background" touch different code — clarify which before writing. Read `ThemeSettings` from the installed package.

---

## Filter components

From `@sisense/sdk-ui` — all controlled, wire to a `filters` state array:

| Component | Use |
|---|---|
| `MemberFilterTile` | Pick list of dimension members |
| `DateRangeFilterTile` | Date range picker |
| `CriteriaFilterTile` | Numeric/string conditions |

All are controlled — wire them to a `filters` state array and pass it to `Chart` (or to a query via `useExecuteQuery`). Read each component's current props from the installed package before writing. (Note: `DashboardById` has no `filters` prop — its filters come from the dashboard definition in the Sisense instance.)

---

## Authentication

| Method | When to use |
|---|---|
| Bearer token | Development and simple deployments |
| WAT (Web Access Token) | Server-side token generation for per-user auth |
| SSO | Enterprise SSO flows |

A viewer-role token is sufficient when the user has access to every queried data source. See `developer.sisense.com/guides/sdk/` for WAT and SSO setup.

---

## Finding detailed API documentation

The installed packages ship TypeScript declarations with full JSDoc and `@example` blocks. Read types from the package **by name** — don't hardcode deep internal file paths, which change between versions. The package entry points re-export everything public, so start from the package's declarations and follow the exports.

Locate any public symbol and read its declaration:

```bash
# React
grep -rl "SymbolName" node_modules/@sisense/sdk-ui/dist --include="*.d.ts"
grep -rl "SymbolName" node_modules/@sisense/sdk-data/dist --include="*.d.ts"
# Angular / Vue
grep -rl "SymbolName" node_modules/@sisense/sdk-ui-angular/dist --include="*.d.ts"
grep -rl "SymbolName" node_modules/@sisense/sdk-ui-vue/dist --include="*.d.ts"
```

Common lookups: `Chart` and chart types, filter tiles, `useExecuteQuery`, `DashboardById`, and `ThemeProvider`/`ThemeSettings` in `@sisense/sdk-ui`; `measureFactory` and `filterFactory` in `@sisense/sdk-data`. If a symbol isn't found in one of the five public packages, it isn't public — don't use it.

---

## Common errors

| Error | Likely Cause | Fix |
|---|---|---|
| `SisenseContextProvider not found` | Component outside the provider | Wrap app root with `SisenseContextProvider` |
| `401 Unauthorized` | Invalid or expired token | Regenerate in Sisense user profile → API Token |
| CORS error on Sisense URL | App origin not in allowlist | Add `http://localhost:5173` to Sisense Admin → Security Settings |
| `Cannot find module '@sisense/sdk-data'` | Package not installed | `npm install @sisense/sdk-data` |
| `Type error on dataOptions` | Attribute where measure expected (or vice versa) | Use `measureFactory` for `value`; raw dimension for `category` |
| Jest/Vitest transform errors | ESM/CJS mismatch | Add `transformIgnorePatterns: ['/node_modules/(?!(@sisense)/)']` to `jest.config.js` |
| `sdk-cli` auth error | `--username`/`--password` rejected by SSO | Use `--token` flag instead |
| Chart renders but no data | Data source name doesn't match, or filters exclude all rows | Verify the `dataSet` name matches Sisense exactly (prefer `DM.DataSource`); check filters |
| Next.js crash on import | CSDK in a server component | Add `'use client'` to every file importing from `@sisense/sdk-ui` or `@sisense/sdk-data` |

---

## Pivot tables

`PivotTable` is a public component in `@sisense/sdk-ui` — import it from there. `SisenseContextProvider` must already be in the component tree. Read `PivotTableProps` from `@sisense/sdk-ui` before writing.

`PivotTable` `dataOptions`:
- `rows` — dimension attributes for row headers
- `columns` — dimension attributes for column headers
- `values` — measures via `measureFactory`
- `grandTotals` — grand total visibility and label

Stack multiple attributes in `rows` for hierarchical groupings with automatic subtotals. Accepts `filters` and `styleOptions.rowsPerPage` for built-in pagination.

Gotchas: `values` requires measures (raw attributes cause type errors); large row/column combinations time out — scope with `filters`; no custom cell renderers — use `useExecuteQuery` for fully custom table UIs.

---

## Out of scope

- Embed SDK (iframe embedding) — separate product, see `developer.sisense.com/guides/embeddingDashboards`
- Sisense REST API (unless directly related to CSDK auth)
- Sisense data modeling and ElastiCube configuration
- General React/Angular/Vue questions unrelated to SDK usage
