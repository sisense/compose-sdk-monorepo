---
title: toDashboardProps
---

# Function toDashboardProps

> **toDashboardProps**(`dashboardModel`): [`DashboardProps`](../../../interfaces/interface.DashboardProps.md)

Translates [DashboardModel](../../interface.DashboardModel.md) to [DashboardProps](../../../interfaces/interface.DashboardProps.md).

## Parameters

| Parameter | Type |
| :------ | :------ |
| `dashboardModel` | [`DashboardModel`](../../interface.DashboardModel.md) |

## Returns

[`DashboardProps`](../../../interfaces/interface.DashboardProps.md)

## Example

```vue
<script setup lang="ts">
import { dashboardModelTranslator, useGetDashboardModel, Dashboard } from '@ethings-os/sdk-ui-vue';
import { computed } from 'vue';

const { dashboard } = useGetDashboardModel({
 dashboardOid: 'your-dashboard-oid',
 includeWidgets: true,
 includeFilters: true,
});

const dashboardProps = computed(() =>
 dashboard.value ? dashboardModelTranslator.toDashboardProps(dashboard.value) : null,
);
</script>

<template>
 <Dashboard
   v-if="dashboardProps"
   :title="dashboardProps.title"
   :layoutOptions="dashboardProps.layoutOptions"
   :widgets="dashboardProps.widgets"
   :filters="dashboardProps.filters"
   :defaultDataSource="dashboardProps.defaultDataSource"
   :widgetsOptions="dashboardProps.widgetsOptions"
   :styleOptions="dashboardProps.styleOptions"
 />
</template>
```
