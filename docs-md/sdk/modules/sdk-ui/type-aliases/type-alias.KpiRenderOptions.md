---
title: KpiRenderOptions
---

# Type alias KpiRenderOptions <Badge type="beta" text="Beta" />

> **KpiRenderOptions**: `object`

Render options of a KPI chart, as computed from the query result.
Passed to [KpiBeforeRenderHandler](type-alias.KpiBeforeRenderHandler.md) for customization before painting.

## Type declaration

### `comparison`

**comparison**?: [`KpiComparisonInfo`](type-alias.KpiComparisonInfo.md)

***

### `sparklinePoints`

**sparklinePoints**?: \{
  `x`: `number`;
  `y`: `null` \| `number`;
 }[]

***

### `value`

**value**?: `number`

***

### `valueColor`

**valueColor**?: `string`

***

### `valuePeriodMs`

**valuePeriodMs**?: `number`

***

### `valueTitle`

**valueTitle**: `string`
