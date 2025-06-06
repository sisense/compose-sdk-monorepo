---
title: DashboardProps
---

# Interface DashboardProps

Props of the [`Dashboard`](../dashboards/class.Dashboard.md) component.

## Properties

### config

> **config**?: [`DashboardConfig`](interface.DashboardConfig.md)

The configuration for the dashboard

***

### defaultDataSource

> **defaultDataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

The default data source to use for the dashboard

***

### filters

> **filters**?: [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md) \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

The dashboard filters to be applied to each of the widgets based on the widget filter options

***

### layoutOptions

> **layoutOptions**?: [`DashboardLayoutOptions`](interface.DashboardLayoutOptions.md)

Dashboard layout options

***

### styleOptions

> **styleOptions**?: [`DashboardStyleOptions`](../../sdk-ui/type-aliases/type-alias.DashboardStyleOptions.md)

The style options for the dashboard

***

### title

> **title**?: `string`

The title of the dashboard

***

### widgets

> **widgets**: [`WidgetProps`](../type-aliases/type-alias.WidgetProps.md)[]

The widgets to render in the dashboard

***

### widgetsOptions

> **widgetsOptions**?: [`WidgetsOptions`](../type-aliases/type-alias.WidgetsOptions.md)

The options for each of the widgets
