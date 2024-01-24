---
title: AreamapChart
---

# Class AreamapChart

A Vue component that wraps the AreamapChart Preact component for use in Vue applications.
It maintains compatibility with Vue's reactivity system while preserving the functionality of the AreamapChart.

## Example

Here's how you can use the AreamapChart component in a Vue application:
```vue
<template>
  <AreamapChart :props="areamapChartProps" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AreamapChart from '@sisense/sdk-ui-vue/AreamapChart';

const areamapChartProps = ref({
  // Configure your AreamapChartProps here
});
</script>
```

## Properties

### dataOptions

> **dataOptions**?: [`AreamapChartDataOptions`](../../sdk-ui/interfaces/interface.AreamapChartDataOptions.md)

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

> **styleOptions**?: [`AreamapStyleOptions`](../../sdk-ui/interfaces/interface.AreamapStyleOptions.md)
