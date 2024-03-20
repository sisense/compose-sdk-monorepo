---
title: SunburstChart
---

# Class SunburstChart <Badge type="beta" text="Beta" />

A Vue component that wraps the SunburstChart Preact component for use in Vue applications.
It maintains compatibility with Vue's reactivity system while preserving the functionality of the SunburstChart.

## Example

Here's how you can use the SunburstChart component in a Vue application:
```vue
<template>
   <SunburstChart
     :dataOptions="sunburstChartProps.dataOptions"
     :dataSet="sunburstChartProps.dataSet"
     :filters="sunburstChartProps.filters"
   />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { measureFactory, filterFactory } from '@sisense/sdk-data';
import * as DM from '../assets/sample-retail-model';
import {SunburstChart,type SunburstChartProps} from '@sisense/sdk-ui-vue';

const dimProductName = DM.DimProducts.ProductName;
const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');
const sunburstChartProps = ref<SunburstChartProps>({
   dataSet: DM.DataSource,
   dataOptions: {
     category: [dimProductName],
     value: [{ column: measureTotalRevenue, sortType: 'sortDesc' }],
   },
   filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
 });
```
<img src="../../../img/vue-sunburst-chart-example.png" width="600px" />

## Param

Sunburst Chart properties

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

> **styleOptions**?: [`SunburstStyleOptions`](../interfaces/interface.SunburstStyleOptions.md)
