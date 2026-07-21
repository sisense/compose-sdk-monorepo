---
title: PivotTableWidgetProps
---

# Interface PivotTableWidgetProps

Props for the [PivotTableWidget](../dashboards/function.PivotTableWidget.md) component

## Properties

### Data

#### dataSource

> **dataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Data source the query is run against - e.g. `Sample ECommerce`

If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.

***

#### filters

> **filters**?: [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md) \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Filters that will slice query results

***

#### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Filters that will highlight query results

### Chart

#### dataOptions

> **dataOptions**: [`PivotTableDataOptions`](interface.PivotTableDataOptions.md)

Configurations for how to interpret and present the data passed to the table

### Widget

#### config

> **config**?: [`WidgetConfig`](../type-aliases/type-alias.WidgetConfig.md)

Configuration of the widget

***

#### description

> **description**?: `string`

Description of the widget

***

#### drilldownOptions

> **drilldownOptions**?: [`PivotTableDrilldownOptions`](../type-aliases/type-alias.PivotTableDrilldownOptions.md)

Configuration for the pivot table drilldown

***

#### id

> **id**?: `string`

Widget identifier

Used to identify the widget when exporting its data (for example, the "Download as Excel" action).

***

#### styleOptions

> **styleOptions**?: [`PivotTableWidgetStyleOptions`](../type-aliases/type-alias.PivotTableWidgetStyleOptions.md)

Style options for both the table and widget including the widget header

***

#### title

> **title**?: `string`

Title of the widget

### Callbacks

#### onDataPointClick

> **onDataPointClick**?: [`PivotTableDataPointEventHandler`](../type-aliases/type-alias.PivotTableDataPointEventHandler.md)

Callback function that is called when the pivot table cell is clicked

***

#### onDataPointContextMenu

> **onDataPointContextMenu**?: [`PivotTableDataPointEventHandler`](../type-aliases/type-alias.PivotTableDataPointEventHandler.md)

Callback function that is called when the pivot table cell is right-clicked
