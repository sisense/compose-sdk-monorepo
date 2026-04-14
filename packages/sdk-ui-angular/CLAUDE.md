# sdk-ui-angular

Angular wrapper components for Sisense analytics.

## Critical: Architecture

- Wraps **sdk-ui-preact** (NOT sdk-ui directly)
- `sdk-ui-preact` is the shared implementation layer for all non-React frameworks
- Direct dependencies: `sdk-data`, `sdk-tracking`, `sdk-ui-preact`
- Built with **ng-packagr** (`ng build`)

## Framework Support

- Angular 17–21 (peer dependency: `@angular/core ^17 || ^18 || ^19 || ^20 || ^21`)

## File Conventions

- Components: `*.component.ts` with PascalCase class name (`TreemapChartComponent`)
- Services: `*.service.ts` with PascalCase class name (`QueryService`)
- Source lives in `src/lib/` with Angular modules, components, decorators, services, and helpers
- `src/lib/sdk-ui.module.ts`: root Angular module

## Entry Points

- `.` (main): Angular components and services
- `./ai`: AI-related Angular components
- `./translations/*`: Locale bundles

## Commands

```bash
yarn build            # ng build (Angular library)
yarn build:prod       # Production ng build
yarn test             # Vitest unit tests (TZ=utc)
yarn test:coverage    # With coverage
yarn lint             # ESLint
```
