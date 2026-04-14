# sdk-ui

React component library for Sisense analytics. The main consumer-facing package with
Highcharts-based charting and a rich set of filter, widget, and AI components.

## Architecture

- Domain-driven: `src/domains/` contains `dashboarding`, `data-browser`, `drilldown`,
  `filters`, `formulas`, `query-execution`, `visualizations`, `widgets`
- Restructured charts pattern: `ChartBuilder<CT>` interface for each chart type;
  see `src/domains/visualizations/components/chart/restructured-charts/how-it-works.md`
- Highcharts-based charts composed via `flow()` pipelines of orthogonal transformers
- Shared infra in `src/infra/`, cross-cutting modules in `src/modules/`

## Transformer Pattern

- Definition: `(input: Readonly<T>) => T`
- Contextful: `(ctx: C) => (input: Readonly<T>) => T`
- Naming: `with*`, `without*`, `as*` (e.g., `withStacking`, `withoutLabelsRotation`)
- Compose with `flow` from `lodash-es/flow` — never `fp-ts` or a local reimplementation
- Pure and non-mutating; each transformer is independently unit-testable
- See `.cursor/rules/transformer-pattern.mdc` for full reference with examples

## React Patterns

- Hooks: compose small focused hooks; never grow one monolithic hook
- Return named objects `{ value, isLoading, error }`, not positional tuples
- Every `useEffect`/`useMemo`/`useCallback` must have an explicit dependency array
- `useMemo` for derived values; `useCallback` for stable references passed as props
- `useEffect` for external system synchronization only — not for deriving state
- Wrap top-level component trees with `ErrorBoundary` from `sdk-shared-ui`
- Props: flat and explicit; use discriminated unions for mutually exclusive combinations
- Always sanitize user HTML with `DOMPurify` before `dangerouslySetInnerHTML`
- Context: one dedicated file per domain; typed `use*Context` hooks that throw outside provider
- See `.cursor/rules/react-patterns.mdc` for full reference

## Public API Levels

Managed via `src/public-api/` with tag-scoped entry files:

- **public** (default, no tag): visible in docs, no breaking changes allowed
- **@beta**: visible in docs, breaking changes allowed
- **@alpha**: stripped from docs, early-stage experimental
- **@sisenseInternal**: stripped from docs, in-company features only
- **@internal**: stripped from docs, cross-package sharing within CSDK

Verify with: `yarn public-api-check`

## Entry Points

- `.` (main): all public components and hooks
- `./ai`: AI-related components (chatbot, query suggestions)
- `./analytics-composer`: Analytics composer component
- `./sisense-internal`: Internal Sisense-only features

## Commands

```bash
yarn dev              # Vite dev server
yarn build            # Development build (Vite)
yarn build:prod       # Production build
yarn test             # Vitest unit tests
yarn test:coverage    # With coverage
yarn storybook        # Launch Storybook
yarn type-check       # TypeScript check (faster than build)
yarn public-api-check # Validate public API entry files
```
