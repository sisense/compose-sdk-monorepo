---
title: IndicatorChartComponent
---

# Class IndicatorChartComponent

Indicator Chart Component

## Constructors

### constructor

> **new IndicatorChartComponent**(): [`IndicatorChartComponent`](class.IndicatorChartComponent.md)

#### Returns

[`IndicatorChartComponent`](class.IndicatorChartComponent.md)

## Properties

### Data

#### dataSet

> **dataSet**: `undefined` \| `string` \| [`Data`](../../sdk-data/interfaces/interface.Data.md)

Data set for this component, which supports two options:

(1) Data source name (as a `string`) - e.g. `Sample ECommerce`. Under the hood,
the chart will have an internal [ExecuteQuery](../../sdk-ui/functions/function.ExecuteQuery.md) connect to the data source
and load the data as specified in [dataOptions](class.IndicatorChartComponent.md#dataoptions), [filters](class.IndicatorChartComponent.md#filters), and [highlights](class.IndicatorChartComponent.md#highlights).

OR

(2) Explicit [Data](../../sdk-data/interfaces/interface.Data.md), which is made up of
an array of [columns](../../sdk-data/interfaces/interface.Column.md)
and a two-dimensional array of data [cells](../../sdk-data/interfaces/interface.Cell.md).
This allows the chart component to be used
with user-provided data.

If neither option is specified,
the chart will use the `defaultDataSource` specified in the parent [SisenseContextProvider](../../sdk-ui/functions/function.SisenseContextProvider.md) component.

***

#### filters

> **filters**: `undefined` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Filters that will slice query results

***

#### highlights

> **highlights**: `undefined` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Highlight filters that will highlight results that pass filter criteria

### Chart

#### dataOptions

> **dataOptions**: [`IndicatorDataOptions`](../../sdk-ui/interfaces/interface.IndicatorDataOptions.md)

Configurations for how to interpret and present the data passed to the chart

***

#### styleOptions

> **styleOptions**: `undefined` \| [`IndicatorStyleOptions`](../../sdk-ui/type-aliases/type-alias.IndicatorStyleOptions.md)

Configuration that define functional style of the various chart elements
