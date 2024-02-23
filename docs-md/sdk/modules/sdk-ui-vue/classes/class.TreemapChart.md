---
title: TreemapChart
---

# Class TreemapChart

A Vue component displaying hierarchical data in the form of nested rectangles.
This type of chart can be used instead of a column chart for comparing a large number of categories and sub-categories.
See [Treemap Chart](https://docs.sisense.com/main/SisenseLinux/treemap.htm) for more information.

## Example

Here's how you can use the TreemapChart component in a Vue application:
```vue
<template>
     <TreemapChart
       :dataOptions="treemapChartProps.dataOptions"
       :dataSet="treemapChartProps.dataSet"
       :filters="treemapChartProps.filters"
     />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TreemapChart from '@sisense/sdk-ui-vue/TreemapChart';

const treemapChartProps = ref<TreemapChartProps>({
 dataSet: DM.DataSource,
 dataOptions: {
   category: [dimProductName],
   value: [{ column: measureTotalRevenue, sortType: 'sortDesc' }],
 },
 filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
});
```
<img src="../../../img/treemap-chart-example-1.png" width="600px" />

## Param

Treemap chart properties

## Properties

### dataOptions

> **dataOptions**?: [`CategoricalChartDataOptions`](../interfaces/interface.CategoricalChartDataOptions.md)

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

> **styleOptions**?: [`TreemapStyleOptions`](../interfaces/interface.TreemapStyleOptions.md)
