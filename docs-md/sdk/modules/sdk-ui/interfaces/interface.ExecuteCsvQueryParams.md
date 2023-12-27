---
title: ExecuteCsvQueryParams
---

# Interface ExecuteCsvQueryParams

Parameters for [useExecuteCsvQuery](../functions/function.useExecuteCsvQuery.md) hook.

## Extends

- [`ExecuteQueryParams`](interface.ExecuteQueryParams.md)

## Properties

### config

> **config**?: [`ExecuteCSVQueryConfig`](../type-aliases/type-alias.ExecuteCSVQueryConfig.md)

***

### count

> **count**?: `number`

Number of rows to return in the query result

If not specified, the default value is `20000`

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

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| [`FilterRelation`](../../sdk-data/interfaces/interface.FilterRelation.md)

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

Offset of the first row to return

If not specified, the default value is `0`

#### Inherited from

[`ExecuteQueryParams`](interface.ExecuteQueryParams.md).[`offset`](interface.ExecuteQueryParams.md#offset)

***

### onBeforeQuery

> **onBeforeQuery**?: (`jaql`) => `any`

Sync or async callback that allows to modify the JAQL payload before it is sent to the server.

**Note:** wrap this function in `useCallback` hook to avoid triggering query execution on each render.
```ts
const onBeforeQuery = useCallback((jaql) => {
  // modify jaql here
  return jaql;
}, []);
```

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `jaql` | `any` |

#### Returns

`any`

#### Inherited from

[`ExecuteQueryParams`](interface.ExecuteQueryParams.md).[`onBeforeQuery`](interface.ExecuteQueryParams.md#onbeforequery)
