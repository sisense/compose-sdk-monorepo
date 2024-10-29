---
title: toChartWidgetProps
---

# Function toChartWidgetProps

> **toChartWidgetProps**(`widgetModel`): [`ChartWidgetProps`](../../../../sdk-ui/interfaces/interface.ChartWidgetProps.md)

Translates a [WidgetModel](../../../fusion-assets/interface.WidgetModel.md) to the props for rendering a chart widget.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../../fusion-assets/interface.WidgetModel.md) |

## Returns

[`ChartWidgetProps`](../../../../sdk-ui/interfaces/interface.ChartWidgetProps.md)

## Example

```ts
<ChartWidget {...widgetModelTranslator.toChartWidgetProps(widgetModel)} />
```

Note: this method is not supported for pivot widgets.
