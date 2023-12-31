---
title: ScattermapChartProps
---

# Interface ScattermapChartProps

Props of the [ScattermapChart](../functions/function.ScattermapChart.md) component.

## Extends

- `BaseChartProps`.`ChartEventProps`

## Properties

### Data

#### dataSet

> **dataSet**?: `string` \| [`Data`](../../sdk-data/interfaces/interface.Data.md)

Data set for this component, which supports two options:

(1) Data source name (as a `string`) - e.g. `Sample ECommerce`. Under the hood,
the chart will have an internal query connect to the data source
and load the data as specified in [dataOptions](interface.ScattermapChartProps.md#dataoptions), [filters](interface.ScattermapChartProps.md#filters), and [highlights](interface.ScattermapChartProps.md#highlights).

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

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| [`FilterRelation`](../../sdk-data/interfaces/interface.FilterRelation.md)

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

> **dataOptions**: [`ScattermapChartDataOptions`](interface.ScattermapChartDataOptions.md)

Configurations for how to interpret and present the data passed to the chart

***

#### styleOptions

> **styleOptions**?: [`ScattermapStyleOptions`](interface.ScattermapStyleOptions.md)

Configuration that defines functional style of the various chart elements

### Callbacks

#### onBeforeRender

> **onBeforeRender**?: [`BeforeRenderHandler`](../type-aliases/type-alias.BeforeRenderHandler.md)

Before render handler callback that allows adjusting
detail chart options prior to render

This callback is not yet supported for Indicator Chart

##### Inherited from

ChartEventProps.onBeforeRender

***

#### onDataPointClick

> **onDataPointClick**?: [`DataPointEventHandler`](../type-aliases/type-alias.DataPointEventHandler.md)

Click handler callback for a data point

##### Inherited from

ChartEventProps.onDataPointClick

***

#### onDataPointContextMenu

> **onDataPointContextMenu**?: [`DataPointEventHandler`](../type-aliases/type-alias.DataPointEventHandler.md)

Context menu handler callback for a data point

##### Inherited from

ChartEventProps.onDataPointContextMenu

***

#### onDataPointsSelected

> **onDataPointsSelected**?: [`DataPointsEventHandler`](../type-aliases/type-alias.DataPointsEventHandler.md)

Handler callback for selection of multiple data points

##### Inherited from

ChartEventProps.onDataPointsSelected
