---
type: Module
title: Attributes & dimensions
description: Concrete attribute classes (plain, date-level, calculated) and the Dimension/DateDimension containers that generated data models expose.
resource: packages/sdk-data/src/dimensional-model
tags: [sdk-data, module, attributes]
---

# Purpose

Implements the attribute side of the dimensional model: columns (`DimensionalAttribute`), date columns at a granularity (`DimensionalLevelAttribute`), formula-based grouping attributes (`DimensionalCalculatedAttribute`), and the `Dimension`/`DateDimension` containers that group them in generated data-model code. Reach for it when working with `DM.Table.Column` objects, date granularities, or `attributeFactory.customFormula`.

# Entry point

| What             | Where                                                                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Class            | `DimensionalAttribute` — packages/sdk-data/src/dimensional-model/attributes/attributes.ts:43                                                                               |
| Class            | `DimensionalLevelAttribute` — packages/sdk-data/src/dimensional-model/attributes/attributes.ts:187                                                                         |
| Class            | `DimensionalCalculatedAttribute` — packages/sdk-data/src/dimensional-model/attributes/attributes.ts:594                                                                    |
| Factory (public) | `createAttribute` — attributes/attributes.ts:835; `createLevel` — attributes.ts:866; `createCalculatedAttribute` — attributes.ts:896                                       |
| Factory (public) | `attributeFactory.customFormula` — packages/sdk-data/src/dimensional-model/attributes/factory.ts:50 (exported as `attributeFactory` in packages/sdk-data/src/index.ts:110) |
| Class            | `DimensionalDimension` — packages/sdk-data/src/dimensional-model/dimensions/dimensions.ts:52                                                                               |
| Class            | `DimensionalDateDimension` — dimensions/dimensions.ts:294                                                                                                                  |
| Factory (public) | `createDimension` — dimensions/dimensions.ts:605; `createDateDimension` — dimensions/dimensions.ts:720                                                                     |
| Util             | `getDimensionsFromDataSourceFields` — packages/sdk-data/src/dimensional-model/dimensions/utils.ts:17                                                                       |
| Util             | `simpleColumnType` — packages/sdk-data/src/dimensional-model/simple-column-types.ts:136; `jaqlSimpleColumnType` — attributes/attributes.ts:37                              |
| Constants        | `DateLevels` — packages/sdk-data/src/dimensional-model/types.ts:390                                                                                                        |

# Contract

`DimensionalAttribute.jaql(nested)` emits (attributes.ts:142):

```ts
{ jaql: { title: this.title, dim: this.expression, datatype: jaqlSimpleColumnType(this.type),
          sort?: 'asc' | 'desc' }, panel?: 'columns' }
```

`simpleColumnType` maps raw DB column types to `'number' | 'text' | 'datetime' | 'boolean'` (default `'text'`); `jaqlSimpleColumnType` renames `number` → `numeric` for JAQL.

Date granularities (`DateLevels`, types.ts:390) verbatim: `Years, Quarters, Months, Weeks, Days, Hours, MinutesRoundTo30, MinutesRoundTo15, Minutes, Seconds, AggHours, AggMinutesRoundTo30, AggMinutesRoundTo15, AggMinutesRoundTo1, WeekOfYear`. `DimensionalLevelAttribute.translateGranularityToJaql()` (attributes.ts:403) maps them to three distinct JAQL encodings:

| Granularity                             | JAQL fields                                                                               |
| --------------------------------------- | ----------------------------------------------------------------------------------------- |
| Years/Quarters/Months/Weeks/Days        | `{ level: '<lowercased>' }`                                                               |
| Hours / MinutesRoundTo30 / 15 / Minutes | `{ dateTimeLevel: 'minutes', bucket: '60' \| '30' \| '15' \| '1' }`                       |
| Seconds                                 | `{ dateTimeLevel: 'seconds', bucket: '0' }`                                               |
| AggHours / AggMinutesRoundTo30 / 15 / 1 | `{ level: 'minutes', bucket: '60' \| '30' \| '15' \| '1' }`                               |
| WeekOfYear (@beta)                      | `{ dateTimePart: 'weeks' }` — date-_part_ extraction, needs engine `dateTimePart` support |

Reverse mapping: `DimensionalLevelAttribute.translateJaqlToGranularity` (attributes.ts:469); default display formats per granularity: `getDefaultFormatForGranularity` (attributes.ts:531). A level's `format` is emitted as `format.mask[<levelName>]` (attributes.ts:387).

`attributeFactory.customFormula(title, formula, context)` builds a `DimensionalCalculatedAttribute`; context keys are auto-wrapped in `[...]` (factory.ts:56). Its JAQL carries `type: 'calculated_dimension'` with `formula` + `context` (attributes.ts:787). Only `text` data type is supported.

# How it connects

- All classes extend `DimensionalElement` and implement `Attribute`/`LevelAttribute` from [core-elements](./core-elements.md).
- `DimensionalDateDimension` constructs one `DimensionalLevelAttribute` per `DateLevels` entry as instance properties (`.Years`, `.Months`, …) and delegates `jaql()` to `defaultLevel` (`Years`) — dimensions.ts:580.
- `DimensionalDimension` attaches child attributes/dimensions as dynamic instance properties via `normalizeName` (dimensions.ts:157); its `jaql()` delegates to `defaultAttribute`, first nested dimension, or itself (dimensions.ts:257).
- `createAttribute`/`createDimension`/`createDateDimension` are what CLI-generated data-model files call — see [data-model-generation](./data-model-generation.md).
- `getDimensionsFromDataSourceFields` (utils.ts:17) turns Fusion `DataSourceField[]` responses into `Dimension[]` at runtime (used by sdk-ui filter/model hooks).
- Calculated attributes are the attribute counterpart of `measureFactory.customFormula` — see [measures](./measures.md).

# Invariants and traps

1. `sort()`, `format()`, `setGranularity()` must return new instances; constructor parameter order is long and positional — keep `title` last, matching the existing classes.
2. An attribute's `id` is its `expression`; a level attribute's `id` appends the lowercased level/bucket (attributes.ts:249) — two levels of the same column differ only by that suffix.
3. `composeCode` is derived from `expression` when not supplied, wrapping names needing normalization in `[[...]]` (attributes.ts:83) — do not bypass this when adding constructors.
4. `DimensionalCalculatedAttribute.jaql()` strips date granularity (`level`/`dateTimeLevel`/`bucket`) from context entries and adds raw `table`/`column` for calendar dims (attributes.ts:739-785) — a date in a calculated-dimension formula must operate on the raw column value, matching the Fusion UI. Preserve `datatype` on the JAQL when present (attributes.ts:798).
5. Dimension child names that collide with reserved members (`id`, `name`, prototype getters) fall back to the attribute's expression as property name (dimensions.ts:121, utils.ts:100 `RESERVED_DIMENSION_CONFIG_KEYS`) — never assume `dim[columnName]` exists for every column.
6. `WeekOfYear` groups by week ordinal 1–53 across years and is rejected by engines without date-part support; it is not interchangeable with `Weeks` (types.ts:407-422).

# Related

- [Element model & JAQL serialization](./core-elements.md) - base class, MetadataTypes, jaql() contract
- [Measures & measureFactory](./measures.md) - aggregations built on top of attributes
- [Data model generation](./data-model-generation.md) - how generated DM code calls createAttribute/createDimension
- [Filters](./filters.md) - filters target attributes and level attributes
