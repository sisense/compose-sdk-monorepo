---
title: KpiDataPoint
---

# Type alias KpiDataPoint <Badge type="beta" text="Beta" />

> **KpiDataPoint**: `object`

Data point in a KPI chart — the card represents a single aggregated point.

## Type declaration

### `comparison`

**comparison**?: [`KpiComparisonInfo`](type-alias.KpiComparisonInfo.md)

Resolved comparison shown on the card, when a comparison is active.

***

### `date`

**date**?: `number`

Last category bucket as epoch milliseconds, when a category dimension is set.

***

### `value`

**value**?: `number`

Headline value.
