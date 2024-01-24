---
title: ExecuteQueryByWidgetIdParams
---

# Interface ExecuteQueryByWidgetIdParams

Parameters for [useExecuteQueryByWidgetId](../functions/function.useExecuteQueryByWidgetId.md) hook.

## Properties

### count

> **count**?: `number`

{@inheritDoc ExecuteQueryProps.count}

***

### dashboardOid

> **dashboardOid**: `string`

{@inheritDoc ExecuteQueryByWidgetIdProps.dashboardOid}

***

### enabled

> **enabled**?: `boolean`

Boolean flag to control if query is executed

If not specified, the default value is `true`

***

### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

{@inheritDoc ExecuteQueryByWidgetIdProps.filters}

***

### filtersMergeStrategy

> **filtersMergeStrategy**?: `"widgetFirst"` \| `"codeFirst"` \| `"codeOnly"`

{@inheritDoc ExecuteQueryByWidgetIdProps.filtersMergeStrategy}

***

### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

{@inheritDoc ExecuteQueryByWidgetIdProps.highlights}

***

### includeDashboardFilters

> **includeDashboardFilters**?: `boolean`

{@inheritDoc ExecuteQueryByWidgetIdProps.includeDashboardFilters}

***

### offset

> **offset**?: `number`

{@inheritDoc ExecuteQueryProps.offset}

***

### onBeforeQuery

> **onBeforeQuery**?: (`jaql`) => `any`

{@inheritDoc ExecuteQueryByWidgetIdProps.onBeforeQuery}

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `jaql` | `any` |

#### Returns

`any`

***

### widgetOid

> **widgetOid**: `string`

{@inheritDoc ExecuteQueryByWidgetIdProps.widgetOid}
