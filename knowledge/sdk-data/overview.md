---
type: Package
title: sdk-data overview
description: Map of @sisense/sdk-data — the pure-data dimensional modeling layer (attributes, measures, filters, JAQL) that every other SDK package consumes.
resource: packages/sdk-data
tags: [sdk-data, overview, dimensional-model]
---

# Purpose

`@sisense/sdk-data` implements dimensional modeling as pure data: attributes, dimensions,
measures, and filters that serialize to JAQL query metadata. It sits just above the base of
the layer model — no UI, no HTTP; its only workspace dependency is `@sisense/sdk-common`.

# Entry point

| What        | Where                                                                                                       |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| Barrel      | `packages/sdk-data/src/index.ts` — re-exports everything below                                              |
| Factories   | `filterFactory`, `measureFactory`, `attributeFactory`, `analyticsFactory` — namespace exports in the barrel |
| Side effect | `import './translation/initialize-i18n.js'` — `packages/sdk-data/src/index.ts:1`, must stay first           |
| Build       | `tsc --build tsconfig.build.json` (not Vite) — `packages/sdk-data/package.json`                             |

# Module map

| Concept doc                                               | Source                                                             | What it covers                                                        |
| --------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| [Element model & JAQL serialization](./core-elements.md)  | `src/dimensional-model/{base,interfaces,types,jaql-element}.ts`    | `Element` hierarchy, `jaql(nested?)` contract, `MetadataTypes` guards |
| [Attributes & dimensions](./attributes-and-dimensions.md) | `src/dimensional-model/{attributes,dimensions}`                    | Column attributes, date levels, dimension containers                  |
| [Measures & measureFactory](./measures.md)                | `src/dimensional-model/{measures,analytics}`                       | Aggregations, calculated and time-based measures, boxplot helpers     |
| [Filters & filterFactory](./filters.md)                   | `src/dimensional-model/filters`                                    | Filter class hierarchy, factory categories, matching utils            |
| [Filter relations](./filter-relations.md)                 | `src/dimensional-model/filters/filter-relations.ts`                | AND/OR logic trees, guid-based leaf references                        |
| [Compose code round-trip](./compose-code.md)              | `src/dimensional-model/{parse-compose-code,compose-code-utils}.ts` | Executable factory-call strings on every element                      |
| [Data model & factory](./data-model-generation.md)        | `src/dimensional-model/{data-model,factory}.ts`                    | The contract CLI-generated `DM` model files build on                  |
| [i18n & translatable errors](./translation.md)            | `src/translation`                                                  | `'sdkData'` namespace, dictionaries, `TranslatableError`              |

# Cross-cutting invariants

1. **Duck-typed identity, never `instanceof`** — every element class carries a
   `__serializable` string discriminator, and type checks go through `MetadataTypes` /
   `is*Filter` guards, because instances may cross duplicate bundle copies of sdk-data.
   Details in [core-elements](./core-elements.md) and [filters](./filters.md).
2. **`jaql(nested?)` is the universal serialization contract** — and measures deliberately
   emit `title: this.name` (identity, not display) so sdk-ui aliasing round-trips; do not
   "fix" it. See [core-elements](./core-elements.md).
3. **Elements are immutable** — `sort()`, `format()`, `setGranularity()` return new
   instances; transformations must not mutate.
4. **Public factory function names are persisted API** — every factory stamps an executable
   `composeCode` string; renaming a factory function breaks parsing of previously persisted
   code. See [compose-code](./compose-code.md).
5. **Filter identity is `config.guid`** — filter-relations leaves reference filters by guid;
   rebuilding a filter without the relation-aware helpers orphans tree nodes. See
   [filter-relations](./filter-relations.md).
6. **Generated-model contract is frozen** — CLI-generated files import exactly
   `createAttribute` / `createDimension` / `createDateDimension` under the alias `DM`. See
   [data-model-generation](./data-model-generation.md).
7. **i18n namespace `'sdkData'` and its keys are public API in effect** — consumers ship
   `Partial<TranslationDictionary>` overrides keyed on them. See
   [translation](./translation.md).

# Related

- [Monorepo architecture invariants](../architecture/overview.md) - the layer model this package sits in.
