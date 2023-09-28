---
title: ExecuteQueryByWidgetIdParams
---

# Interface ExecuteQueryByWidgetIdParams

Parameters for [useExecuteQueryByWidgetId](../functions/function.useExecuteQueryByWidgetId.md) hook.

## Properties

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

### widgetOid

> **widgetOid**: `string`

Identifier of the widget
