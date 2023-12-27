---
title: ColumnChart
---

# Class ColumnChart

A Vue component that wraps the ColumnChart Preact component for use in Vue applications.
It maintains compatibility with Vue's reactivity system while preserving the functionality of the ColumnChart.

## Example

Here's how you can use the ColumnChart component in a Vue application:
```vue
<template>
  <ColumnChart :props="ColumnChartProps" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ColumnChart from '@sisense/sdk-ui-vue/ColumnChart';

const columnChartProps = ref({
  // Configure your ColumnChartProps here
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

> **styleOptions**?: [`StackableStyleOptions`](../../sdk-ui/interfaces/interface.StackableStyleOptions.md)
