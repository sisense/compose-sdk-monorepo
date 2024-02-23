---
title: BoxplotChart
---

# Class BoxplotChart <Badge type="beta" text="Beta" />

A Vue component representing data in a way that visually describes the distribution, variability,
and center of a data set along an axis.
See [Boxplot Chart](https://docs.sisense.com/main/SisenseLinux/box-and-whisker-plot.htm) for more information.

## Example

Here's how you can use the BoxplotChart component in a Vue application:
```vue
<template>
   <BoxplotChart
       :dataOptions="boxplotChartProps.dataOptions"
       :dataSet="boxplotChartProps.dataSet"
       :filters="boxplotChartProps.filters"
     />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {BoxplotChart, type BoxplotChartProps} from '@sisense/sdk-ui-vue';

 const boxplotChartProps = ref<BoxplotChartProps>({
   dataSet: DM.DataSource,
   dataOptions: {
     category: [dimProductName],
     value: [DM.Fact_Sale_orders.OrderRevenue],
     boxType: 'iqr',
     outliersEnabled: true,
   },
   filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
 });
```
<img src="../../../img/boxplot-chart-example-1.png" width="600px" />

## Param

Boxplot chart properties

## Properties

### dataOptions

> **dataOptions**?: [`BoxplotChartDataOptions`](../type-aliases/type-alias.BoxplotChartDataOptions.md) \| [`BoxplotChartCustomDataOptions`](../type-aliases/type-alias.BoxplotChartCustomDataOptions.md)

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

> **onDataPointClick**?: [`BoxplotDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.BoxplotDataPointEventHandler.md)

***

### onDataPointContextMenu

> **onDataPointContextMenu**?: [`BoxplotDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.BoxplotDataPointEventHandler.md)

***

### onDataPointsSelected

> **onDataPointsSelected**?: [`DataPointsEventHandler`](../../sdk-ui/type-aliases/type-alias.DataPointsEventHandler.md)

***

### styleOptions

> **styleOptions**?: [`BoxplotStyleOptions`](../interfaces/interface.BoxplotStyleOptions.md)
