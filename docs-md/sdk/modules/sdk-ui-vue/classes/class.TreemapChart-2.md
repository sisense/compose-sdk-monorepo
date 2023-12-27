---
title: TreemapChart
---

# Class TreemapChart

A Vue component that wraps the TreemapChart Preact component for use in Vue applications.
It maintains compatibility with Vue's reactivity system while preserving the functionality of the TreemapChart.

## Example

Here's how you can use the TreemapChart component in a Vue application:
```vue
<template>
  <TreemapChart :props="treemapChartProps" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TreemapChart from '@sisense/sdk-ui-vue/TreemapChart';

const treemapChartProps = ref({
  // Configure your TreemapChartProps here
});
</script>
```

## Properties

### dataOptions

> **dataOptions**?: [`CategoricalChartDataOptions`](../../sdk-ui/interfaces/interface.CategoricalChartDataOptions.md)

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

> **styleOptions**?: [`TreemapStyleOptions`](../../sdk-ui/interfaces/interface.TreemapStyleOptions.md)
