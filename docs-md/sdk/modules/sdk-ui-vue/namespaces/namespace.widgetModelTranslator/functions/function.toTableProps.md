---
title: toTableProps
---

# Function toTableProps

> **toTableProps**(`widgetModel`): [`TableProps`](../../../interfaces/interface.TableProps.md)

Translates a [WidgetModel](../../../fusion-embed/interface.WidgetModel.md) to the props for rendering a table.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../../fusion-embed/interface.WidgetModel.md) |

## Returns

[`TableProps`](../../../interfaces/interface.TableProps.md)

## Example

```ts
<Table {...widgetModelTranslator.toTableProps(widgetModel)} />
```

Note: this method is not supported for chart and pivot widgets.
Use [toChartProps](function.toChartProps.md) instead for getting props for the `<Chart>`  component.
Use [toPivotTableProps](function.toPivotTableProps.md) instead for getting props for the `<PivotTable>`  component.