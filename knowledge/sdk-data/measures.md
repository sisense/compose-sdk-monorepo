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

| What                 | Where                                                                                                                                                                                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Namespace export     | `measureFactory` — packages/sdk-data/src/index.ts:91 (`export * as measureFactory from './dimensional-model/measures/factory.js'`)                                                                                                                                   |
| Namespace export     | `analyticsFactory` — packages/sdk-data/src/index.ts:118                                                                                                                                                                                                              |
| Class                | `AbstractMeasure` — packages/sdk-data/src/dimensional-model/measures/measures.ts:48                                                                                                                                                                                  |
| Class                | `DimensionalBaseMeasure` — measures/measures.ts:136                                                                                                                                                                                                                  |
| Class                | `DimensionalCalculatedMeasure` — measures/measures.ts:607                                                                                                                                                                                                            |
| Class                | `DimensionalMeasureTemplate` — measures/measures.ts:797                                                                                                                                                                                                              |
| JSON factory         | `createMeasure` — measures/measures.ts:963                                                                                                                                                                                                                           |
| Date-measure helpers | `isDateMeasure` — measures/measures.ts:484; `getDateMeasureAttribute` — measures/measures.ts:468; `getDefaultDateMeasureFormat` — measures/measures.ts:575; `hasDateMeasureLevel` — measures/measures.ts:501; `getDateMeasureAggregation` — measures/measures.ts:519 |
| Agg name mapping     | `aggregationFromJAQL` — measures.ts:142; `aggregationToJAQL` — measures.ts:184                                                                                                                                                                                       |
| Core factory fns     | `aggregate` — measures/factory.ts:236; `customFormula` — factory.ts:167; `constant` — factory.ts:264                                                                                                                                 |
| Constants            | `RankingTypes` — factory.ts:31; `RankingSortTypes` — factory.ts:58                                                                                                                                                                                                   |
| Boxplot helpers      | `boxWhiskerIqrValues` — packages/sdk-data/src/dimensional-model/analytics/factory.ts:39; `BOX_WHISKER` names — analytics/factory.ts:8                                                                                                                                |

# Contract

`DimensionalBaseMeasure.jaql()` (measures.ts:313) spreads the attribute's nested JAQL and adds:

```ts
{ jaql: { ...attributeJaql, title: this.name, agg: aggregationToJAQL(this.aggregation) },
  format?: { number: this._format } | { mask: { <level>: <format> } },
  jaql.sort?: 'asc' | 'desc' }
```

`DimensionalCalculatedMeasure.jaql()` (measures.ts:753) emits `{ jaql: { title: this.name, formula: this.expression, context: { '[key]': <nested jaql | raw value> } } }`. A formula that answers with a date also carries `datatype: 'datetime'`; when its date operand has a level it also carries that granularity and takes `format: { mask: { <level>: <format> } }` instead of `format.number`. Over a date column with no level it carries the datatype alone and keeps `format.number`, the same as the `max` it wraps. Without the datatype and the level nothing on a formula item says its answer is a date, because it has no `dim`. The mask is the one the saved widget carried when there was one, so the measure and a date dimension in the same widget agree; otherwise it falls back to `getDefaultDateMeasureFormat`. Every other formula is untouched and keeps `format.number`.

Aggregation names differ between the SDK and JAQL — mapping is verbatim in `aggregationToJAQL` (measures.ts:184): SDK `count` → JAQL `'countduplicates'`, SDK `countDistinct` → JAQL `'count'`; all others pass through (`sum`, `avg`, `min`, `max`, `median`, `var`, `stdev`, `stdevp`, `varp`, `mode`). Unknown input falls back to `sum`.

Only `min` and `max` preserve the aggregated column's datatype; every other aggregation returns a number whatever it was given. This mirrors query-service behaviour; the SDK does not enforce it. The list is verbatim in `DATATYPE_PRESERVING_AGGREGATIONS` (measures.ts:351) and is read by `getDateMeasureAttribute` (measures.ts:468), which returns the datetime attribute the measure answers with, or `undefined`. It covers two shapes: the aggregation the SDK builds, and the formula Fusion builds, which has no attribute and carries its date operand in `context`.

