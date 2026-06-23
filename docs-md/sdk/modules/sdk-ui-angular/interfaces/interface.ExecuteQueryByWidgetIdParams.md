---
title: ExecuteQueryByWidgetIdParams
---

# Interface ExecuteQueryByWidgetIdParams

Parameters for data query by widget id execution.

## Properties

### beforeQuery

> **beforeQuery**?: (`jaql`) => `any`

Sync or async callback that allows to modify the JAQL payload before it is sent to the server.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `jaql` | `any` |

#### Returns

`any`

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

Highlight filters that will highlight results that pass filter criteria.

NOTE that highlight filters in the "Include all" state are silently omitted from the
query. To clear a highlight, remove it from the array.

***

### includeDashboardFilters

> **includeDashboardFilters**?: `boolean`

Boolean flag whether to include dashboard filters in the widget's `filters` and `highlights`

If not specified, the default value is `false`.

***

### includeRowCount <Badge type="beta" text="Beta" />

> **includeRowCount**?: `boolean`

Boolean flag whether to include the total row count of the query result,
ignoring the `count` and `offset` paging.

When enabled, the total is returned as `rowCount` in the query state
(QueryByWidgetIdState.rowCount) and is reused for subsequent pages of the same query.

Row count feature requires a Sisense instance version of 2026.3.0 or greater.
On older versions, the query still succeeds and `rowCount` stays `undefined`.

Not supported for pivot table widgets.

If not specified, the default value is `false`

***

### offset

> **offset**?: `number`

Offset of the first row to return

If not specified, the default value is `0`

***

### widgetOid

> **widgetOid**: `string`

Identifier of the widget
