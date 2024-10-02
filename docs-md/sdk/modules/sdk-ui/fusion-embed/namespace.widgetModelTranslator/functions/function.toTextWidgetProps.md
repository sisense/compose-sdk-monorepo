---
title: toTextWidgetProps
---

# Function toTextWidgetProps

> **toTextWidgetProps**(`widgetModel`): [`TextWidgetProps`](../../../interfaces/interface.TextWidgetProps.md)

Translates a [WidgetModel](../../interface.WidgetModel.md) to the props for rendering a text widget.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../interface.WidgetModel.md) |

## Returns

[`TextWidgetProps`](../../../interfaces/interface.TextWidgetProps.md)

## Example

```ts
<TextWidget {...widgetModelTranslator.toTextWidgetProps(widgetModel)} />
```

Note: this method is not supported for chart or pivot widgets.
Use [toChartWidgetProps](function.toChartWidgetProps.md) instead for getting props for the `<ChartWidget>`  component.
Use [toPivotTableWidgetProps](function.toPivotTableWidgetProps.md) instead for getting props for the `<PivotTableWidget>`  component.