A date PART is not a date measure. Week-of-year groups by the ordinal 1 to 53 and is sent as `dateTimePart`, so `max` over it answers a number; `isDatePartAttribute` (measures.ts:391) is the single rule for that, read by `isDateMeasure`, `hasDateMeasureLevel` and the formula jaql builder so the three cannot drift.

A formula is treated as a date measure when the saved jaql stamped `datatype: 'datetime'`, or failing that when the whole formula is one `MIN`/`MAX` over one bracketed token. Both resolve through the same `asDateAttribute` step, so the two shapes cannot disagree about a bare date dimension. `isDateMeasure` (measures.ts:484) is the boolean form, and `getDateMeasureAggregation` (measures.ts:519) says whether it is a `min` or a `max`, reading the aggregation on one shape and the function name out of the formula on the other. One place decides it, so the pivot subtotal and the payload cannot disagree. A bare date dimension is resolved to its `defaultLevel`, because that is what carries the granularity. `isDateMeasure` and `getDateMeasureAttribute` are what sdk-query-client and sdk-ui read to decide date handling, for example when typing a result column (packages/sdk-query-client/src/query-result/get-data-from-query-result.ts:28) and when defaulting a measure's date format (packages/sdk-ui/src/domains/visualizations/core/chart-data-options/utils.ts:243). Adding an aggregation to the list changes every such site at once.

`DimensionalBaseMeasure.jaql()` emits a date mask instead of a number format when the measure is a date measure: `format: { mask: { <level>: <format> } }`, keyed by the level the jaql already carries (`dateTimeLevel` or `level`). A date PART carries neither, so no mask is emitted for it; `format.number` appears only when a caller set a format. The same is true of a datetime attribute with no level. `hasDateMeasureLevel` is the shared predicate that decides this: `jaql()` pairs it with the level name it needs for the mask key, and the CSV and Excel export mappers in sdk-ui ask the same predicate, so the three paths cannot disagree. The mask comes from `getDefaultDateMeasureFormat` (measures.ts:575) unless the caller set one, and that resolver clamps a sub-day level to the day format unless the caller set a format on the attribute. Every level a date dimension builds already carries its granularity default, so a format that differs from that default is the only signal the caller set one. A sub-day granularity is sent to the server as the level `minutes` with a bucket, `Seconds` as `seconds` (attributes.ts:403), so an unformatted hours measure emits `mask.minutes` holding a day format: the key names the level the server sees, the value says render it as a day.

`measureFactory` categories (its `@group` tags; every function is wrapped in `withComposeCodeForMeasure`, compose-code-utils.ts:147):

| Category               | Representative anchors                                                                                                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Aggregation (16 fns)   | `aggregate` factory.ts:236; `sum` :287; `average`/`avg` :311/:331; `min`/`max` :354/:377; `median` :399; `count` :728; `countDistinct` :750                                                                                          |
| Statistics/Statistical | `stdev` :421; `variance` :467; `percentile` :531; `quartile` :567; `covarp` :608; `correlation` :636; `slope` :668; `runningSum` :1058; `growth` :1097; `growthRate` :1132; `contribution` :1576; `rank` :1741                       |
| Arithmetic (5 fns)     | `constant` :264; `add` :830; `subtract` :858; `multiply` :886; `divide` :914                                                                                                                                                       |
| Time-based (14 fns)    | `yearToDateSum` :944; `quarterToDateSum` :970; `monthToDateSum` :996; `weekToDateSum` :1022; `growthPastWeek/Month/Quarter/Year` :1166-:1271; `difference` :1298; `diffPastWeek…Year` :1324-:1402; `pastDay…pastYear` :1424-:1533 |
| Advanced Analytics     | `customFormula` :167; `measuredValue` :783 (measure + filters context); `trend` :1609; `forecast` :1661 (options: `TrendFormulaOptions`/`ForecastFormulaOptions`, packages/sdk-data/src/interfaces.ts:382/:402)                      |

`rank` defaults, verbatim (factory.ts:31-61): `RankingTypes = { StandardCompetition: '1224', ModifiedCompetition: '1334', Dense: '1223', Ordinal: '1234' }`, `RankingSortTypes = { Ascending: 'ASC', Descending: 'DESC' }`.

