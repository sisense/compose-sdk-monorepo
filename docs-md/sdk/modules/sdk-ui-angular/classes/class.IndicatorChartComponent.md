---
title: IndicatorChartComponent
---

# Class IndicatorChartComponent

A component that provides various options for displaying one or two numeric values as a number, gauge or ticker.
See [Indicator](https://docs.sisense.com/main/SisenseLinux/indicator.htm) for more information.

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
the chart will have an internal query connect to the data source
and load the data as specified in [dataOptions](class.IndicatorChartComponent.md#dataoptions), [filters](class.IndicatorChartComponent.md#filters), and [highlights](class.IndicatorChartComponent.md#highlights).

OR

(2) Explicit [Data](../../sdk-data/interfaces/interface.Data.md), which is made up of
an array of [columns](../../sdk-data/interfaces/interface.Column.md)
and a two-dimensional array of data [cells](../../sdk-data/interfaces/interface.Cell.md).
This allows the chart component to be used
with user-provided data.

If neither option is specified,
the chart will use the `defaultDataSource` specified in the parent Sisense Context.

***

#### filters

> **filters**: `undefined` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| [`FilterRelation`](../../sdk-data/interfaces/interface.FilterRelation.md)

Filters that will slice query results

***

#### highlights

> **highlights**: `undefined` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Highlight filters that will highlight results that pass filter criteria

### Chart

#### dataOptions

> **dataOptions**: [`IndicatorChartDataOptions`](../../sdk-ui/interfaces/interface.IndicatorChartDataOptions.md)

Configurations for how to interpret and present the data passed to the chart

***

#### styleOptions

> **styleOptions**: `undefined` \| [`IndicatorStyleOptions`](../../sdk-ui/type-aliases/type-alias.IndicatorStyleOptions.md)

Configuration that defines functional style of the various chart elements
