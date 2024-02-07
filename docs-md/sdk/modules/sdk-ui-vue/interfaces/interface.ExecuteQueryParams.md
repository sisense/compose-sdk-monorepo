---
title: ExecuteQueryParams
---

# Interface ExecuteQueryParams

Parameters for [useExecuteQuery](../functions/function.useExecuteQuery.md) hook.

## Extended By

- [`ExecuteCsvQueryParams`](interface.ExecuteCsvQueryParams.md)

## Properties

### count

> **count**?: `number`

{@inheritDoc ExecuteQueryProps.count}

***

### dataSource

> **dataSource**?: `string`

Data source the query is run against - e.g. `Sample ECommerce`

If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.

***

### dimensions

> **dimensions**?: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)[]

Dimensions of the query

***

### enabled

> **enabled**?: `boolean`

Boolean flag to control if query is executed

If not specified, the default value is `true`

***

### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md)

Filters that will slice query results

***

### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Highlight filters that will highlight results that pass filter criteria

***

### measures

> **measures**?: [`Measure`](../../sdk-data/interfaces/interface.Measure.md)[]

Measures of the query

***

### offset

> **offset**?: `number`

{@inheritDoc ExecuteQueryProps.offset}

***

### onBeforeQuery

> **onBeforeQuery**?: (`jaql`) => `any`

{@inheritDoc ExecuteQueryProps.onBeforeQuery}

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `jaql` | `any` |

#### Returns

`any`
