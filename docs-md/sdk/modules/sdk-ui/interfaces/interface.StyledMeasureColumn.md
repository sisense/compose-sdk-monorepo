---
title: StyledMeasureColumn
---

# Interface StyledMeasureColumn

Wrapped [Measure Column](../../sdk-data/interfaces/interface.MeasureColumn.md) with styles
controlling how the measure is visualized in a chart.

## Example

Example of using `StyledMeasureColumn` to mix a column series of `Total Revenue` to a line chart.

Note that the chart doesn't display a second Y-axis on the right but that can be customized by
style options.

```ts
<Chart
  dataSet={DM.DataSource}
  chartType={'line'}
  dataOptions={{
    category: [
      {
        column: DM.Commerce.Date.Months,
        dateFormat: 'yy-MM',
      },
    ],
    value: [
      measureFactory.sum(DM.Commerce.Revenue),
      {
        column: measureFactory.sum(DM.Commerce.Quantity),
        showOnRightAxis: true,
        chartType: 'column',
      },
    ],
    breakBy: [],
  }}
/>
```

<img src="../../../img/chart-mixed-series-example-1.png" width="800px" />

See also [StyledColumn](interface.StyledColumn.md).

## Extends

- `ValueStyle`.`SeriesStyle`

## Properties

### chartType

> **chartType**?: [`SeriesChartType`](../type-aliases/type-alias.SeriesChartType.md)

Series chart type, which is used with [StyledMeasureColumn](interface.StyledMeasureColumn.md) to customize
series in a mixed chart.

#### Inherited from

ValueStyle.chartType

***

### color

> **color**?: [`DataColorOptions`](../type-aliases/type-alias.DataColorOptions.md)

All possible color options for data.

#### Inherited from

ValueStyle.color

***

### column

> **column**: [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md)

Wrapped MeasureColumn or CalculatedMeasureColumn

***

### connectNulls

> **connectNulls**?: `boolean`

Boolean flag whether to connect a graph line across null points or render a gap

#### Inherited from

ValueStyle.connectNulls

***

### dataBars

> **dataBars**?: `boolean`

Boolean flag whether to display data bars for this measure in the pivot table.

#### Inherited from

ValueStyle.dataBars

***

### numberFormatConfig

> **numberFormatConfig**?: [`NumberFormatConfig`](../type-aliases/type-alias.NumberFormatConfig.md)

Configuration for number formatting.

#### Inherited from

ValueStyle.numberFormatConfig

***

### seriesStyleOptions

> **seriesStyleOptions**?: [`SeriesStyleOptions`](../type-aliases/type-alias.SeriesStyleOptions.md)

Specific style options to be applied to specific series in Chart.
Supported only for cartesian and polar charts.

#### Inherited from

SeriesStyle.seriesStyleOptions

***

### showOnRightAxis

> **showOnRightAxis**?: `boolean`

Boolean flag whether to show this value/measure
on the right axis (`true`) or on the left axis (`false`).

#### Inherited from

ValueStyle.showOnRightAxis

***

### sortType

> **sortType**?: [`SortDirection`](../type-aliases/type-alias.SortDirection.md)

Sorting direction, either by Ascending order, Descending order, or None

#### Inherited from

ValueStyle.sortType

***

### totalsCalculation

> **totalsCalculation**?: [`TotalsCalculation`](../../sdk-data/type-aliases/type-alias.TotalsCalculation.md)

Calculation for the totals of this measure in the pivot table.

#### Inherited from

ValueStyle.totalsCalculation

***

### treatNullDataAsZeros

> **treatNullDataAsZeros**?: `boolean`

Boolean flag whether null values are treated as zeros in the chart

#### Inherited from

ValueStyle.treatNullDataAsZeros
