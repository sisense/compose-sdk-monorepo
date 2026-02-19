---
title: ExecuteCustomWidgetQueryParams
---

# Interface ExecuteCustomWidgetQueryParams

Parameters for executing a query for a custom widget.

## Properties

### count

> **count**?: `number`

Number of rows to return in the query result

If not specified, the default value is `20000`

***

### dataOptions

> **dataOptions**: [`GenericDataOptions`](../type-aliases/type-alias.GenericDataOptions.md)

Data options defining dimensions and measures

***

### dataSource

> **dataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Data source for the query

***

### enabled

> **enabled**?: `boolean`

Boolean flag to control if the hook is executed

If not specified, the default value is `true`

***

### filters

> **filters**?: [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md) \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Filters to apply to the query

***

### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Highlight filters

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

### ungroup

> **ungroup**?: `boolean`

Boolean flag whether to include `ungroup: true` in non-aggregated JAQL queries.

This improves computation and performance of querying tables when no aggregation is needed

If not specified, the default value is `false`
