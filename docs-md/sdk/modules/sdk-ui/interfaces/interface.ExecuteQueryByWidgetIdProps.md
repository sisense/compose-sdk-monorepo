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

### count

> **count**?: `number`

Number of rows to return in the query result

If not specified, the default value is `20000`

***

### dashboardOid

> **dashboardOid**: `string`

Identifier of the dashboard that contains the widget

***

### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Filters that will slice query results.

The provided filters will be merged with the existing widget filters based on `filtersMergeStrategy`

***

### filtersMergeStrategy

> **filtersMergeStrategy**?: `"widgetFirst"` \| `"codeFirst"` \| `"codeOnly"`

Strategy for merging the existing widget filters with the filters provided via the `filters` prop:

- `widgetFirst` - prioritizes the widget filters over the provided filters in case of filter conflicts by certain attributes.
- `codeFirst` - prioritizes the provided filters over the widget filters in case of filter conflicts by certain attributes.
- `codeOnly` - applies only the provided filters and completely ignores the widget filters.

If not specified, the default strategy is `widgetFirst`.

***

### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Highlight filters that will highlight results that pass filter criteria

***

### offset

> **offset**?: `number`

Offset of the first row to return

If not specified, the default value is `0`

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
