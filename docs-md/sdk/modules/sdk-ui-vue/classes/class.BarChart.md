---
title: BarChart
---

# Class BarChart

A Vue component that wraps the BarChart Preact component for use in Vue applications.
It maintains compatibility with Vue's reactivity system while preserving the functionality of the BarChart.

## Example

Here's how you can use the BarChart component in a Vue application:
```vue
<template>
  <BarChart :props="barChartProps" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BarChart from '@sisense/sdk-ui-vue/BarChart';

const barChartProps = ref({
  // Configure your BarChartProps here
});
</script>
```

## Properties

### dataOptions

> **dataOptions**?: [`CartesianChartDataOptions`](../../sdk-ui/interfaces/interface.CartesianChartDataOptions.md)

Bar chart properties derived from the BarChartProps interface,
including both BaseChartProps and ChartEventProps.

***

### dataSet

> **dataSet**?: `string` \| [`Data`](../../sdk-data/interfaces/interface.Data.md)

***

### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| [`FilterRelation`](../../sdk-data/interfaces/interface.FilterRelation.md)

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

> **styleOptions**?: [`StackableStyleOptions`](../../sdk-ui/interfaces/interface.StackableStyleOptions.md)
