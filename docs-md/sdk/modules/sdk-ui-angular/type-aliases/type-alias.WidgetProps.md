---
title: WidgetProps
---

# Type alias WidgetProps

> **WidgetProps**: `SoftUnion`\< [`WithCommonWidgetProps`](type-alias.WithCommonWidgetProps.md)\< [`ChartWidgetProps`](../interfaces/interface.ChartWidgetProps.md), `"chart"` \> \| [`WithCommonWidgetProps`](type-alias.WithCommonWidgetProps.md)\< [`CustomWidgetProps`](../../sdk-ui/interfaces/interface.CustomWidgetProps.md), `"custom"` \> \| [`WithCommonWidgetProps`](type-alias.WithCommonWidgetProps.md)\< [`PivotTableWidgetProps`](../interfaces/interface.PivotTableWidgetProps.md), `"pivot"` \> \| [`WithCommonWidgetProps`](type-alias.WithCommonWidgetProps.md)\< [`TextWidgetProps`](../interfaces/interface.TextWidgetProps.md), `"text"` \> \> & \{
  `dataPointClick`: [`WidgetDataPointClickEventHandler`](type-alias.WidgetDataPointClickEventHandler.md);
  `dataPointContextMenu`: [`WidgetDataPointContextMenuEventHandler`](type-alias.WidgetDataPointContextMenuEventHandler.md);
  `dataPointsSelect`: [`ChartDataPointsEventHandler`](type-alias.ChartDataPointsEventHandler.md);
 }

Props of the [WidgetComponent](../dashboards/class.WidgetComponent.md).

> ## `WidgetProps.dataPointClick`
>
> **dataPointClick**?: [`WidgetDataPointClickEventHandler`](type-alias.WidgetDataPointClickEventHandler.md)
>
> ## `WidgetProps.dataPointContextMenu`
>
> **dataPointContextMenu**?: [`WidgetDataPointContextMenuEventHandler`](type-alias.WidgetDataPointContextMenuEventHandler.md)
>
> ## `WidgetProps.dataPointsSelect`
>
> **dataPointsSelect**?: [`ChartDataPointsEventHandler`](type-alias.ChartDataPointsEventHandler.md)
>
>
