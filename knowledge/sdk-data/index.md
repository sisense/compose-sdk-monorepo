# sdk-data

Descriptive map of `packages/sdk-data` — the pure-data dimensional modeling layer every other
SDK package consumes. One concept doc per subsystem; start with the overview.

## Orientation

- [sdk-data overview](overview.md) - Package purpose, module map, export surface, build specifics.

## Element model

- [Element model & JAQL serialization](core-elements.md) - The `Element`/`Attribute`/`Measure` hierarchy and how elements serialize to JAQL.
- [Attributes & dimensions](attributes-and-dimensions.md) - Column attributes, date levels, `attributeFactory`, dimension containers.
- [Measures & measureFactory](measures.md) - Aggregation, calculated, and time-based measures; boxplot helpers in `analyticsFactory`.

## Filters

- [Filters & filterFactory](filters.md) - Filter class hierarchy, factory categories, config utils, filter matching.
- [Filter relations](filter-relations.md) - AND/OR filter logic trees and their traversal utilities.

## Serialization & tooling contracts

- [Compose code round-trip](compose-code.md) - Generating and parsing executable factory-call code strings.
- [Data model & factory](data-model-generation.md) - `createDimension` and friends — the contract CLI-generated data models build on.

## Infrastructure

- [i18n & translatable errors](translation.md) - Translation namespace, dictionaries, `TranslatableError` pattern.
