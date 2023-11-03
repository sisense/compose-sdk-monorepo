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

If not specified, the query will use the `defaultDataSource` specified in the parent [SisenseContextProvider](../functions/function.SisenseContextProvider.md) component.

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

***

#### styleOptions

> **styleOptions**?: [`StyleOptions`](../type-aliases/type-alias.StyleOptions.md)

Style options union across chart types

### Widget

#### description

> **description**?: `string`

Description of the widget

***

#### drilldownOptions

> **drilldownOptions**?: [`DrilldownOptions`](../type-aliases/type-alias.DrilldownOptions.md)

List of categories to allow drilldowns on

::: warning Deprecated
Use [DrilldownWidget](../functions/function.DrilldownWidget.md) instead
:::

***

#### highlightSelectionDisabled

> **highlightSelectionDisabled**?: `boolean`

Boolean flag whether selecting data points triggers highlight filter of the selected data

Recommended to turn on when the ChartWidget is enhanced with data drilldown by [DrilldownWidget](../functions/function.DrilldownWidget.md)

If not specified, the default value is `false`

***

#### title

> **title**?: `string`

Title of the widget

***

#### widgetStyleOptions

> **widgetStyleOptions**?: [`WidgetStyleOptions`](interface.WidgetStyleOptions.md)

Style options for both the widget as a whole and specifically for the widget header

### Callbacks

#### onBeforeRender

> **onBeforeRender**?: [`BeforeRenderHandler`](../type-aliases/type-alias.BeforeRenderHandler.md)

Before render handler callback that allows adjusting
detail chart options prior to render

This callback is not yet supported for [IndicatorChart](../functions/function.IndicatorChart.md)

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
