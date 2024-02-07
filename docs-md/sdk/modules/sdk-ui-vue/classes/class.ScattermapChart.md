---
title: ScattermapChart
---

# Class ScattermapChart

A Vue component that wraps the ScattermapChart Preact component for use in Vue applications.
It maintains compatibility with Vue's reactivity system while preserving the functionality of the ScattermapChart.

## Example

Here's how you can use the ScattermapChart component in a Vue application:
```vue
<template>
  <ScattermapChart :props="ScattermapChartProps" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ScattermapChart from '@sisense/sdk-ui-vue/ScattermapChart';

const ScattermapChartProps = ref({
  // Configure your ScattermapChartProps here
});
</script>
```

## Properties

### dataOptions

> **dataOptions**?: [`ScattermapChartDataOptions`](../../sdk-ui/interfaces/interface.ScattermapChartDataOptions.md)

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

### styleOptions

> **styleOptions**?: [`ScattermapStyleOptions`](../../sdk-ui/interfaces/interface.ScattermapStyleOptions.md)
