---
title: ExecuteQueryParams
---

# Type alias ExecuteQueryParams

> **ExecuteQueryParams**: `object`

Parameters for [useExecuteQuery](../functions/function.useExecuteQuery.md) hook.

## Type declaration

### `dataSource`

**dataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Data source the query is run against - e.g. `Sample ECommerce`

If not specified, the query will use the `defaultDataSource` specified in the parent [SisenseContextProvider](../functions/function.SisenseContextProvider.md) component.

***

### `dimensions`

**dimensions**?: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)[]

Dimensions of the query

***

### `filters`

**filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Filters that will slice query results

***

### `highlights`

**highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Highlight filters that will highlight results that pass filter criteria

***

### `measures`

**measures**?: [`Measure`](../../sdk-data/interfaces/interface.Measure.md)[]

Measures of the query
