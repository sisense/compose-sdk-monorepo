---
title: IndicatorChartProps
---

# Interface IndicatorChartProps

Props of the [IndicatorChart](../functions/function.IndicatorChart.md) component.

## Extends

- `BaseChartProps`

## Properties

### Data

#### dataSet

> **dataSet**?: `string` \| [`Data`](../../sdk-data/interfaces/interface.Data.md)

Data set for this chart, which supports two options:

(1) Data source name (as a `string`) - e.g. `Sample ECommerce`. Under the hood,
the chart will have an internal [ExecuteQuery](../functions/function.ExecuteQuery.md) connect to the data source
and load the data as specified in [dataOptions](interface.IndicatorChartProps.md#dataoptions), [filters](interface.IndicatorChartProps.md#filters), and [highlights](interface.IndicatorChartProps.md#highlights).

OR

(2) Explicit [Data](../../sdk-data/interfaces/interface.Data.md), which is made up of
an array of [columns](../../sdk-data/interfaces/interface.Column.md)
and a two-dimensional array of data [cells](../../sdk-data/interfaces/interface.Cell.md).
This allows the chart component to be used
with user-provided data.

If neither option is specified,
the chart will use the `defaultDataSource` specified in the parent [SisenseContextProvider](../functions/function.SisenseContextProvider.md) component.

##### Inherited from

BaseChartProps.dataSet

***

#### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Filters that will slice query results

##### Inherited from

BaseChartProps.filters

***

#### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Highlight filters that will highlight results that pass filter criteria

##### Inherited from

BaseChartProps.highlights

### Other

#### dataOptions

> **dataOptions**: [`IndicatorDataOptions`](interface.IndicatorDataOptions.md)

Configurations for how to interpret and present the data passed to the chart

***

#### styleOptions

> **styleOptions**?: [`IndicatorStyleOptions`](../type-aliases/type-alias.IndicatorStyleOptions.md)

Configuration that define functional style of the various chart elements
