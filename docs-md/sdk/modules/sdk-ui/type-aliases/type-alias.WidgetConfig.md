---
title: WidgetConfig
---

# Type alias WidgetConfig

> **WidgetConfig**: [`ChartWidgetConfig`](../interfaces/interface.ChartWidgetConfig.md) \| [`CustomWidgetConfig`](../interfaces/interface.CustomWidgetConfig.md) \| [`FilterWidgetConfig`](../interfaces/interface.FilterWidgetConfig.md) \| [`PivotTableWidgetConfig`](../interfaces/interface.PivotTableWidgetConfig.md) \| [`TextWidgetConfig`](../interfaces/interface.TextWidgetConfig.md)

Configuration of a widget — the union of every widget-type-specific configuration.

Used where the widget type is not known statically, for example [WidgetModel.config](../fusion-assets/interface.WidgetModel.md#config). When
the widget type is known, prefer that widget's own configuration type, which lists only the
options the widget supports.
