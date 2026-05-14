# Compose SDK Monorepo

## Identity

Multi-framework analytics SDK for Sisense (React, Angular, Vue). 16 packages in a Yarn 3
workspace monorepo. NX 20 for build orchestration, Vite 5 for bundling, Node 18.16.0 (Volta),
Yarn 3.2.3.

## Critical Rules

- ALWAYS use `yarn`, NEVER `npm`
- No `any` types without an inline comment explaining why (a single-line rationale at the usage site)
- Direct imports only — `lodash-es/debounce` not `{ debounce } from 'lodash-es'`; `@mui/material/Button` not `{ Button } from '@mui/material'`
- Do NOT reference Sisense internals in source code (repo is mirrored to public GitHub); Jira tickets are OK in commit messages only
- Functional programming preferred: purity, immutability, composition over inheritance

## Where to Look First

Before starting a task, skim the most specific doc available — don't re-derive rules that are already written down.

- [CONTRIBUTING.md](CONTRIBUTING.md) — full MR/PR workflow, commit/branch rules, coverage expectations
- [packages/sdk-ui/CLAUDE.md](packages/sdk-ui/CLAUDE.md) — sdk-ui-specific guidance (read when touching sdk-ui)
- [.cursor/rules/functional-programming.mdc](.cursor/rules/functional-programming.mdc), [transformer-pattern.mdc](.cursor/rules/transformer-pattern.mdc), [react-patterns.mdc](.cursor/rules/react-patterns.mdc), [monorepo-guidelines.mdc](.cursor/rules/monorepo-guidelines.mdc), [software-engineer.mdc](.cursor/rules/software-engineer.mdc) — deep rules; this file only summarizes
- [packages/sdk-ui/src/domains/visualizations/components/chart/restructured-charts/how-it-works.md](packages/sdk-ui/src/domains/visualizations/components/chart/restructured-charts/how-it-works.md) — chart architecture; use the `add-highcharts-based-chart` skill when adding a chart type

## Agent Workflow

- Verify types fast: `cd packages/<pkg> && yarn type-check` — far faster than a full build
- Run only affected tests while iterating: `yarn nx affected -t test` (or `yarn test:watch` inside a package)
- Before claiming done: `yarn lint` on the touched package(s) and `yarn public-api-check` if sdk-ui exports changed
- Use skills when they match: `add-highcharts-based-chart`, `build-package`, `lint-fix`, `check-public-api`, `test-affected`, `review-mr`
- Package-layer direction: `sdk-data` → `sdk-common` → `sdk-rest-client` → `sdk-query-client` → UI packages. Never import "upward."

## Package Structure

```text
packages/
  sdk-data            # Dimensional modeling, filters, measures (pure data, no UI; tsc build)
  sdk-common          # Shared utilities
  sdk-rest-client     # REST API client + auth
  sdk-query-client    # Query execution client
  sdk-ui              # React components and hooks (Highcharts-based charts); chart code lives under src/domains/visualizations/components/chart/restructured-charts
  sdk-ui-preact       # Preact adapter glue (component-adapter, preact-compat) that Angular/Vue wrappers consume; NOT a duplicated UI layer
  sdk-ui-angular      # Angular wrapper (depends on sdk-ui-preact, NOT sdk-ui)
  sdk-ui-vue          # Vue wrapper (depends on sdk-ui-preact, NOT sdk-ui)
  sdk-shared-ui       # Shared UI utilities (ErrorBoundary, etc.)
  sdk-modeling        # Data model code generation helpers
  sdk-tracking        # Usage analytics
  sdk-cli             # CLI tooling
  sdk-pivot-client    # Pivot client
  sdk-pivot-query-client
  sdk-pivot-ui        # Pivot table UI components
  sdk-plugins         # Plugin system
e2e/                  # Playwright component and visual regression tests
examples/             # Demo apps (React, Angular, Vue)
```

## Common Commands

