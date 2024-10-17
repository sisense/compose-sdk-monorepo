---
title: toPivotTableWidgetProps
---

# Function toPivotTableWidgetProps

> **toPivotTableWidgetProps**(`widgetModel`): [`PivotTableWidgetProps`](../../../../sdk-ui/interfaces/interface.PivotTableWidgetProps.md)

Translates a [WidgetModel](../../../fusion-embed/interface.WidgetModel.md) to the props for rendering a pivot table widget.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../../fusion-embed/interface.WidgetModel.md) |

## Returns

[`PivotTableWidgetProps`](../../../../sdk-ui/interfaces/interface.PivotTableWidgetProps.md)

## Example

```ts
<PivotTableWidget {...widgetModelTranslator.toPivotTableWidgetProps(widgetModel)} />
```

Note: this method is not supported for chart or table widgets.
Use [toChartWidgetProps](function.toChartWidgetProps.md) instead for getting props for the `<ChartWidget>`  component.
