---
title: PolarChart
---

# Class PolarChart

A Vue component that wraps the PolarChart Preact component for use in Vue applications.
It maintains compatibility with Vue's reactivity system while preserving the functionality of the PolarChart.

## Example

Here's how you can use the PolarChart component in a Vue application:
```vue
<template>
  <PolarChart :props="polarChartProps" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PolarChart from '@sisense/sdk-ui-vue/PolarChart';

const polarChartProps = ref({
  // Configure your PolarChartProps here
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

> **styleOptions**?: [`PolarStyleOptions`](../../sdk-ui/interfaces/interface.PolarStyleOptions.md)
