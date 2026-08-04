---
title: KpiChartDataOptions
---

# Interface KpiChartDataOptions <Badge type="beta" text="Beta" />

Configuration for how to query aggregate data and assign data to a
[KPI chart](../type-aliases/type-alias.KpiChartType.md).

## Example

```ts
<KpiChart
  dataSet={DM.DataSource}
  dataOptions={{
    value: measureFactory.sum(DM.Commerce.Revenue),
    category: DM.Commerce.Date.Months,
    comparison: { type: 'previous-period' },
  }}
/>
```

## Properties

### category

> **category**?: [`Column`](../../sdk-data/interfaces/interface.Column.md) \| [`StyledColumn`](interface.StyledColumn.md)

Sets the card's category (typically a date dimension): enables the sparkline, the
current-period caption, the 'previous-period' comparison, and the `valueMode` semantics.
Granularity comes from the column.

#### Example

```ts
category: DM.Commerce.Date.Months
```

***

### comparison

> **comparison**?: [`KpiComparison`](../type-aliases/type-alias.KpiComparison.md)

Configures what the headline is compared against.

#### Example

```ts
comparison: { type: 'target', target: 10000 }
```

***

### value

> **value**: [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md)

Primary measure — the headline KPI value. Conditional coloring via `color` on the styled measure.

***

### valueMode

> **valueMode**?: [`KpiValueMode`](../type-aliases/type-alias.KpiValueMode.md)

Selects which number is the headline when `category` is set.

#### Example

```ts
valueMode: 'total' // aggregate over the whole period instead of the last category bucket
```

#### Default Value

```ts
'last'
```
