---
title: ChartProps
---

# Interface ChartProps

Props shared across [Chart](../classes/class.Chart-2.md) components.

## Extends

- `BaseChartProps`.`BaseChartEventProps`

## Properties

### Data

#### dataSet

> **dataSet**?: `string` \| [`Data`](../../sdk-data/interfaces/interface.Data.md)

Data set for this component, which supports two options:

(1) Data source name (as a `string`) - e.g. `Sample ECommerce`. Under the hood,
the chart will have an internal query connect to the data source
and load the data as specified in [dataOptions](interface.ChartProps-2.md#dataoptions), [filters](interface.ChartProps-2.md#filters), and [highlights](interface.ChartProps-2.md#highlights).

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

#### chartType

> **chartType**: [`ChartType`](../../sdk-ui/type-aliases/type-alias.ChartType.md)

Default chart type of each series.

***

#### dataOptions

> **dataOptions**: [`ChartDataOptions`](../../sdk-ui/type-aliases/type-alias.ChartDataOptions.md)

Configurations for how to interpret and present data passed to the chart.

***

#### styleOptions

> **styleOptions**?: [`ChartStyleOptions`](../../sdk-ui/type-aliases/type-alias.ChartStyleOptions.md)

Style options union across chart types.

### Callbacks

#### onBeforeRender

> **onBeforeRender**?: [`BeforeRenderHandler`](../../sdk-ui/type-aliases/type-alias.BeforeRenderHandler.md)

Before render handler callback that allows adjusting
detail chart options prior to render

This callback is not yet supported for Indicator Chart

##### Inherited from

BaseChartEventProps.onBeforeRender

***

#### onDataPointClick

> **onDataPointClick**?: [`DataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.DataPointEventHandler.md) \| [`ScatterDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointEventHandler.md)

Click handler callback for a data point

##### Inherited from

BaseChartEventProps.onDataPointClick

***

#### onDataPointContextMenu

> **onDataPointContextMenu**?: [`DataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.DataPointEventHandler.md) \| [`ScatterDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointEventHandler.md)

Context menu handler callback for a data point

##### Inherited from

BaseChartEventProps.onDataPointContextMenu

***

#### onDataPointsSelected

> **onDataPointsSelected**?: [`DataPointsEventHandler`](../../sdk-ui/type-aliases/type-alias.DataPointsEventHandler.md) \| [`ScatterDataPointsEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointsEventHandler.md)

Handler callback for selection of multiple data points

##### Inherited from

BaseChartEventProps.onDataPointsSelected
