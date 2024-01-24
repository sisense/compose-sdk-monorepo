---
title: IndicatorChart
---

# Class IndicatorChart

A Vue component that wraps the IndicatorChart Preact component for use in Vue applications.
It maintains compatibility with Vue's reactivity system while preserving the functionality of the IndicatorChart.

## Example

Here's how you can use the IndicatorChart component in a Vue application:
```vue
<template>
  <IndicatorChart :props="indicatorChartProps" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import IndicatorChart from '@sisense/sdk-ui-vue/IndicatorChart';

const indicatorChartProps = ref({
  // Configure your IndicatorChartProps here
});
</script>
```

## Properties

### dataOptions

> **dataOptions**?: [`IndicatorChartDataOptions`](../../sdk-ui/interfaces/interface.IndicatorChartDataOptions.md)

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

### styleOptions

> **styleOptions**?: [`IndicatorStyleOptions`](../../sdk-ui/type-aliases/type-alias.IndicatorStyleOptions.md)
