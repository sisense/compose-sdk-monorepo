---
title: ExecuteQueryParams
---

# Type alias ExecuteQueryParams

> **ExecuteQueryParams**: `object`

Parameters for [useExecuteQuery](../functions/function.useExecuteQuery.md) hook.

## Type declaration

### `count`

**count**?: `number`

Number of rows to return in the query result

If not specified, the default value is `20000`

***

### `dataSource`

**dataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Data source the query is run against - e.g. `Sample ECommerce`

If not specified, the query will use the `defaultDataSource` specified in the parent [SisenseContextProvider](../functions/function.SisenseContextProvider.md) component.

***

### `dimensions`

**dimensions**?: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)[]

Dimensions of the query

***

### `enabled`

**enabled**?: `boolean`

Boolean flag to control if query is executed

If not specified, the default value is `true`

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

***

### `offset`

**offset**?: `number`

Offset of the first row to return

If not specified, the default value is `0`
