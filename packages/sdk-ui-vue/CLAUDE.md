# sdk-ui-vue

Vue 3 wrapper components for Sisense analytics.

## Critical: Architecture

- Wraps **sdk-ui-preact** (NOT sdk-ui directly)
- `sdk-ui-preact` is the shared implementation layer for all non-React frameworks
- Direct dependencies: `sdk-data`, `sdk-tracking`, `sdk-ui-preact`
- Built with **Vite**

## Framework Support

- Vue 3.3+ with Composition API

## Source Structure

- `src/components/`: Vue component wrappers
- `src/composables/`: Vue composable hooks (`useExecuteQuery`, etc.)
- `src/providers/`: Context providers (`SisenseContextProvider`)
- `src/types/`: TypeScript type definitions
- `src/sdk-ui-core-exports.ts`: Re-exports from `sdk-ui-preact`

## Entry Points

- `.` (main): Vue components and composables
- `./ai`: AI-related Vue components
- `./translations/*`: Locale bundles

## Commands

```bash
yarn dev              # Vite dev server
yarn build            # Vite build (development)
yarn build:prod       # Vite build (production)
yarn test             # Vitest unit tests (TZ=utc)
yarn test:coverage    # With coverage
yarn type-check       # vue-tsc --noEmit
```
