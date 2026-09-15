---
type: Module
title: Measures & measureFactory
description: Measure classes (base aggregation, calculated formula, template) and the measureFactory/analyticsFactory function catalogs that create them.
resource: packages/sdk-data/src/dimensional-model
tags: [sdk-data, module, measures]
---

# Purpose

Implements measures — numeric aggregations and formula computations over attributes — and the public `measureFactory` namespace users call to create them. Reach for it when a chart/query needs a value, when translating JAQL `agg`/`formula` items, or when adding a new factory function.

# Entry point

| What             | Where                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Namespace export | `measureFactory` — packages/sdk-data/src/index.ts:91 (`export * as measureFactory from './dimensional-model/measures/factory.js'`)    |
| Namespace export | `analyticsFactory` — packages/sdk-data/src/index.ts:118                                                                               |
| Class            | `AbstractMeasure` — packages/sdk-data/src/dimensional-model/measures/measures.ts:40                                                   |
| Class            | `DimensionalBaseMeasure` — measures/measures.ts:128                                                                                   |
| Class            | `DimensionalCalculatedMeasure` — measures/measures.ts:342                                                                             |
| Class            | `DimensionalMeasureTemplate` — measures/measures.ts:492                                                                               |
| JSON factory     | `createMeasure` — measures/measures.ts:658                                                                                            |
| Agg name mapping | `aggregationFromJAQL` — measures.ts:134; `aggregationToJAQL` — measures.ts:176                                                        |
| Core factory fns | `aggregate` — measures/factory.ts:226; `customFormula` — factory.ts:160; `constant` — factory.ts:254                                  |
| Constants        | `RankingTypes` — factory.ts:31; `RankingSortTypes` — factory.ts:58                                                                    |
| Boxplot helpers  | `boxWhiskerIqrValues` — packages/sdk-data/src/dimensional-model/analytics/factory.ts:39; `BOX_WHISKER` names — analytics/factory.ts:8 |

# Contract

`DimensionalBaseMeasure.jaql()` (measures.ts:305) spreads the attribute's nested JAQL and adds:

```ts
{ jaql: { ...attributeJaql, title: this.name, agg: aggregationToJAQL(this.aggregation) },
  format?: { number: this._format }, jaql.sort?: 'asc' | 'desc' }
```

`DimensionalCalculatedMeasure.jaql()` (measures.ts:449) emits `{ jaql: { title: this.name, formula: this.expression, context: { '[key]': <nested jaql | raw value> } } }`.

Aggregation names differ between the SDK and JAQL — mapping is verbatim in `aggregationToJAQL` (measures.ts:176): SDK `count` → JAQL `'countduplicates'`, SDK `countDistinct` → JAQL `'count'`; all others pass through (`sum`, `avg`, `min`, `max`, `median`, `var`, `stdev`, `stdevp`, `varp`, `mode`). Unknown input falls back to `sum`.

`measureFactory` categories (its `@group` tags; every function is wrapped in `withComposeCodeForMeasure`, compose-code-utils.ts:147):

| Category               | Representative anchors                                                                                                                                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aggregation (16 fns)   | `aggregate` factory.ts:226; `sum` :275; `average`/`avg` :297/:317; `min`/`max` :337/:357; `median` :377; `count` :696; `countDistinct` :718                                                                                      |
| Statistics/Statistical | `stdev` :397; `variance` :439; `percentile` :499; `quartile` :535; `covarp` :576; `correlation` :604; `slope` :636; `runningSum` :1005; `growth` :1042; `growthRate` :1075; `contribution` :1479; `rank` :1644                   |
| Arithmetic (5 fns)     | `constant` :254; `add` :793; `subtract` :819; `multiply` :845; `divide` :871                                                                                                                                                     |
| Time-based (14 fns)    | `yearToDateSum` :899; `quarterToDateSum` :923; `monthToDateSum` :947; `weekToDateSum` :971; `growthPastWeek/Month/Quarter/Year` :1107–:1206; `difference` :1231; `diffPastWeek…Year` :1255–:1327; `pastDay…pastYear` :1347–:1439 |
| Advanced Analytics     | `customFormula` :160; `measuredValue` :751 (measure + filters context); `trend` :1512; `forecast` :1564 (options: `TrendFormulaOptions`/`ForecastFormulaOptions`, packages/sdk-data/src/interfaces.ts:382/:402)                  |

