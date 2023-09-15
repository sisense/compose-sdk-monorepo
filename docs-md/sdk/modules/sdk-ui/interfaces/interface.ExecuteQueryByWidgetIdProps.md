---
title: ExecuteQueryByWidgetIdProps
---

# Interface ExecuteQueryByWidgetIdProps

Props for [ExecuteQueryByWidgetId](../functions/function.ExecuteQueryByWidgetId.md) component.

## Properties

### children

> **children**?: (`queryResult`, `queryParams`) => `ReactNode`

Function as child component that is called to render the query results

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `queryResult` | [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md) |
| `queryParams` | [`ExecuteQueryParams`](../type-aliases/type-alias.ExecuteQueryParams.md) |

#### Returns

`ReactNode`

***

### dashboardOid

> **dashboardOid**: `string`

Identifier of the dashboard that contains the widget

***

### onDataChanged

> **onDataChanged**?: (`data`, `queryParams`) => `void`

Callback function that is evaluated when query results are ready

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `data` | [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md) |
| `queryParams` | [`ExecuteQueryParams`](../type-aliases/type-alias.ExecuteQueryParams.md) |

#### Returns

`void`

***

### widgetOid

> **widgetOid**: `string`

Identifier of the widget
