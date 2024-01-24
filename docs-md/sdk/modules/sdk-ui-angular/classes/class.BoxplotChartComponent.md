---
title: BoxplotChartComponent
---

# Class BoxplotChartComponent

An Angular component representing data in a way that visually describes the distribution, variability,
and center of a data set along an axis.
See [Boxplot Chart](https://docs.sisense.com/main/SisenseLinux/box-and-whisker-plot.htm) for more information.

## Constructors

### constructor

> **new BoxplotChartComponent**(): [`BoxplotChartComponent`](class.BoxplotChartComponent.md)

#### Returns

[`BoxplotChartComponent`](class.BoxplotChartComponent.md)

## Properties

### Data

#### dataSet

> **dataSet**: `undefined` \| `string` \| [`Data`](../../sdk-data/interfaces/interface.Data.md)

Data set for this component, which supports two options:

(1) Data source name (as a `string`) - e.g. `Sample ECommerce`. Under the hood,
the chart will have an internal query connect to the data source
and load the data as specified in [dataOptions](class.BoxplotChartComponent.md#dataoptions), [filters](class.BoxplotChartComponent.md#filters), and [highlights](class.BoxplotChartComponent.md#highlights).

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

> **dataOptions**: [`BoxplotChartDataOptions`](../type-aliases/type-alias.BoxplotChartDataOptions.md) \| [`BoxplotChartCustomDataOptions`](../type-aliases/type-alias.BoxplotChartCustomDataOptions.md)

Configurations for how to interpret and present the data passed to the chart

***

#### styleOptions

> **styleOptions**: `undefined` \| [`BoxplotStyleOptions`](../interfaces/interface.BoxplotStyleOptions.md)

Configuration that defines functional style of the various chart elements

### Callbacks

#### beforeRender

> **beforeRender**: `undefined` \| [`BeforeRenderHandler`](../type-aliases/type-alias.BeforeRenderHandler.md)

Before render handler callback that allows adjusting
detail chart options prior to render

This callback is not yet supported for Indicator Chart

***

#### dataPointClick

> **dataPointClick**: `EventEmitter`\< `ArgumentsAsObject`\< `undefined` \| [`DataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.DataPointEventHandler.md), [`"point"`, `"nativeEvent"`] \> \>

Click handler callback for a data point

***

#### dataPointContextMenu

> **dataPointContextMenu**: `EventEmitter`\< `ArgumentsAsObject`\< `undefined` \| [`DataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.DataPointEventHandler.md), [`"point"`, `"nativeEvent"`] \> \>

Context menu handler callback for a data point

***

#### dataPointsSelect

> **dataPointsSelect**: `EventEmitter`\< `ArgumentsAsObject`\< `undefined` \| [`DataPointsEventHandler`](../../sdk-ui/type-aliases/type-alias.DataPointsEventHandler.md), [`"points"`, `"nativeEvent"`] \> \>

Handler callback for selection of multiple data points
