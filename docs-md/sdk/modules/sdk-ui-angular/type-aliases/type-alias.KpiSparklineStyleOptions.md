---
title: KpiSparklineStyleOptions
---

# Type alias KpiSparklineStyleOptions

> **KpiSparklineStyleOptions**: `object`

Configuration that defines styling of the KPI chart sparkline.
The sparkline is rendered only when [KpiChartDataOptions.category](../interfaces/interface.KpiChartDataOptions.md#category) is set.

## Type declaration

### `chartType`

**chartType**?: [`KpiSparklineType`](type-alias.KpiSparklineType.md)

Chart type of the sparkline.

#### Default

```ts
'area'
```

***

### `enabled`

**enabled**?: `boolean`

Boolean flag that defines whether the sparkline is shown.

#### Default

true when `KpiChartDataOptions.category` is set
