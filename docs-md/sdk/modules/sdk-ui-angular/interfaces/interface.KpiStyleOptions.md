---
title: KpiStyleOptions
---

# Interface KpiStyleOptions

Configuration options that define functional style of the various elements of a KPI chart.

## Example

```ts
<KpiChart
  dataSet={DM.DataSource}
  dataOptions={{
    value: measureFactory.sum(DM.Commerce.Revenue),
    category: DM.Commerce.Date.Months,
  }}
  styleOptions={{
    title: { text: 'Monthly Revenue' },
    sparkline: { chartType: 'line' },
    card: { textAlign: 'center', cornerRadius: 12 },
  }}
/>
```

## Properties

### card

> **card**?: [`KpiCardStyleOptions`](../type-aliases/type-alias.KpiCardStyleOptions.md)

Card container styling.

***

### comparison

> **comparison**?: [`KpiComparisonStyleOptions`](../type-aliases/type-alias.KpiComparisonStyleOptions.md)

Comparison readout styling (polarity, icon, colors).

***

### height

> **height**?: `number`

Total height of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels).
2. Height of the container wrapping this component
3. Default value of 400px (for component without header) or 425px (for component with header).

***

### layout

> **layout**?: `"comparison-first"` \| `"standard"`

Which of the two readouts gets the headline role on the card.

- `'standard'` — the value is the headline, scaled large to fit the card, with the
  comparison beneath it in the compact role.
- `'comparison-first'` — the two swap: the comparison becomes the large headline and the
  value moves below it. Useful when the change matters more than the absolute number.
  Falls back to `'standard'` when no comparison is configured, so the card is never left
  with an empty headline.

#### Default

```ts
'standard'
```

***

### sparkline

> **sparkline**?: [`KpiSparklineStyleOptions`](../type-aliases/type-alias.KpiSparklineStyleOptions.md)

Sparkline styling; rendered only when [KpiChartDataOptions.category](interface.KpiChartDataOptions.md#category) is set.

***

### title

> **title**?: [`KpiTitleStyleOptions`](../type-aliases/type-alias.KpiTitleStyleOptions.md)

Card title styling (defaults to the value measure title).

***

### value

> **value**?: [`KpiValueStyleOptions`](../type-aliases/type-alias.KpiValueStyleOptions.md)

Headline value styling.

***

### width

> **width**?: `number`

Total width of the component, which is considered in the following order of priority:

1. Value passed to this property (in pixels)
2. Width of the container wrapping this component
3. Default value of 400px