```bash
yarn dev              # Start sdk-ui dev server
yarn build            # Build all packages (NX)
yarn build:prod       # Production build
yarn test             # Run all unit tests (Vitest)
yarn test:coverage    # With coverage
yarn lint             # ESLint all packages
yarn format           # Prettier all packages
yarn storybook        # sdk-ui Storybook
yarn demo             # React demo app
yarn demo:vue         # Vue demo app
yarn demo:angular     # Angular demo app
yarn docs:gen:md      # Generate TSDoc markdown
yarn public-api-check # Verify sdk-ui public API exports
yarn type-check       # TypeScript check (faster than build, run in a package folder)
yarn test:ct          # Playwright component tests (e2e/)
yarn test:visual      # Playwright visual regression tests (e2e/)
```

## Code Style

- Files: kebab-case (`treemap-chart.tsx`, `use-execute-query.ts`)
- React components: PascalCase (`TreemapChart`)
- Functions/hooks: camelCase (`useExecuteQuery`)
- Angular: `.component.ts` suffix (PascalCase class), `.service.ts` suffix
- Follow Google TypeScript Style Guide

## TypeScript Standards

- Strict mode, ES6 target, NodeNext modules
- Prefer type guards, generics, and discriminated unions over `as` casts
- No unsafe type assertions without documented reason
- Use `readonly` arrays/tuples and `as const` for literals; avoid mutation methods

## Functional Programming (summary)

Full rules live in [.cursor/rules/functional-programming.mdc](.cursor/rules/functional-programming.mdc) and [.cursor/rules/transformer-pattern.mdc](.cursor/rules/transformer-pattern.mdc). In short: pure functions, immutable data, compose with `flow` from `lodash-es/flow` (never `fp-ts` or custom), transformer naming `with*` / `without*` / `as*`, side effects at the edges.

## Git Conventions

- Branch: `name/SNS-XXXXX-brief-description`
- Commits follow Conventional Commits with a required Jira ticket:
  `<type>(scope): <description> (SNS-XXXXX)`
- Valid types: `feat`, `fix`, `refactor`, `style`, `docs`, `build`, `ci`, `perf`, `test`, `chore`, `revert`
- Present tense imperative verbs (`implement`, not `implemented`)
- Header max 100 chars; commitlint is enforced via husky pre-commit hook
- MR title/body mirror the commit format; full MR workflow in [CONTRIBUTING.md](CONTRIBUTING.md) — use the `review-mr` skill before submitting

## Testing

- Vitest for unit tests (`*.test.ts` / `*.test.tsx` colocated with source)
- Test helpers in `__test-helpers__/`, mocks in `__mocks__/`
- Playwright for component tests and visual regression (in `e2e/`); update visual snapshots only when the visual change is intentional
- Storybook stories required for new/changed UI components (`*.stories.tsx`)
- Coverage: repo targets 80% branch coverage (currently ~71%); CI reports it, so don't introduce regressions

## Documentation & Public API

- TSDoc required for all public and internal APIs
- Tags: `@param`, `@returns`, `@example`, `@internal`, `@alpha`, `@beta`, `@sisenseInternal`
- Start descriptions with third-person singular verb; capitalize; end with period
- sdk-ui public API levels, defined under [packages/sdk-ui/src/public-api/](packages/sdk-ui/src/public-api):
  - **public** (untagged): stable, in docs, no breaking changes
  - **@beta**: in docs, breaking changes allowed
  - **@alpha**: early-stage, not in public docs
  - **@sisenseInternal**: in-company only, stripped from public docs
  - **@internal**: cross-package internal use, stripped from docs
- Generate: `yarn docs:gen:md` — Verify: `yarn public-api-check`

## Build System

- NX 20 with dependency graph and caching (`nx affected` for CI)
- Internal dependencies use `workspace:*` protocol
- Outputs: ESM (`dist/index.js`), CJS (`dist/cjs/index.js`), types (`dist/types/`)
- `sdk-data` uses TypeScript compiler (`tsc`) directly, not Vite

## Debugging

- Build failures: `yarn clean && yarn install && yarn build`
- Type errors: run `yarn type-check` inside the specific package folder (faster than full build)
- Iterative testing: `yarn test:watch`
