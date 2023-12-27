---
title: ChartWidgetProps
---

# Interface ChartWidgetProps

Props for the [ChartWidget](../functions/function.ChartWidget.md) component

## Extends

- `BaseChartEventProps`

## Properties

### Data

#### dataSource

> **dataSource**?: `string`

Data source the query is run against - e.g. `Sample ECommerce`

If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.

***

#### filterRelations

> **filterRelations**?: [`FilterRelation`](../../sdk-data/interfaces/interface.FilterRelation.md)

Specifies the logical relationship between multiple filters (AND, OR)

***

#### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

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

Before render handler callback that allows adjusting
detail chart options prior to render

This callback is not yet supported for Indicator Chart

##### Inherited from

BaseChartEventProps.onBeforeRender

***

#### onDataPointClick

> **onDataPointClick**?: [`DataPointEventHandler`](../type-aliases/type-alias.DataPointEventHandler.md) \| [`ScatterDataPointEventHandler`](../type-aliases/type-alias.ScatterDataPointEventHandler.md)

Click handler callback for a data point

##### Inherited from

BaseChartEventProps.onDataPointClick

***

#### onDataPointContextMenu

> **onDataPointContextMenu**?: [`DataPointEventHandler`](../type-aliases/type-alias.DataPointEventHandler.md) \| [`ScatterDataPointEventHandler`](../type-aliases/type-alias.ScatterDataPointEventHandler.md)

Context menu handler callback for a data point

##### Inherited from

BaseChartEventProps.onDataPointContextMenu

***

#### onDataPointsSelected

> **onDataPointsSelected**?: [`DataPointsEventHandler`](../type-aliases/type-alias.DataPointsEventHandler.md) \| [`ScatterDataPointsEventHandler`](../type-aliases/type-alias.ScatterDataPointsEventHandler.md)

Handler callback for selection of multiple data points

##### Inherited from

BaseChartEventProps.onDataPointsSelected
