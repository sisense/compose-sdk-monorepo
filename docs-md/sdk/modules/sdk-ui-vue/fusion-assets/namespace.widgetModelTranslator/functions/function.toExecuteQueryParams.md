---
title: toExecuteQueryParams
---

# Function toExecuteQueryParams

> **toExecuteQueryParams**(`widgetModel`): [`ExecuteQueryParams`](../../../interfaces/interface.ExecuteQueryParams.md)

Translates a [WidgetModel](../../interface.WidgetModel.md) to the parameters for executing a query for the widget.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../interface.WidgetModel.md) |

## Returns

[`ExecuteQueryParams`](../../../interfaces/interface.ExecuteQueryParams.md)

## Example

```vue
<script setup lang="ts">
import { widgetModelTranslator, useGetWidgetModel, useExecuteQuery } from '@ethings-os/sdk-ui-vue';
import { computed } from 'vue';

const { data: widgetModel } = useGetWidgetModel({
 dashboardOid: 'your-dashboard-oid',
 widgetOid: 'your-widget-oid',
});

const executeQueryParams = computed(() =>
 widgetModel.value
   ? widgetModelTranslator.toExecuteQueryParams(widgetModel.value)
   : { enabled: false },
);

const { data, isLoading, isError } = useExecuteQuery(executeQueryParams);
</script>
```

Note: this method is not supported for getting pivot query.
Use [toExecutePivotQueryParams](function.toExecutePivotQueryParams.md) instead for getting query parameters for the pivot widget.
