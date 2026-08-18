---
title: KpiDataPoint
---

# Type alias KpiDataPoint

> **KpiDataPoint**: `object`

Data point in a KPI chart — the card represents a single aggregated point.

Like [IndicatorDataPoint](type-alias.IndicatorDataPoint.md), the whole card is one data point, so every zone is exposed
through the standard `entries` structure keyed by the [KpiChartDataOptions](../interfaces/interface.KpiChartDataOptions.md) field it
comes from. `comparison` carries the resolved comparison math on top, since figures such as
`deltaPercent` or `toGo` are derived rather than queried and so have no data option of their own.

## Example

Reading the zones of a clicked KPI card:
```ts
<KpiChart
  dataSet={DM.DataSource}
  dataOptions={{
    value: measureFactory.sum(DM.Commerce.Revenue),
    category: DM.Commerce.Date.Months,
  }}
  onDataPointClick={(point) => {
    point.entries?.value?.displayValue; // '1.5K'
    point.entries?.category?.value; // '2026-03-01T00:00:00'
    point.comparison?.label; // 'vs prior month'
  }}
/>
```

## Type declaration

### `comparison`

**comparison**?: [`KpiComparisonInfo`](type-alias.KpiComparisonInfo.md)

Resolved comparison shown on the card, when a comparison is active.

***

### `entries`

**entries**?: `object`

A collection of data point entries that represents values for all related `dataOptions`.

> #### `entries.category`
>
> **category**?: [`DataPointEntry`](type-alias.DataPointEntry.md)
>
> Data point entry for the `category` data option — the bucket the headline value belongs to.
> Absent when no category is set, and when `valueMode: 'total'` makes the headline an
> aggregate over every bucket rather than one of them.
>
> #### `entries.comparison`
>
> **comparison**?: [`DataPointEntry`](type-alias.DataPointEntry.md)
>
> Data point entry for the comparison's own measure, carrying that measure's queried value:
> the baseline of a `'delta'` comparison, the target of a measure-backed `'target'`, or the
> secondary value of a `'value'` comparison. Absent for `'previous-period'` and fixed-number
> `'target'` comparisons, which have no measure of their own.
>
> #### `entries.value`
>
> **value**?: [`DataPointEntry`](type-alias.DataPointEntry.md)
>
> Data point entry for the `value` data option — the headline measure.
>
>
