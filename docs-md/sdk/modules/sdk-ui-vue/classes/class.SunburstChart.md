---
title: SunburstChart
---

# Class SunburstChart

A Vue component that wraps the SunburstChart Preact component for use in Vue applications.
It maintains compatibility with Vue's reactivity system while preserving the functionality of the SunburstChart.

## Example

Here's how you can use the SunburstChart component in a Vue application:
```vue
<template>
  <SunburstChart :props="sunburstChartProps" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SunburstChart from '@sisense/sdk-ui-vue/SunburstChart';

const sunburstChartProps = ref({
  // Configure your SunburstChartProps here
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

> **styleOptions**?: [`SunburstStyleOptions`](../../sdk-ui/interfaces/interface.SunburstStyleOptions.md)
