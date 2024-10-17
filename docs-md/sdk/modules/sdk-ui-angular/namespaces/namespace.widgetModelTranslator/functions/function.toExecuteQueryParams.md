---
title: toExecuteQueryParams
---

# Function toExecuteQueryParams

> **toExecuteQueryParams**(`widgetModel`): [`ExecuteQueryParams`](../../../../sdk-ui/interfaces/interface.ExecuteQueryParams.md)

Translates a [WidgetModel](../../../fusion-embed/interface.WidgetModel.md) to the parameters for executing a query for the widget.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../../fusion-embed/interface.WidgetModel.md) |

## Returns

[`ExecuteQueryParams`](../../../../sdk-ui/interfaces/interface.ExecuteQueryParams.md)

## Example

```ts
const {data, isLoading, isError} = useExecuteQuery(widgetModelTranslator.toExecuteQueryParams(widgetModel));
```

Note: this method is not supported for getting pivot query.
Use [toExecutePivotQueryParams](function.toExecutePivotQueryParams.md) instead for getting query parameters for the pivot widget.