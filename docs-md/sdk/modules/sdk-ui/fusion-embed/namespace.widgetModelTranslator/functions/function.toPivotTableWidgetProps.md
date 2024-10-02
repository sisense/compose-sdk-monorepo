---
title: toPivotTableWidgetProps
---

# Function toPivotTableWidgetProps

> **toPivotTableWidgetProps**(`widgetModel`): [`PivotTableWidgetProps`](../../../interfaces/interface.PivotTableWidgetProps.md)

Translates a [WidgetModel](../../interface.WidgetModel.md) to the props for rendering a pivot table widget.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../interface.WidgetModel.md) |

## Returns

[`PivotTableWidgetProps`](../../../interfaces/interface.PivotTableWidgetProps.md)

## Example

```ts
<PivotTableWidget {...widgetModelTranslator.toPivotTableWidgetProps(widgetModel)} />
```

Note: this method is not supported for chart or table widgets.
Use [toChartWidgetProps](function.toChartWidgetProps.md) instead for getting props for the `<ChartWidget>`  component.
Use toTableWidgetProps instead for getting props for the `<TableWidget>`  component.
