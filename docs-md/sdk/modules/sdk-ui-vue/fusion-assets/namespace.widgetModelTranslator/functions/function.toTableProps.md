---
title: toTableProps
---

# Function toTableProps

> **toTableProps**(`widgetModel`): [`TableProps`](../../../interfaces/interface.TableProps.md)

Translates a [WidgetModel](../../interface.WidgetModel.md) to the props for rendering a table.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../interface.WidgetModel.md) |

## Returns

[`TableProps`](../../../interfaces/interface.TableProps.md)

## Example

```vue
<script setup lang="ts">
import { widgetModelTranslator, useGetWidgetModel, Table } from '@sisense/sdk-ui-vue';
import { computed } from 'vue';

const { data: widgetModel } = useGetWidgetModel({
 dashboardOid: 'your-dashboard-oid',
 widgetOid: 'your-widget-oid',
});

const tableProps = computed(() =>
 widgetModel.value ? widgetModelTranslator.toTableProps(widgetModel.value) : null,
);
</script>

<template>
 <Table
   v-if="tableProps"
   :dataSet="tableProps.dataSet"
   :dataOptions="tableProps.dataOptions"
   :filters="tableProps.filters"
   :styleOptions="tableProps.styleOptions"
 />
</template>
```

Note: this method is not supported for chart and pivot widgets.
Use [toChartProps](function.toChartProps.md) instead for getting props for the [Chart](../../../charts/class.Chart.md).
Use [toPivotTableProps](function.toPivotTableProps.md) instead for getting props for the [PivotTable](../../../data-grids/class.PivotTable.md).
