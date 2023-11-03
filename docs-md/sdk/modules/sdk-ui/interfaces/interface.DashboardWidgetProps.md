---
title: DashboardWidgetProps
---

# Interface DashboardWidgetProps

Props for the [DashboardWidget](../functions/function.DashboardWidget.md) component

## Extends

- `Omit`\< [`ChartWidgetProps`](interface.ChartWidgetProps.md), `"dataSource"` \| `"dataOptions"` \| `"chartType"` \| `"styleOptions"` \>.`BaseChartEventProps`

## Properties

### Data

#### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Filters that will slice query results

Provided filters will be merged with the existing filters from the widget configuration.

##### Overrides

Omit.filters

***

#### filtersMergeStrategy

> **filtersMergeStrategy**?: `"widgetFirst"` \| `"codeFirst"` \| `"codeOnly"`

Strategy for merging the existing widget filters with the filters provided via the `filters` prop:

- `widgetFirst` - prioritizes the widget filters over the provided filters in case of filter conflicts by certain attributes.
- `codeFirst` - prioritizes the provided filters over the widget filters in case of filter conflicts by certain attributes.
- `codeOnly` - applies only the provided filters and completely ignores the widget filters.

If not specified, the default strategy is `codeFirst`.

***

#### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Highlight filters that will highlight results that pass filter criteria

##### Overrides

Omit.highlights

### Widget

#### dashboardOid

> **dashboardOid**: `string`

Identifier of the dashboard that contains the widget

***

#### description

> **description**?: `string`

Description of the widget

If not specified, it takes the existing value from the widget configuration.

##### Overrides

Omit.description

***

#### highlightSelectionDisabled

> **highlightSelectionDisabled**?: `boolean`

Boolean flag whether selecting data points triggers highlight filter of the selected data

Recommended to turn on when the ChartWidget is enhanced with data drilldown by [DrilldownWidget](../functions/function.DrilldownWidget.md)

If not specified, the default value is `false`

##### Inherited from

Omit.highlightSelectionDisabled

***

#### styleOptions

> **styleOptions**?: `object`

General style options for the visual component of the widget – for example, chart or table.

##### Type declaration

> ###### `styleOptions.height`
>
> **height**?: `number`
>
> Total height of the component, which is considered in the following order of priority:
>
> 1. Value passed to this property (in pixels).
> 2. Height of the container wrapping this component
> 3. Default value as specified per chart type
>
> ###### `styleOptions.width`
>
> **width**?: `number`
>
> Total width of the component, which is considered in the following order of priority:
>
> 1. Value passed to this property (in pixels)
> 2. Width of the container wrapping this component
> 3. Default value as specified per chart type
>
>

***

#### title

> **title**?: `string`

Title of the widget

If not specified, it takes the existing value from the widget configuration.

##### Overrides

Omit.title

***

#### widgetOid

> **widgetOid**: `string`

Identifier of the widget

***

#### widgetStyleOptions

> **widgetStyleOptions**?: [`WidgetStyleOptions`](interface.WidgetStyleOptions.md)

Style options for the widget container including the widget header

##### Overrides

Omit.widgetStyleOptions

### Callbacks

#### onBeforeRender

> **onBeforeRender**?: [`BeforeRenderHandler`](../type-aliases/type-alias.BeforeRenderHandler.md)

Before render handler callback that allows adjusting
detail chart options prior to render

This callback is not yet supported for [IndicatorChart](../functions/function.IndicatorChart.md)

##### Inherited from

Omit.onBeforeRender

***

#### onDataPointClick

> **onDataPointClick**?: [`DataPointEventHandler`](../type-aliases/type-alias.DataPointEventHandler.md) \| [`ScatterDataPointEventHandler`](../type-aliases/type-alias.ScatterDataPointEventHandler.md)

Click handler callback for a data point

##### Inherited from

Omit.onDataPointClick

***

#### onDataPointContextMenu

> **onDataPointContextMenu**?: [`DataPointEventHandler`](../type-aliases/type-alias.DataPointEventHandler.md) \| [`ScatterDataPointEventHandler`](../type-aliases/type-alias.ScatterDataPointEventHandler.md)

Context menu handler callback for a data point

##### Inherited from

Omit.onDataPointContextMenu

***

#### onDataPointsSelected

> **onDataPointsSelected**?: [`DataPointsEventHandler`](../type-aliases/type-alias.DataPointsEventHandler.md) \| [`ScatterDataPointsEventHandler`](../type-aliases/type-alias.ScatterDataPointsEventHandler.md)

Handler callback for selection of multiple data points

##### Inherited from

Omit.onDataPointsSelected
