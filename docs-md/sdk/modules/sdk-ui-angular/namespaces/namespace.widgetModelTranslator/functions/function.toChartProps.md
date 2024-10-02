---
title: toChartProps
---

# Function toChartProps

> **toChartProps**(`widgetModel`): [`ChartProps`](../../../../sdk-ui/interfaces/interface.ChartProps.md)

Translates a [WidgetModel](../../../fusion-embed/interface.WidgetModel.md) to the props for rendering a chart.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../../fusion-embed/interface.WidgetModel.md) |

## Returns

[`ChartProps`](../../../../sdk-ui/interfaces/interface.ChartProps.md)

## Example

```ts
<Chart {...widgetModelTranslator.toChartProps(widgetModel)} />
```

Note: this method is not supported for pivot widgets.
Use [toPivotTableProps](function.toPivotTableProps.md) instead for getting props for the `<PivotTable>`  component.
