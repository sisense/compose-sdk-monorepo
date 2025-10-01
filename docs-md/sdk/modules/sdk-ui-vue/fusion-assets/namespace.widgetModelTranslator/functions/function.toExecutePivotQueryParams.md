---
title: toExecutePivotQueryParams
---

# Function toExecutePivotQueryParams

> **toExecutePivotQueryParams**(`widgetModel`): [`ExecutePivotQueryParams`](../../../../sdk-ui/interfaces/interface.ExecutePivotQueryParams.md)

Translates a [WidgetModel](../../interface.WidgetModel.md) to the parameters for executing a query for the pivot widget.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../interface.WidgetModel.md) |

## Returns

[`ExecutePivotQueryParams`](../../../../sdk-ui/interfaces/interface.ExecutePivotQueryParams.md)

## Example

```vue
<script setup lang="ts">
import { widgetModelTranslator, useGetWidgetModel, useExecuteQuery } from '@ethings-os/sdk-ui-vue';
import { computed } from 'vue';

const { data: widgetModel } = useGetWidgetModel({
 dashboardOid: 'your-dashboard-oid',
 widgetOid: 'your-widget-oid',
});

const executePivotQueryParams = computed(() =>
 widgetModel.value ? widgetModelTranslator.toExecutePivotQueryParams(widgetModel.value): { enabled: false },
);

const { data, isLoading, isError } = useExecutePivotQuery(executePivotQueryParams);
</script>
```

Note: this method is supported only for getting pivot query.
Use [toExecuteQueryParams](function.toExecuteQueryParams.md) instead for getting query parameters for non-pivot widgets.
