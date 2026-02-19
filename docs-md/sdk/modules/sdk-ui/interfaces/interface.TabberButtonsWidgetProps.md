---
title: TabberButtonsWidgetProps
---

# Interface TabberButtonsWidgetProps

Props for tabbers buttons widget in a dashboard.

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

### Widget

#### title

> **title**?: `string`

Title of the widget

### Callbacks

#### onDataPointClick

> **onDataPointClick**?: [`CustomWidgetDataPointEventHandler`](../type-aliases/type-alias.CustomWidgetDataPointEventHandler.md)\< [`AbstractDataPointWithEntries`](../type-aliases/type-alias.AbstractDataPointWithEntries.md) \>

Click handler callback for a data point

***

#### onDataPointContextMenu

> **onDataPointContextMenu**?: [`CustomWidgetDataPointContextMenuHandler`](../type-aliases/type-alias.CustomWidgetDataPointContextMenuHandler.md)\< [`AbstractDataPointWithEntries`](../type-aliases/type-alias.AbstractDataPointWithEntries.md) \>

Context menu handler callback for a data point

***

#### onDataPointsSelected

> **onDataPointsSelected**?: [`CustomWidgetDataPointsEventHandler`](../type-aliases/type-alias.CustomWidgetDataPointsEventHandler.md)\< [`AbstractDataPointWithEntries`](../type-aliases/type-alias.AbstractDataPointWithEntries.md) \>

Handler callback for selection of multiple data points

### Other

#### customOptions

> **customOptions**: [`TabberButtonsWidgetCustomOptions`](../type-aliases/type-alias.TabberButtonsWidgetCustomOptions.md)

Configuration for tabs including names and active tab index

***

#### customWidgetType

> **customWidgetType**: `"tabber-buttons"`

Custom widget type identifier, always 'tabber-buttons' for tabber widget

***

#### dataOptions

> **dataOptions**: `Record`\< `string`, `never` \>

Data options configuration (empty object for tabber widget as it doesn't require data)

***

#### description

> **description**?: `string`

Description text displayed in the widget

***

#### id

> **id**: `string`

Unique identifier for the widget

***

#### styleOptions

> **styleOptions**?: [`TabberButtonsWidgetStyleOptions`](../type-aliases/type-alias.TabberButtonsWidgetStyleOptions.md)

Style configuration options for the tabber buttons widget

***

#### widgetType

> **widgetType**: `"custom"`

Widget type identifier, always 'custom' for tabber widget
