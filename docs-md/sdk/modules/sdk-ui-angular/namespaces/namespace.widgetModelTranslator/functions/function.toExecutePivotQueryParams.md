---
title: toExecutePivotQueryParams
---

# Function toExecutePivotQueryParams

> **toExecutePivotQueryParams**(`widgetModel`): [`ExecutePivotQueryParams`](../../../../sdk-ui/interfaces/interface.ExecutePivotQueryParams.md)

Translates a [WidgetModel](../../../fusion-embed/interface.WidgetModel.md) to the parameters for executing a query for the pivot widget.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../../fusion-embed/interface.WidgetModel.md) |

## Returns

[`ExecutePivotQueryParams`](../../../../sdk-ui/interfaces/interface.ExecutePivotQueryParams.md)

## Example

```ts
const {data, isLoading, isError} = useExecutePivotQuery(widgetModelTranslator.toExecutePivotQueryParams(widgetModel));
```

Note: this method is supported only for getting pivot query.
Use [toExecuteQueryParams](function.toExecuteQueryParams.md) instead for getting query parameters for non-pivot widgets.
