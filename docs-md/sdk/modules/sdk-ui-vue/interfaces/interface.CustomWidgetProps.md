---
title: CustomWidgetProps
---

# Interface CustomWidgetProps

Props for the Custom Widget component

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

> **dataOptions**: [`GenericDataOptions`](../type-aliases/type-alias.GenericDataOptions.md)

Configurations for how to interpret and present the data passed to the table

### Widget

#### customWidgetType

> **customWidgetType**: `string`

Custom widget type. This is typically the name/ID of the custom widget.

***

#### description

> **description**?: `string`

Description of the widget

***

#### styleOptions

> **styleOptions**?: [`CustomWidgetStyleOptions`](../../sdk-ui/type-aliases/type-alias.CustomWidgetStyleOptions.md)

Style options for the custom widget.

***

#### title

> **title**?: `string`

Title of the widget
