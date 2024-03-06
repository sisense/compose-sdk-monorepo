---
title: AreamapChart
---

# Class AreamapChart <Badge type="beta" text="Beta" />

A Vue component for visualizing geographical data as polygons on a map.
See [Areamap Chart](https://docs.sisense.com/main/SisenseLinux/area-map.htm) for more information.

## Example

Here's how you can use the AreamapChart component in a Vue application:
```vue
<template>
   <AreamapChart
     :dataOptions="areamapChartProps.dataOptions"
     :dataSet="areamapChartProps.dataSet"
     :filters="areamapChartProps.filters"
   />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {AreamapChart, type AreamapChartProps} from '@sisense/sdk-ui-vue';

 const areamapChartProps = ref<AreamapChartProps>({
   dataSet: DM.DataSource,
   dataOptions: {
     geo: [DM.DimCountries.CountryName],
     color: [{ column: measureTotalRevenue, title: 'Total Revenue' }],
   },
   filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
 });
</script>
```

## Param

Areamap chart properties

## Properties

### dataOptions

> **dataOptions**?: [`AreamapChartDataOptions`](../interfaces/interface.AreamapChartDataOptions.md)

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

### onDataPointClick

> **onDataPointClick**?: [`AreamapDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.AreamapDataPointEventHandler.md)

***

### styleOptions

> **styleOptions**?: [`AreamapStyleOptions`](../interfaces/interface.AreamapStyleOptions.md)
