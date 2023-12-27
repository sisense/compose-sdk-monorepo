---
title: LineChart
---

# Class LineChart

A Vue component that wraps the LineChart Preact component for use in Vue applications.
It maintains compatibility with Vue's reactivity system while preserving the functionality of the LineChart.

## Example

Here's how you can use the LineChart component in a Vue application:
```vue
<template>
  <LineChart :props="lineChartProps" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LineChart from '@sisense/sdk-ui-vue/LineChart';

const lineChartProps = ref({
  // Configure your LineChartProps here
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

> **styleOptions**?: [`LineStyleOptions`](../../sdk-ui/interfaces/interface.LineStyleOptions.md)
