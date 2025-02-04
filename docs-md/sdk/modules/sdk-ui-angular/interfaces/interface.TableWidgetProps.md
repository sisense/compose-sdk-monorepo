---
title: TableWidgetProps
---

# Interface TableWidgetProps

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

### Chart

#### dataOptions

> **dataOptions**: [`TableDataOptions`](interface.TableDataOptions.md)

Configurations for how to interpret and present the data passed to the table

### Widget

#### bottomSlot

> **bottomSlot**?: `ReactNode`

React nodes to be rendered at the bottom of component, after the table

***

#### description

> **description**?: `string`

Description of the widget

***

#### styleOptions

> **styleOptions**?: `TableWidgetStyleOptions`

Style options for both the table and widget including the widget header

***

#### title

> **title**?: `string`

Title of the widget

***

#### topSlot

> **topSlot**?: `ReactNode`

React nodes to be rendered at the top of component, before the table
