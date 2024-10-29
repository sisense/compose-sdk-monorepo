---
title: WithWidgetType
---

# Type alias WithWidgetType`<W, T>`

> **WithWidgetType**: <`W`, `T`> `W` & \{
  `widgetType`: `T`;
 }

A utility type that combines widget-specific properties (`W`) with a corresponding widget type (`T`).

This is used to extend the props of a widget with its respective widget type.

> ## `WithWidgetType.widgetType`
>
> **widgetType**: `T`
>
> Widget type
>
>

## Type parameters

| Parameter |
| :------ |
| `W` *extends* [`ChartWidgetProps`](../interfaces/interface.ChartWidgetProps.md) \| [`PivotTableWidgetProps`](../interfaces/interface.PivotTableWidgetProps.md) \| [`PluginWidgetProps`](../interfaces/interface.PluginWidgetProps.md) \| [`TextWidgetProps`](../interfaces/interface.TextWidgetProps.md) |
| `T` *extends* `"chart"` \| `"pivot"` \| `"plugin"` \| `"text"` |
