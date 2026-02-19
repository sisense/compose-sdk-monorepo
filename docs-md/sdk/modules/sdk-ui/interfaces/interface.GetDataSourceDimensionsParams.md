---
title: GetDataSourceDimensionsParams
---

# Interface GetDataSourceDimensionsParams

Parameters for [useGetDataSourceDimensions](../functions/function.useGetDataSourceDimensions.md) hook.

## Properties

### count

> **count**?: `number`

The number of items to return

***

### dataSource

> **dataSource**: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md) \| `undefined`

The data source to get the dimensions for. If no data source is provided, the default data source will be used.

***

### enabled

> **enabled**?: `boolean`

Whether the query should be enabled.

***

### offset

> **offset**?: `number`

The offset for pagination

***

### searchValue

> **searchValue**?: `string`

The search value to filter by
