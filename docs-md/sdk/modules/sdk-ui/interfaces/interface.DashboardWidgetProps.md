---
title: DashboardWidgetProps
---

# Interface DashboardWidgetProps

Props for the [DashboardWidget](../functions/function.DashboardWidget.md) component

## Extends

- `Omit`\< [`ChartWidgetProps`](interface.ChartWidgetProps.md), `"dataSource"` \| `"dataOptions"` \| `"chartType"` \| `"styleOptions"` \>

## Properties

### Data

#### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Filters that will slice query results

Provided filters will be merged with the existing filters from the widget configuration.

##### Overrides

Omit.filters

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
