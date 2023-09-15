---
title: ExecuteQueryProps
---

# Interface ExecuteQueryProps

Props for [ExecuteQuery](../functions/function.ExecuteQuery.md) component.

## Properties

### children

> **children**?: (`queryResult`) => `ReactNode`

Function as child component that is called to render the query results

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `queryResult` | [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md) |

#### Returns

`ReactNode`

***

### dataSource

> **dataSource**?: `string`

Data source the query is run against - e.g. `Sample ECommerce`

If not specified, the query will use the `defaultDataSource` specified in the parent [SisenseContextProvider](../functions/function.SisenseContextProvider.md) component.

***

### dimensions

> **dimensions**?: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)[]

Dimensions of the query

***

### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

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

### onDataChanged

> **onDataChanged**?: (`data`) => `void`

Callback function that is evaluated when query results are ready

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `data` | [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md) |

#### Returns

`void`
