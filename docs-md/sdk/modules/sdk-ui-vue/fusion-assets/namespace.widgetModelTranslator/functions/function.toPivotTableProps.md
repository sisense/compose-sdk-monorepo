---
title: toPivotTableProps
---

# Function toPivotTableProps

> **toPivotTableProps**(`widgetModel`): [`PivotTableProps`](../../../interfaces/interface.PivotTableProps.md)

Translates a [WidgetModel](../../interface.WidgetModel.md) to the props for rendering a pivot table.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../interface.WidgetModel.md) |

## Returns

[`PivotTableProps`](../../../interfaces/interface.PivotTableProps.md)

## Example

```vue
<script setup lang="ts">
import { widgetModelTranslator, useGetWidgetModel, PivotTable } from '@sisense/sdk-ui-vue';
import { computed } from 'vue';

const { data: widgetModel } = useGetWidgetModel({
 dashboardOid: 'your-dashboard-oid',
 widgetOid: 'your-widget-oid',
});

const pivotTableProps = computed(() =>
 widgetModel.value ? widgetModelTranslator.toPivotTableProps(widgetModel.value) : null,
);
</script>

<template>
 <PivotTable
   v-if="pivotTableProps"
   :dataSet="pivotTableProps.dataSet"
   :dataOptions="pivotTableProps.dataOptions"
   :filters="pivotTableProps.filters"
   :styleOptions="pivotTableProps.styleOptions"
 />
</template>
```

Note: this method is not supported for chart or table widgets.
Use [toChartProps](function.toChartProps.md) instead for getting props for the [Chart](../../../charts/class.Chart.md).
Use [toTableProps](function.toTableProps.md) instead for getting props for the [Table](../../../data-grids/class.Table.md).
