---
title: ScatterChartComponent
---

# Class ScatterChartComponent

Scatter Chart Component

## Constructors

### constructor

> **new ScatterChartComponent**(): [`ScatterChartComponent`](class.ScatterChartComponent.md)

#### Returns

[`ScatterChartComponent`](class.ScatterChartComponent.md)

## Properties

### Data

#### dataOptions

> **dataOptions**: [`ScatterChartDataOptions`](../../sdk-ui/interfaces/interface.ScatterChartDataOptions.md)

Highlight filters that will highlight results that pass filter criteria

***

#### dataSet

> **dataSet**: `undefined` \| `string` \| [`Data`](../../sdk-data/interfaces/interface.Data.md)

Data set for this component, which supports two options:

(1) Data source name (as a `string`) - e.g. `Sample ECommerce`. Under the hood,
the chart will have an internal [ExecuteQuery](../../sdk-ui/functions/function.ExecuteQuery.md) connect to the data source
and load the data as specified in [dataOptions](class.ScatterChartComponent.md#dataoptions), [filters](class.ScatterChartComponent.md#filters), and [highlights](class.ScatterChartComponent.md#highlights).

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

#### styleOptions

> **styleOptions**: `undefined` \| [`ScatterStyleOptions`](../../sdk-ui/interfaces/interface.ScatterStyleOptions.md)

Configuration that define functional style of the various chart elements

### Callbacks

#### beforeRender

> **beforeRender**: `undefined` \| [`BeforeRenderHandler`](../../sdk-ui/type-aliases/type-alias.BeforeRenderHandler.md)

Before render handler callback that allows adjusting
detail chart options prior to render

This callback is not yet supported for [IndicatorChart](../../sdk-ui/functions/function.IndicatorChart.md)

***

#### dataPointClick

> **dataPointClick**: `EventEmitter`\< `ArgumentsAsObject`\< `undefined` \| [`ScatterDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointEventHandler.md), [`"point"`, `"nativeEvent"`] \> \>

Click handler callback for a data point

***

#### dataPointContextMenu

> **dataPointContextMenu**: `EventEmitter`\< `ArgumentsAsObject`\< `undefined` \| [`ScatterDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointEventHandler.md), [`"point"`, `"nativeEvent"`] \> \>

Context menu handler callback for a data point

***

#### dataPointsSelect

> **dataPointsSelect**: `EventEmitter`\< `ArgumentsAsObject`\< `undefined` \| [`ScatterDataPointsEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointsEventHandler.md), [`"points"`, `"nativeEvent"`] \> \>

Handler callback for selection of multiple data points
