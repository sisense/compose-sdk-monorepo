---
title: KpiComparison
---

# Type alias KpiComparison <Badge type="beta" text="Beta" />

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
