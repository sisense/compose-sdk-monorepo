---
title: AreamapChartProps
---

# Interface AreamapChartProps

Props of the [AreamapChart](../functions/function.AreamapChart.md) component.

## Extends

- `BaseChartProps`.`AreamapChartEventProps`

## Properties

### Data

#### dataSet

> **dataSet**?: `string` \| [`Data`](../../sdk-data/interfaces/interface.Data.md)

Data set for this component, which supports two options:

(1) Data source name (as a `string`) - e.g. `Sample ECommerce`. Under the hood,
the chart will have an internal query connect to the data source
and load the data as specified in [dataOptions](interface.AreamapChartProps.md#dataoptions), [filters](interface.AreamapChartProps.md#filters), and [highlights](interface.AreamapChartProps.md#highlights).

OR

(2) Explicit [Data](../../sdk-data/interfaces/interface.Data.md), which is made up of
an array of [columns](../../sdk-data/interfaces/interface.Column.md)
and a two-dimensional array of data [cells](../../sdk-data/interfaces/interface.Cell.md).
This allows the chart component to be used
with user-provided data.

If neither option is specified,
the chart will use the `defaultDataSource` specified in the parent Sisense Context.

##### Inherited from

BaseChartProps.dataSet

***

#### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md)

Filters that will slice query results

##### Inherited from

BaseChartProps.filters

***

#### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Highlight filters that will highlight results that pass filter criteria

##### Inherited from

BaseChartProps.highlights

### Chart

#### dataOptions

> **dataOptions**: [`AreamapChartDataOptions`](interface.AreamapChartDataOptions.md)

Configurations for how to interpret and present the data passed to the chart

***

#### styleOptions

> **styleOptions**?: [`AreamapStyleOptions`](interface.AreamapStyleOptions.md)

Configuration that defines functional style of the various chart elements

### Callbacks

#### onDataPointClick

> **onDataPointClick**?: [`AreamapDataPointEventHandler`](../type-aliases/type-alias.AreamapDataPointEventHandler.md)

Click handler callback for a data point

##### Inherited from

AreamapChartEventProps.onDataPointClick
