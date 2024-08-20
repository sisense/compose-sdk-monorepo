---
title: Dashboard
---

# Class Dashboard <Badge type="fusionEmbed" text="Fusion Embed" /> <Badge type="alpha" text="Alpha" />

A component used for easily rendering a dashboard.

## Example

Here's how you can use the Dashboard component in a Vue application:
```vue
<template>
 <Dashboard
   v-if="dashboard"
   :title="dashboard.title"
   :layout="dashboard.layout"
   :widgets="dashboard.widgets"
   :filters="dashboard.filters"
   :defaultDataSource="dashboard.dataSource"
   :widgetFilterOptions="dashboard.widgetFilterOptions"
   :styleOptions="dashboard.styleOptions"
 />
</template>

<script setup lang="ts">
import { DashboardById, useGetDashboardModel } from '@sisense/sdk-ui-vue';

const { dashboard } = useGetDashboardModel({
 dashboardOid: '6441e728dac1920034bce737',
 includeWidgets: true,
 includeFilters: true,
});
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

### layout

> **layout**?: [`Layout`](../interfaces/interface.Layout.md)

The layout of the dashboard

***

### styleOptions

> **styleOptions**?: [`DashboardStyleOptions`](../../sdk-ui/type-aliases/type-alias.DashboardStyleOptions.md)

The style options for the dashboard

***

### title

> **title**?: `string`

The title of the dashboard

***

### widgetFilterOptions

> **widgetFilterOptions**?: [`WidgetFilterOptions`](../type-aliases/type-alias.WidgetFilterOptions.md)

The filter options for each of the widgets

***

### widgets

> **widgets**?: [`WidgetModel`](class.WidgetModel.md)[]

The widgets to render in the dashboard
