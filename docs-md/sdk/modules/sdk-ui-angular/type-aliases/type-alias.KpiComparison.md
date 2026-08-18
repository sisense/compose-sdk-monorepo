---
title: KpiComparison
---

# Type alias KpiComparison

> **KpiComparison**: \{
  `type`: `"previous-period"`;
 } \| \{
  `type`: `"delta"`;
  `value`: [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`StyledMeasureColumn`](../interfaces/interface.StyledMeasureColumn.md);
 } \| \{
  `target`: [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`StyledMeasureColumn`](../interfaces/interface.StyledMeasureColumn.md) \| `number`;
  `type`: `"target"`;
 } \| \{
  `type`: `"value"`;
  `value`: [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`StyledMeasureColumn`](../interfaces/interface.StyledMeasureColumn.md);
 }

What the KPI headline value is compared against.
Each variant carries its own baseline, so invalid combinations are unrepresentable.

Variants:

- `{ type: 'previous-period' }` — compares the last category bucket against the one before it.
  Requires [KpiChartDataOptions.category](../interfaces/interface.KpiChartDataOptions.md#category).
- `{ type: 'delta', value }` — compares against a second measure, reporting the difference and
  the percent change with an up/down arrow.
- `{ type: 'target', target }` — treats the baseline as a goal and reads out progress toward it,
  e.g. '82% of goal' with '$12K to go'. Accepts a measure or a fixed number.
- `{ type: 'value', value }` — shows a second measure's value beside the headline, with no delta
  math and no delta coloring.

For the measure-backed variants, wrapping the measure in a [StyledMeasureColumn](../interfaces/interface.StyledMeasureColumn.md) lets its
`numberFormatConfig` format the readout — the delta for `'delta'`, the amount-to-go for
`'target'`. Both fall back to the headline value's own format config.

## Example

Against the preceding period:
```ts
comparison: { type: 'previous-period' }
```

## Example

Against a fixed goal:
```ts
comparison: { type: 'target', target: 250000 }
```
