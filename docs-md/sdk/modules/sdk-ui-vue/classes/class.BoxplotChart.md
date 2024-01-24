---
title: BoxplotChart
---

# Class BoxplotChart

A Vue component that wraps the BoxplotChart Preact component for use in Vue applications.
It maintains compatibility with Vue's reactivity system while preserving the functionality of the BoxplotChart.

## Example

Here's how you can use the BoxplotChart component in a Vue application:
```vue
<template>
  <BoxplotChart :props="boxplotChartProps" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BoxplotChart from '@sisense/sdk-ui-vue/BoxplotChart';

const boxplotChartProps = ref({
  // Configure your BoxplotChartProps here
});
</script>
```

## Properties

### dataOptions

> **dataOptions**?: [`BoxplotChartDataOptions`](../../sdk-ui/type-aliases/type-alias.BoxplotChartDataOptions.md) \| [`BoxplotChartCustomDataOptions`](../../sdk-ui/type-aliases/type-alias.BoxplotChartCustomDataOptions.md)

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

> **styleOptions**?: [`BoxplotStyleOptions`](../../sdk-ui/interfaces/interface.BoxplotStyleOptions.md)
