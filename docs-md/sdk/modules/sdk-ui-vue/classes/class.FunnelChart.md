---
title: FunnelChart
---

# Class FunnelChart

A Vue component that wraps the FunnelChart Preact component for use in Vue applications.
It maintains compatibility with Vue's reactivity system while preserving the functionality of the FunnelChart.

## Example

Here's how you can use the FunnelChart component in a Vue application:
```vue
<template>
   <FunnelChart
     :dataOptions="funnelChartProps.dataOptions"
     :dataSet="funnelChartProps.dataSet"
     :filters="funnelChartProps.filters"
   />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {FunnelChart, type FunnelChartProps} from '@sisense/sdk-ui-vue';

const funnelChartProps = ref<FunnelChartProps>({
 dataSet: DM.DataSource,
 dataOptions: {
   category: [dimProductName],
   value: [{ column: measureTotalRevenue, sortType: 'sortDesc' }],
 },
 filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
});
</script>
```
<img src="../../../img/funnel-chart-example-1.png" width="800"/>

Note that the chart sorts the measure, `Unique Users`, in descending order by default.

## Param

Funnel chart properties

## Properties

### dataOptions

> **dataOptions**?: [`CategoricalChartDataOptions`](../interfaces/interface.CategoricalChartDataOptions.md)

***

### dataSet

> **dataSet**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md) \| [`Data`](../../sdk-data/interfaces/interface.Data.md)

***

### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md)

***

### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

***

### onBeforeRender

> **onBeforeRender**?: [`BeforeRenderHandler`](../type-aliases/type-alias.BeforeRenderHandler.md)

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

> **styleOptions**?: [`FunnelStyleOptions`](../interfaces/interface.FunnelStyleOptions.md)
