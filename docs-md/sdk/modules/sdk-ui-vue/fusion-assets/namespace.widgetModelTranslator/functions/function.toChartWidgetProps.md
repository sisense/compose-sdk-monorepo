---
title: toChartWidgetProps
---

# Function toChartWidgetProps

> **toChartWidgetProps**(`widgetModel`): [`ChartWidgetProps`](../../../interfaces/interface.ChartWidgetProps.md)

Translates a [WidgetModel](../../interface.WidgetModel.md) to the props for rendering a chart widget.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../interface.WidgetModel.md) |

## Returns

[`ChartWidgetProps`](../../../interfaces/interface.ChartWidgetProps.md)

## Example

```vue
<script setup lang="ts">
import { widgetModelTranslator, useGetWidgetModel, ChartWidget } from '@sisense/sdk-ui-vue';
import { computed } from 'vue';

const { data: widgetModel } = useGetWidgetModel({
 dashboardOid: 'your-dashboard-oid',
 widgetOid: 'your-widget-oid',
});

const chartWidgetProps = computed(() =>
 widgetModel.value ? widgetModelTranslator.toChartWidgetProps(widgetModel.value) : null,
);
</script>

<template>
 <ChartWidget
   v-if="chartWidgetProps"
   :chartType="chartWidgetProps.chartType"
   :dataSource="chartWidgetProps.dataSource"
   :dataOptions="chartWidgetProps.dataOptions"
   :filters="chartWidgetProps.filters"
   :highlights="chartWidgetProps.highlights"
   :styleOptions="chartWidgetProps.styleOptions"
 />
</template>
```

Note: this method is not supported for pivot widgets.
