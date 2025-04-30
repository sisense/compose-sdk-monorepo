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

```vue
<script setup lang="ts">
import { widgetModelTranslator, useGetWidgetModel } from '@sisense/sdk-ui-vue';
import { computed } from 'vue';

const { data: widgetModel } = useGetWidgetModel({
 dashboardOid: 'your-dashboard-oid',
 widgetOid: 'your-widget-oid',
});

const textWidgetProps = computed(() =>
 widgetModel.value ? widgetModelTranslator.toTextWidgetProps(widgetModel.value) : null,
);
</script>
```

Note: this method is not supported for chart or pivot widgets.
Use [toChartWidgetProps](function.toChartWidgetProps.md) instead for getting props for the [ChartWidget](../../../dashboards/class.ChartWidget.md).
Use [toPivotTableWidgetProps](function.toPivotTableWidgetProps.md) instead for getting props for the pivot table widget.