`analyticsFactory` (analytics/factory.ts) returns measure arrays for boxplot charts: `boxWhiskerIqrValues` :39, `boxWhiskerExtremumsValues` :60, `boxWhiskerStdDevValues` :78 (each built from `customFormula` with engine functions like `QUARTILE`, `LOWERWHISKERMAX_IQR`), plus outlier attributes `boxWhiskerIqrOutliers` :99 and `boxWhiskerStdDevOutliers` :148, which clone the target attribute and override its `jaql()` with an inner `or` filter.

A wrapper that answers in the unit of its operand stamps `datatype: 'datetime'` on what it returns when that operand is a date measure: the PAST shifts, `trend`, `forecast` (through `measureFunction`'s `keepsDatatype`, factory.ts:88) and `measuredValue`. Without that stamp `getFormulaDateAttribute` cannot see the date one hop away, so `isDateMeasure` is false for `pastYear(max(date))` and it renders as the leading digits of a date rather than as a date. The numeric transforms (`growth`, `runningSum`, the `*ToDateSum` and `diff*` families) are not stamped; over a numeric measure nothing changes.

The factory does not validate what a date measure is combined with. Arithmetic on a date measure, a numeric transform over one, an aggregation over a date column other than count, countDistinct, min and max, and `min`/`max` at a sub-day level all build; the server rejects or misanswers them, and each builder's TSDoc says what it supports in a `Note:`. Validation is left to the server because CSDK runs against several Fusion versions.

# How it connects

- All measure classes extend `DimensionalElement` and implement `Measure`/`BaseMeasure`/`CalculatedMeasure` from [core-elements](./core-elements.md) (interfaces.ts:117/151/251).
- Factory functions embed operands via `addToFormula` (factory.ts:63), which registers each measure/attribute/filter in the formula `context` under `[normalizeName(name)]` and defaults a `MeasureTemplate` operand to `.sum()`.
- Composite functions (`yearToDateSum`, `growth`, `past*`, …) all reduce to `measureFunction` (factory.ts:88), producing a `DimensionalCalculatedMeasure` wrapping an engine formula like `YTDSum(...)`, `growth(...)`, `RSum(...)`.
- `createMeasure` (measures.ts:963) rebuilds measures from serialized JSON, dispatching on the `MetadataTypes.is*Measure` guards; used by `create()` in dimensional-model/factory.ts:29 and by [translation](./translation.md).
- `analyticsFactory` is consumed by sdk-ui's boxplot chart translation; the `BOX_WHISKER` value names (analytics/factory.ts:8) are matched by name downstream — treat them as a wire contract.

# Invariants and traps

1. Measure JAQL emits `title: this.name`, not `this.title` — sdk-ui prefixes names for per-measure identity aliasing and the JAQL response is matched back by that title (measures.ts:320, :758). Do not "fix" this to use `title`.
2. The SDK↔JAQL aggregation swap (`count` ↔ `countduplicates`, `countDistinct` ↔ `count`) must go through `aggregationToJAQL`/`aggregationFromJAQL`; hand-written `agg` strings silently mean the other aggregation.
3. Formula context keys must be bracketed — `customFormula` auto-wraps unbracketed keys (`cost` → `[cost]`, factory.ts:178); keys inside the formula string must match exactly.
4. Every new factory function must be wrapped in `withComposeCodeForMeasure(fn, 'fnName')` so the resulting element carries `composeCode` — see [compose-code](./compose-code.md).
5. `sort()`/`format()` return new instances; default measure format is `'#,#.00'` (Numeral.js format, measures.ts:56) and serializes as `format: { number: ... }`.
6. `createMeasure` throws `TranslatableError` when a calculated measure lacks `context` or a base measure lacks attribute/aggregation (measures.ts:982-1038) — supply all three when constructing JSON.

# Related

- [Element model & JAQL serialization](./core-elements.md) - Element contract, MetadataTypes guards, jaql() semantics
- [Attributes & dimensions](./attributes-and-dimensions.md) - the attributes measures aggregate; attributeFactory.customFormula counterpart
- [Filters](./filters.md) - filters usable inside measuredValue/customFormula contexts
- [Compose code](./compose-code.md) - the withComposeCodeForMeasure wrapper
