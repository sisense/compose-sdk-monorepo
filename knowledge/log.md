# Log

## 2026-09-24

- **Update**: `isDateMeasure` no longer counts a date PART such as week-of-year, which answers an
  ordinal. The PAST shifts, `trend`, `forecast` and `measuredValue` stamp `datatype: 'datetime'` on
  their result when the operand is a date measure, so it renders as a date, and a pivot subtotal
  over such a wrapper reads the operand's aggregation. The factory does not validate what a date
  measure is combined with; that is left to the server, and each builder the server rejects or
  misanswers over a date says what it supports in a `Note:` in its description. Refreshed the shifted `factory.ts` and
  `measures.ts` anchors. A date formula over a date column with no level keeps
  `datatype: 'datetime'`, without a level-keyed mask. Recorded in [measures](./sdk-data/measures.md).

## 2026-09-22

- **Fix**: the measure-filter attribute search decides what to recurse into by TYPE, not by shape.
  A calculated attribute carries a `context` just like a calculated measure, so the old check
  descended into one and answered with an operand inside it instead of the attribute the caller
  named. Guarded with `MetadataTypes.isCalculatedMeasure`, which leaves a calculated attribute to be
  taken as the attribute candidate it is. Extended item 9 and refreshed the shifted `factory.ts`
  anchors. Recorded in [filters](./sdk-data/filters.md).

- **Fix**: measure-filter attribute resolution no longer stops at a nested bare attribute. The
  traversal now reports whether it found a measure/filter operand or only the last-resort bare
  attribute, so a nested formula over a bare attribute is held as a candidate and a real measure
  operand later in the outer context still wins, at any depth. Added item 9 to Invariants and traps
  and refreshed the `factory.ts` anchors the new helper moved.
  Recorded in [filters](./sdk-data/filters.md).

- **Fix**: corrected stale `file:line` anchors this branch had already moved or mis-resolved:
  `logic.and`/`or` and the `relate` flattening helper in
  [filter relations](./sdk-data/filter-relations.md), and `DimensionalMeasureTemplate` and
  `createMeasure` and `DimensionalCalculatedMeasure.jaql()` in [measures](./sdk-data/measures.md).

- **Update**: measure filters accept a date bound. `MeasureFilter` widens to
  `number | string | Date` and converts a `Date` in its constructor through the new module-scope
  `toLocalIsoDateTime`, which emits `yyyy-MM-ddTHH:mm:ss` with no `Z` so the server does not read
  the bound as UTC and shift the day. `DateRangeFilter` keeps its own `toISOString` path
  deliberately. Added the new export to the Entry point table, added item 7 to Invariants and traps,
  and refreshed the stale `file:line` references for `filters.ts` and `factory.ts`.
  The serializer rejects an invalid `Date` with the new `errors.filter.invalidDateValue`
  message rather than serializing `NaN`.
  Recorded in [filters](./sdk-data/filters.md).

## 2026-09-17

- **Update**: measures doc records that `getDateMeasureAttribute` now covers the formula shape as
  well as the aggregation shape. `DimensionalCalculatedMeasure` carries the `datatype` the saved
  jaql stamped, and its `jaql()` sends a date formula as a datetime with a mask. Adds
  `getDateMeasureAggregation`, the single place that says whether a date measure is a `min` or a
  `max`. Refreshed the `file:line` references that moved.
  Recorded in [measures](./sdk-data/measures.md).

- **Update**: `createCalculatedAttribute` builds raw JAQL context entries through
  `createDimensionalElementFromJaql` so calculated-dimension filters keep each column's real data type
  (text/numeric/datetime) and can be rebuilt via `createFilter(instance)`. Recorded in
  [attributes-and-dimensions](./sdk-data/attributes-and-dimensions.md).
- **Update**: measures doc records that `DimensionalBaseMeasure.jaql()` now emits a date mask for a
  date measure, and adds `getDefaultDateMeasureFormat` and `hasDateMeasureLevel` to the entry points.
  `hasDateMeasureLevel` is the shared predicate the jaql, CSV and Excel paths ask, and
  `getDefaultDateMeasureFormat` now keeps a caller's own format on a sub-day level instead of
  clamping it. Refreshed the `file:line` references that moved.
  Recorded in [measures](./sdk-data/measures.md).

- **Fix**: refreshed `file:line` anchors in four docs that were not edited but reference files this
  change moved lines in.
  Recorded in [filters](./sdk-data/filters.md),
  [filter-relations](./sdk-data/filter-relations.md),
  [attributes-and-dimensions](./sdk-data/attributes-and-dimensions.md) and
  [core-elements](./sdk-data/core-elements.md).

- **Update**: measures doc records the datatype-preserving aggregation rule: only `min` and `max`
  keep the aggregated column's datatype. Added `isDateMeasure` and `getDateMeasureAttribute` to the
  entry points and updated the `file:line` references that moved.
  Recorded in [measures](./sdk-data/measures.md).

## 2026-09-11

- **Creation**: OKF knowledge bundle bootstrapped for the `sdk-data` package and monorepo
  architecture — 8 concept docs plus an overview under `sdk-data/`, prescriptive invariants
  under `architecture/`. Maintenance contract installed in `CLAUDE.md` and
  `.claude/rules/okf-knowledge.md`; structural checks in `scripts/check-knowledge.sh`.
  Recorded in [sdk-data overview](./sdk-data/overview.md).
