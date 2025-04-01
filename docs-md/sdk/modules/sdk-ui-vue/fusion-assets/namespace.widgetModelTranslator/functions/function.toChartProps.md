---
title: toChartProps
---

# Function toChartProps

> **toChartProps**(`widgetModel`): [`ChartProps`](../../../interfaces/interface.ChartProps.md)

Translates a [WidgetModel](../../interface.WidgetModel.md) to the props for rendering a chart.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../interface.WidgetModel.md) |

## Returns

[`ChartProps`](../../../interfaces/interface.ChartProps.md)

## Example

```vue
<script setup lang="ts">
import { widgetModelTranslator, useGetWidgetModel, Chart } from '@sisense/sdk-ui-vue';
import { computed } from 'vue';

const { data: widgetModel } = useGetWidgetModel({
 dashboardOid: 'your-dashboard-oid',
 widgetOid: 'your-widget-oid',
});

const chartProps = computed(() =>
 widgetModel.value ? widgetModelTranslator.toChartProps(widgetModel.value) : null,
);
</script>

<template>
 <Chart
   v-if="chartProps"
   :chartType="chartProps.chartType"
   :dataSet="chartProps.dataSet"
   :dataOptions="chartProps.dataOptions"
   :filters="chartProps.filters"
   :highlights="chartProps.highlights"
   :styleOptions="chartProps.styleOptions"
 />
</template>
```

Note: this method is not supported for pivot widgets.
Use [toPivotTableProps](function.toPivotTableProps.md) instead for getting props for the [PivotTable](../../../data-grids/class.PivotTable.md).
