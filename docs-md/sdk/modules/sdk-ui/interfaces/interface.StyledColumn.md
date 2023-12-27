---
title: StyledColumn
---

# Interface StyledColumn

Wrapped [Column](../../sdk-data/interfaces/interface.Column.md) with styles controlling how the column is visualized in a chart.

## Example

An example of using `StyledColumn` to change the date format of the months displayed on the x-axis.

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

Also, see [StyledMeasureColumn](interface.StyledMeasureColumn.md).

## Extends

- `CategoryStyle`

## Properties

### column

> **column**: [`Column`](../../sdk-data/interfaces/interface.Column.md)

Wrapped Column

***

### continuous

> **continuous**?: `boolean`

Boolean flag to toggle continuous timeline on this date column.

#### Inherited from

CategoryStyle.continuous

***

### dateFormat

> **dateFormat**?: `string`

Date format.

See [ECMAScript Date Time String Format](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date-time-string-format)

Note that 'YYYY' and 'DD' have been disabled since they often get confused with 'yyyy' and 'dd'
and can produce unexpected results.

#### Inherited from

CategoryStyle.dateFormat

***

### granularity

> **granularity**?: `string`

Date granularity that works with continuous timeline.

Values from [@sisense/sdk-data!DateLevels](../../sdk-data/variables/variable.DateLevels.md).

#### Inherited from

CategoryStyle.granularity

***

### isColored

> **isColored**?: `boolean`

#### Inherited from

CategoryStyle.isColored

***

### numberFormatConfig

> **numberFormatConfig**?: [`NumberFormatConfig`](../type-aliases/type-alias.NumberFormatConfig.md)

Configuration for number formatting.

#### Inherited from

CategoryStyle.numberFormatConfig

***

### sortType

> **sortType**?: [`SortDirection`](../type-aliases/type-alias.SortDirection-1.md)

Sorting direction, either by Ascending order, Descending order, or None

#### Inherited from

CategoryStyle.sortType
