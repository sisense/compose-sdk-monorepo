---
title: UseGetNlgQueryResultParams
---

# Interface UseGetNlgQueryResultParams

Parameters for [useGetNlgQueryResult](../functions/function.useGetNlgQueryResult.md) hook.

## Properties

### dataSource

> **dataSource**: `string`

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

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Filters of the query

***

### measures

> **measures**?: [`Measure`](../../sdk-data/interfaces/interface.Measure.md)[]

Measures of the query
