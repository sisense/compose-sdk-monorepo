---
title: ExecuteQueryByWidgetIdParams
---

# Interface ExecuteQueryByWidgetIdParams

Parameters for data query by widget id execution.

## Extends

- `Omit`\< [`ExecuteQueryByWidgetIdParams`](../../sdk-ui/interfaces/interface.ExecuteQueryByWidgetIdParams.md), `"enabled"` \>

## Properties

### count

> **count**?: `number`

Number of rows to return in the query result

If not specified, the default value is `20000`

#### Inherited from

Omit.count

***

### dashboardOid

> **dashboardOid**: `string`

Identifier of the dashboard that contains the widget

#### Inherited from

Omit.dashboardOid

***

### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Filters that will slice query results.

The provided filters will be merged with the existing widget filters based on `filtersMergeStrategy`

#### Inherited from

Omit.filters

***

### filtersMergeStrategy

> **filtersMergeStrategy**?: `"widgetFirst"` \| `"codeFirst"` \| `"codeOnly"`

Strategy for merging the existing widget filters (including highlights) with the filters provided via the `filters` and `highlights` props:

- `widgetFirst` - prioritizes the widget filters over the provided filters in case of filter conflicts by certain attributes.
- `codeFirst` - prioritizes the provided filters over the widget filters in case of filter conflicts by certain attributes.
- `codeOnly` - applies only the provided filters and completely ignores the widget filters.

If not specified, the default strategy is `codeFirst`.

#### Inherited from

Omit.filtersMergeStrategy

***

### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Highlight filters that will highlight results that pass filter criteria

#### Inherited from

Omit.highlights

***

### includeDashboardFilters

> **includeDashboardFilters**?: `boolean`

Boolean flag whether to include dashboard filters in the widget's `filters` and `highlights`

If not specified, the default value is `false`.

#### Inherited from

Omit.includeDashboardFilters

***

### offset

> **offset**?: `number`

Offset of the first row to return

If not specified, the default value is `0`

#### Inherited from

Omit.offset

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

#### Inherited from

Omit.onBeforeQuery

***

### widgetOid

> **widgetOid**: `string`

Identifier of the widget

#### Inherited from

Omit.widgetOid
