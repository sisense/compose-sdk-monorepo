---
title: ExecuteCsvQueryParams
---

# Interface ExecuteCsvQueryParams

Parameters for useExecuteCsvQuery hook.

## Extends

- [`ExecuteQueryParams`](interface.ExecuteQueryParams.md)

## Properties

### config

> **config**?: [`ExecuteCSVQueryConfig`](../../sdk-ui/type-aliases/type-alias.ExecuteCSVQueryConfig.md)

***

### count

> **count**?: `number`

{@inheritDoc ExecuteQueryProps.count}

#### Inherited from

[`ExecuteQueryParams`](interface.ExecuteQueryParams.md).[`count`](interface.ExecuteQueryParams.md#count)

***

### dataSource

> **dataSource**?: `string`

Data source the query is run against - e.g. `Sample ECommerce`

If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.

#### Inherited from

[`ExecuteQueryParams`](interface.ExecuteQueryParams.md).[`dataSource`](interface.ExecuteQueryParams.md#datasource)

***

### dimensions

> **dimensions**?: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)[]

Dimensions of the query

#### Inherited from

[`ExecuteQueryParams`](interface.ExecuteQueryParams.md).[`dimensions`](interface.ExecuteQueryParams.md#dimensions)

***

### enabled

> **enabled**?: `boolean`

Boolean flag to control if query is executed

If not specified, the default value is `true`

#### Inherited from

[`ExecuteQueryParams`](interface.ExecuteQueryParams.md).[`enabled`](interface.ExecuteQueryParams.md#enabled)

***

### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md)

Filters that will slice query results

#### Inherited from

[`ExecuteQueryParams`](interface.ExecuteQueryParams.md).[`filters`](interface.ExecuteQueryParams.md#filters)

***

### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Highlight filters that will highlight results that pass filter criteria

#### Inherited from

[`ExecuteQueryParams`](interface.ExecuteQueryParams.md).[`highlights`](interface.ExecuteQueryParams.md#highlights)

***

### measures

> **measures**?: [`Measure`](../../sdk-data/interfaces/interface.Measure.md)[]

Measures of the query

#### Inherited from

[`ExecuteQueryParams`](interface.ExecuteQueryParams.md).[`measures`](interface.ExecuteQueryParams.md#measures)

***

### offset

> **offset**?: `number`

{@inheritDoc ExecuteQueryProps.offset}

#### Inherited from

[`ExecuteQueryParams`](interface.ExecuteQueryParams.md).[`offset`](interface.ExecuteQueryParams.md#offset)

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

#### Inherited from

[`ExecuteQueryParams`](interface.ExecuteQueryParams.md).[`onBeforeQuery`](interface.ExecuteQueryParams.md#onbeforequery)
