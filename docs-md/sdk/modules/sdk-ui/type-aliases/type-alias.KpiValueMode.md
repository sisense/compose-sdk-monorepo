---
title: KpiValueMode
---

# Type alias KpiValueMode <Badge type="beta" text="Beta" />

> **KpiValueMode**: `"last"` \| `"total"`

Which number becomes the KPI headline when [KpiChartDataOptions.trend](../interfaces/interface.KpiChartDataOptions.md#trend) is set.
'last' — the last date bucket; 'total' — aggregate over the whole period
(computed by a separate ungrouped query — correct SQL semantics).