`rank` defaults, verbatim (factory.ts:31-61): `RankingTypes = { StandardCompetition: '1224', ModifiedCompetition: '1334', Dense: '1223', Ordinal: '1234' }`, `RankingSortTypes = { Ascending: 'ASC', Descending: 'DESC' }`.

`analyticsFactory` (analytics/factory.ts) returns measure arrays for boxplot charts: `boxWhiskerIqrValues` :39, `boxWhiskerExtremumsValues` :60, `boxWhiskerStdDevValues` :78 (each built from `customFormula` with engine functions like `QUARTILE`, `LOWERWHISKERMAX_IQR`), plus outlier attributes `boxWhiskerIqrOutliers` :99 and `boxWhiskerStdDevOutliers` :148, which clone the target attribute and override its `jaql()` with an inner `or` filter.

# How it connects

- All measure classes extend `DimensionalElement` and implement `Measure`/`BaseMeasure`/`CalculatedMeasure` from [core-elements](./core-elements.md) (interfaces.ts:117/151/251).
- Factory functions embed operands via `addToFormula` (factory.ts:63), which registers each measure/attribute/filter in the formula `context` under `[normalizeName(name)]` and defaults a `MeasureTemplate` operand to `.sum()`.
- Composite functions (`yearToDateSum`, `growth`, `past*`, …) all reduce to `measureFunction` (factory.ts:88), producing a `DimensionalCalculatedMeasure` wrapping an engine formula like `YTDSum(...)`, `growth(...)`, `RSum(...)`.
- `createMeasure` (measures.ts:658) rebuilds measures from serialized JSON, dispatching on the `MetadataTypes.is*Measure` guards; used by `create()` in dimensional-model/factory.ts:29 and by [translation](./translation.md).
- `analyticsFactory` is consumed by sdk-ui's boxplot chart translation; the `BOX_WHISKER` value names (analytics/factory.ts:8) are matched by name downstream — treat them as a wire contract.

# Invariants and traps

1. Measure JAQL emits `title: this.name`, not `this.title` — sdk-ui prefixes names for per-measure identity aliasing and the JAQL response is matched back by that title (measures.ts:310, :452). Do not "fix" this to use `title`.
2. The SDK↔JAQL aggregation swap (`count` ↔ `countduplicates`, `countDistinct` ↔ `count`) must go through `aggregationToJAQL`/`aggregationFromJAQL`; hand-written `agg` strings silently mean the other aggregation.
3. Formula context keys must be bracketed — `customFormula` auto-wraps unbracketed keys (`cost` → `[cost]`, factory.ts:169); keys inside the formula string must match exactly.
4. Every new factory function must be wrapped in `withComposeCodeForMeasure(fn, 'fnName')` so the resulting element carries `composeCode` — see [compose-code](./compose-code.md).
5. `sort()`/`format()` return new instances; default measure format is `'#,#.00'` (Numeral.js format, measures.ts:48) and serializes as `format: { number: ... }`.
6. `createMeasure` throws `TranslatableError` when a calculated measure lacks `context` or a base measure lacks attribute/aggregation (measures.ts:679-747) — supply all three when constructing JSON.

# Related

- [Element model & JAQL serialization](./core-elements.md) - Element contract, MetadataTypes guards, jaql() semantics
- [Attributes & dimensions](./attributes-and-dimensions.md) - the attributes measures aggregate; attributeFactory.customFormula counterpart
- [Filters](./filters.md) - filters usable inside measuredValue/customFormula contexts
- [Compose code](./compose-code.md) - the withComposeCodeForMeasure wrapper
