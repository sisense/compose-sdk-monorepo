---
title: KpiSparklineStyleOptions
---

# Type alias KpiSparklineStyleOptions <Badge type="beta" text="Beta" />

> **KpiSparklineStyleOptions**: `object`

Configuration that defines styling of the KPI chart sparkline.
The sparkline is rendered only when [KpiChartDataOptions.trend](../interfaces/interface.KpiChartDataOptions.md#trend) is set.

## Type declaration

### `chartType`

**chartType**?: [`KpiSparklineType`](type-alias.KpiSparklineType.md)

Chart type of the sparkline.

#### Default Value

```ts
'area'
```

***

### `enabled`

**enabled**?: `boolean`

Boolean flag that defines whether the sparkline is shown.

#### Default Value

true when `KpiChartDataOptions.trend` is set
