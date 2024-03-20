---
title: UseGetNlgQueryResultParams
---

# Interface UseGetNlgQueryResultParams

Parameters for [useGetNlgQueryResult](../generative-ai/function.useGetNlgQueryResult.md) hook.

## Properties

### dataSource

> **dataSource**: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

The data source that the query targets - e.g. `Sample ECommerce`

***

### dimensions

> **dimensions**?: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)[]

Dimensions of the query

***

### enabled

> **enabled**?: `boolean`

Boolean flag to enable/disable API call by default

If not specified, the default value is `true`

***

### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md)

Filters of the query

***

### measures

> **measures**?: [`Measure`](../../sdk-data/interfaces/interface.Measure.md)[]

Measures of the query
