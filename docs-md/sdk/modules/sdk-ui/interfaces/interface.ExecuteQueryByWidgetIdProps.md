---
title: ExecuteQueryByWidgetIdProps
---

# Interface ExecuteQueryByWidgetIdProps

Props for [ExecuteQueryByWidgetId](../fusion-embed/function.ExecuteQueryByWidgetId.md) component.

## Properties

### children

> **children**?: (`queryState`) => `ReactNode`

Function as child component that is called to render the query results

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `queryState` | [`QueryByWidgetIdState`](../type-aliases/type-alias.QueryByWidgetIdState.md) |

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

> **filtersMergeStrategy**?: `"codeFirst"` \| `"codeOnly"` \| `"widgetFirst"`

Strategy for merging the existing widget filters (including highlights) with the filters provided via the `filters` and `highlights` props:

- `widgetFirst` - prioritizes the widget filters over the provided filters in case of filter conflicts by certain attributes.
- `codeFirst` - prioritizes the provided filters over the widget filters in case of filter conflicts by certain attributes.
- `codeOnly` - applies only the provided filters and completely ignores the widget filters.

If not specified, the default strategy is `codeFirst`.

***

### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Highlight filters that will highlight results that pass filter criteria

***

### includeDashboardFilters

> **includeDashboardFilters**?: `boolean`

Boolean flag whether to include dashboard filters in the widget's `filters` and `highlights`

If not specified, the default value is `false`.

***

### offset

> **offset**?: `number`

Offset of the first row to return

If not specified, the default value is `0`

***

### onBeforeQuery

> **onBeforeQuery**?: (`jaql`) => `any`

Sync or async callback that allows to modify the JAQL payload before it is sent to the server.

**Note:** In React, wrap this function in `useCallback` hook to avoid triggering query execution on each render.
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

***

### onDataChanged

> **onDataChanged**?: (`data`, `queryParams`) => `void`

Callback function that is evaluated when query results are ready

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `data` | [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md) |
| `queryParams` | [`ExecuteQueryParams`](interface.ExecuteQueryParams.md) |

#### Returns

`void`

***

### widgetOid

> **widgetOid**: `string`

Identifier of the widget
