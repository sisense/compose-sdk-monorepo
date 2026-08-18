---
title: KpiRenderOptions
---

# Type alias KpiRenderOptions

> **KpiRenderOptions**: `object`

Render options of a KPI chart, as computed from the query result.
Passed to [KpiBeforeRenderHandler](type-alias.KpiBeforeRenderHandler.md) for customization before painting.

## Type declaration

### `comparison`

**comparison**?: [`KpiComparisonInfo`](type-alias.KpiComparisonInfo.md)

Resolved comparison shown on the card, when a comparison is configured and computable.

***

### `sparklinePoints`

**sparklinePoints**?: \{
  `x`: `number`;
  `y`: `null` \| `number`;
 }[]

Points of the sparkline, one per category bucket, ordered as queried. A `null` `y` marks
a gap in the line and is never rendered as zero.

***

### `value`

**value**?: `number`

The headline number. Undefined when the query produced no value to show.

***

### `valueColor`

**valueColor**?: `string`

Resolved color of the headline value, as derived from the value measure's color configuration.

***

### `valuePeriodMs`

**valuePeriodMs**?: `number`

Category bucket the headline value was read from, as epoch milliseconds. Drives the
period caption in the title section, e.g. 'DEC 2013'.

Undefined when there is no single bucket to caption: no `category` configured,
a non-date category, or `valueMode: 'total'` making the headline a whole-period aggregate.

***

### `valueTitle`

**valueTitle**: `string`

Title text of the card — the `text` override from [KpiTitleStyleOptions](type-alias.KpiTitleStyleOptions.md), or the value measure's title.
