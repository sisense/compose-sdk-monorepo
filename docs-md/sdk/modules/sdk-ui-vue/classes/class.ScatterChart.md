---
title: ScatterChart
---

# Class ScatterChart

A Vue component that wraps the ScatterChart Preact component for use in Vue applications.
It maintains compatibility with Vue's reactivity system while preserving the functionality of the ScatterChart.

## Example

Here's how you can use the ScatterChart component in a Vue application:
```vue
<template>
  <ScatterChart :props="scatterChartProps" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ScatterChart from '@sisense/sdk-ui-vue/ScatterChart';

const scatterChartProps = ref({
  // Configure your ScatterChartProps here
});
</script>
```

## Properties

### dataOptions

> **dataOptions**?: [`ScatterChartDataOptions`](../../sdk-ui/interfaces/interface.ScatterChartDataOptions.md)

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

> **onDataPointClick**?: [`ScatterDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointEventHandler.md)

***

### onDataPointContextMenu

> **onDataPointContextMenu**?: [`ScatterDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointEventHandler.md)

***

### onDataPointsSelected

> **onDataPointsSelected**?: [`ScatterDataPointsEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointsEventHandler.md)

***

### styleOptions

> **styleOptions**?: [`ScatterStyleOptions`](../../sdk-ui/interfaces/interface.ScatterStyleOptions.md)
