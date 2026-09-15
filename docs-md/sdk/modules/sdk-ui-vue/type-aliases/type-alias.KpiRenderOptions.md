---
title: KpiRenderOptions
---

# Type alias KpiRenderOptions

> **KpiRenderOptions**: `object`

Render options of a KPI chart, as computed from the query result.
Passed to [KpiBeforeRenderHandler](type-alias.KpiBeforeRenderHandler.md) for customization before painting.

## Type declaration

### `categoryDisplayValue`

**categoryDisplayValue**?: `string`

Display text of the category bucket the headline value was read from, for a category that
isn't a date — a Gender-bucketed card's 'Female'. Captions the title section in
`valuePeriodMs`'s place, so at most one of the two is ever set.

Set under the same single-bucket rule as `valuePeriodMs` (including its `'total'` fallback),
and undefined wherever that one is: no `category` configured, a date category — whose bucket
`valuePeriodMs` names instead — or a headline aggregating over every bucket.

***

### `comparison`

**comparison**?: [`KpiComparisonInfo`](type-alias.KpiComparisonInfo.md)

Resolved comparison shown on the card, when a comparison is configured and computable.

***

### `sparklinePoints`

**sparklinePoints**?: \{
  `categoryDisplayValue?`: `string`;
  `x`: `number`;
  `y`: `null` \| `number`;
 }[]

Points of the sparkline, one per category bucket, ordered as queried. A `null` `y` marks
a gap in the line and is never rendered as zero.

`x` is the bucket's date as epoch milliseconds for a date category. For any other category
it is the bucket's position instead (0, 1, 2, …) — dateless values have no place on a time
axis — and `categoryDisplayValue` carries that bucket's display text, e.g. 'Female', which
is what the sparkline tooltip names the point by.

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

Set only when the headline belongs to a single bucket AND that bucket is a date. Undefined
otherwise: no `category` configured, a category that isn't a date (which captions the section
through `categoryDisplayValue` instead), or `valueMode: 'total'` aggregating over every
bucket. Note that a `'total'` headline falls back to the last bucket whenever no whole-period
aggregate is available — for an explicit `Data` set, say, where no query runs — and is then
captioned as the bucket it actually came from.

***

### `valueTitle`

**valueTitle**: `string`

Title text of the card — the `text` override from [KpiTitleStyleOptions](type-alias.KpiTitleStyleOptions.md), or the value measure's title.
