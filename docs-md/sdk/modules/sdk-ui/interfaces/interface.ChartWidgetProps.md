---
title: ChartWidgetProps
---

# Interface ChartWidgetProps

Props for the [ChartWidget](../chart-utilities/function.ChartWidget.md) component

## Properties

### Data

#### dataSource

> **dataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Data source the query is run against - e.g. `Sample ECommerce`

If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.

***

#### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md)

Filters that will slice query results

***

#### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Highlight filters that will highlight results that pass filter criteria

### Chart

#### chartType

> **chartType**: [`ChartType`](../type-aliases/type-alias.ChartType.md)

Default chart type of each series

***

#### dataOptions

> **dataOptions**: [`ChartDataOptions`](../type-aliases/type-alias.ChartDataOptions.md)

Configurations for how to interpret and present the data passed to the chart

### Widget

#### description

> **description**?: `string`

Description of the widget

***

#### drilldownOptions

> **drilldownOptions**?: [`DrilldownOptions`](../type-aliases/type-alias.DrilldownOptions.md)

List of categories to allow drilldowns on

***

#### highlightSelectionDisabled

> **highlightSelectionDisabled**?: `boolean`

Boolean flag whether selecting data points triggers highlight filter of the selected data

Recommended to turn on when the Chart Widget component is enhanced with data drilldown by the Drilldown Widget component

If not specified, the default value is `false`

***

#### styleOptions

> **styleOptions**?: [`ChartWidgetStyleOptions`](../type-aliases/type-alias.ChartWidgetStyleOptions.md)

Style options for both the chart and widget including the widget header

***

#### title

> **title**?: `string`

Title of the widget

### Callbacks

#### onBeforeRender

> **onBeforeRender**?: [`BeforeRenderHandler`](../type-aliases/type-alias.BeforeRenderHandler.md)

A callback that allows you to customize the underlying chart element before it is rendered.
Use the `highchartsOptions` object that is passed to the callback to change
[options values](https://api.highcharts.com/highcharts/) and then return the modified options
object. The returned options are then used when rendering the chart.

This callback is not supported for Indicator Chart, Areamap Chart, and Scattermap Chart.

For an example of how the `onBeforeRender` callback can be used, see the
[Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#callbacks).

***

#### onDataPointClick

> **onDataPointClick**?: [`ScattermapDataPointEventHandler`](../type-aliases/type-alias.ScattermapDataPointEventHandler.md) \| [`AreamapDataPointEventHandler`](../type-aliases/type-alias.AreamapDataPointEventHandler.md) \| [`DataPointEventHandler`](../type-aliases/type-alias.DataPointEventHandler.md) \| [`ScatterDataPointEventHandler`](../type-aliases/type-alias.ScatterDataPointEventHandler.md) \| [`BoxplotDataPointEventHandler`](../type-aliases/type-alias.BoxplotDataPointEventHandler.md)

Click handler callback for a data point

***

#### onDataPointContextMenu

> **onDataPointContextMenu**?: [`DataPointEventHandler`](../type-aliases/type-alias.DataPointEventHandler.md) \| [`ScatterDataPointEventHandler`](../type-aliases/type-alias.ScatterDataPointEventHandler.md) \| [`BoxplotDataPointEventHandler`](../type-aliases/type-alias.BoxplotDataPointEventHandler.md)

Context menu handler callback for a data point

***

#### onDataPointsSelected

> **onDataPointsSelected**?: [`DataPointsEventHandler`](../type-aliases/type-alias.DataPointsEventHandler.md) \| [`ScatterDataPointsEventHandler`](../type-aliases/type-alias.ScatterDataPointsEventHandler.md)

Handler callback for selection of multiple data points
