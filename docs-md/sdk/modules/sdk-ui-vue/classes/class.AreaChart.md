---
title: AreaChart
---

# Class AreaChart

A Vue component that wraps the AreaChart Preact component for use in Vue applications.
It maintains compatibility with Vue's reactivity system while preserving the functionality of the AreaChart.

## Example

Here's how you can use the AreaChart component in a Vue application:
```vue
<template>
  <AreaChart :props="areaChartProps" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AreaChart from '@sisense/sdk-ui-vue/AreaChart';

const areaChartProps = ref({
  // Configure your AreaChartProps here
});
</script>
```

## Properties

### dataOptions

> **dataOptions**?: [`CartesianChartDataOptions`](../../sdk-ui/interfaces/interface.CartesianChartDataOptions.md)

***

### dataSet

> **dataSet**?: `string` \| [`Data`](../../sdk-data/interfaces/interface.Data.md)

***

### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md)

***

### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

***

### onBeforeRender

> **onBeforeRender**?: [`BeforeRenderHandler`](../../sdk-ui/type-aliases/type-alias.BeforeRenderHandler.md)

***

### onDataPointClick

> **onDataPointClick**?: [`DataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.DataPointEventHandler.md)

***

### onDataPointContextMenu

> **onDataPointContextMenu**?: [`DataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.DataPointEventHandler.md)

***

### onDataPointsSelected

> **onDataPointsSelected**?: [`DataPointsEventHandler`](../../sdk-ui/type-aliases/type-alias.DataPointsEventHandler.md)

***

### styleOptions

> **styleOptions**?: [`AreaStyleOptions`](../../sdk-ui/interfaces/interface.AreaStyleOptions.md)
