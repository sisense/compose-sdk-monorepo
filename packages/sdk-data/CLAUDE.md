# sdk-data

Pure data modeling package for dimensional modeling, filters, and measures. No UI or DOM
dependencies — pure TypeScript logic only.

## Architecture

- `src/dimensional-model/`: dimensions, attributes, hierarchies, measures, filters
- `src/interfaces.ts`: core type definitions consumed by other packages
- `src/translation/`: data translation and serialization utilities
- `src/utils.ts`: shared pure utility functions

## Key Characteristics

- Built with TypeScript compiler (`tsc`) directly — NOT Vite
- Minimal dependencies: `sdk-common`, `hash-it`, `lodash-es`, `numeral`
- Dual output: ESM (`dist/index.js`) and CJS (`dist/cjs/index.js`)
- Uses `workspace:*` for the `sdk-common` dependency

## Commands

```bash
yarn build            # tsc --build
yarn build:prod       # Production tsc build
yarn test             # Vitest unit tests
yarn test:coverage    # With coverage
yarn type-check       # TypeScript check (faster than build)
```
