---
title: Dashboard
---

# Class Dashboard

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
   :defaultDataSource="dashboardProps.defaultDataSource"
   :widgetsOptions="dashboardProps.widgetsOptions"
   :styleOptions="dashboardProps.styleOptions"
 />
</template>

<script setup lang="ts">
import { dashboardModelTranslator, useGetDashboardModel, Dashboard } from '@ethings-os/sdk-ui-vue';
import { computed } from 'vue';

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

To learn more about this and related dashboard components,
see [Embedded Dashboards](/guides/sdk/guides/dashboards/index.html).

## Properties

### config

> **`readonly`** **config**?: [`DashboardConfig`](../interfaces/interface.DashboardConfig.md)

The configuration for the dashboard

***

### defaultDataSource

> **`readonly`** **defaultDataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

The default data source to use for the dashboard

***

### filters

> **`readonly`** **filters**?: [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md) \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

The dashboard filters to be applied to each of the widgets based on the widget filter options

***

### layoutOptions

> **`readonly`** **layoutOptions**?: [`DashboardLayoutOptions`](../interfaces/interface.DashboardLayoutOptions.md)

Dashboard layout options

***

### styleOptions

> **`readonly`** **styleOptions**?: [`DashboardStyleOptions`](../../sdk-ui/type-aliases/type-alias.DashboardStyleOptions.md)

The style options for the dashboard

***

### title

> **`readonly`** **title**?: `string`

The title of the dashboard

***

### widgets

> **`readonly`** **widgets**: [`WidgetProps`](../type-aliases/type-alias.WidgetProps.md)[]

The widgets to render in the dashboard

***

### widgetsOptions

> **`readonly`** **widgetsOptions**?: [`WidgetsOptions`](../type-aliases/type-alias.WidgetsOptions.md)

The options for each of the widgets
