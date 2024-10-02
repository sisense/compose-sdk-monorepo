---
title: Dashboard
---

# Class Dashboard <Badge type="beta" text="Beta" />

A component used for easily rendering a dashboard.

## Example

Here's how you can use the Dashboard component in a Vue application:
```vue
<template>
 <Dashboard
   v-if="dashboardProps"
   :title="dashboardProps.title"
   :layoutOptions="dashboardProps.layoutOptions"
   :widgets="dashboardProps.widgets"
   :filters="dashboardProps.filters"
   :defaultDataSource="dashboardProps.dataSource"
   :widgetsOptions="dashboardProps.widgetsOptions"
   :styleOptions="dashboardProps.styleOptions"
 />
</template>

<script setup lang="ts">
import { dashboardModelTranslator, useGetDashboardModel } from '@sisense/sdk-ui-vue';

const { dashboard } = useGetDashboardModel({
 dashboardOid: '6441e728dac1920034bce737',
 includeWidgets: true,
 includeFilters: true,
});

const dashboardProps = computed(() =>
  dashboard.value ? dashboardModelTranslator.toDashboardProps(dashboard.value) : null,
);
</script>
```

## Properties

### defaultDataSource

> **defaultDataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

The default data source to use for the dashboard

***

### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

The dashboard filters to be applied to each of the widgets based on the widget filter options

***

### layoutOptions

> **layoutOptions**?: [`DashboardLayoutOptions`](../interfaces/interface.DashboardLayoutOptions.md)

Dashboard layout options

***

### styleOptions

> **styleOptions**?: [`DashboardStyleOptions`](../../sdk-ui/type-aliases/type-alias.DashboardStyleOptions.md)

The style options for the dashboard

***

### title

> **title**?: `string`

The title of the dashboard

***

### widgets

> **widgets**?: [`WidgetProps`](../type-aliases/type-alias.WidgetProps.md)[]

The widgets to render in the dashboard

***

### widgetsOptions

> **widgetsOptions**?: [`WidgetsOptions`](../type-aliases/type-alias.WidgetsOptions.md)

The options for each of the widgets
