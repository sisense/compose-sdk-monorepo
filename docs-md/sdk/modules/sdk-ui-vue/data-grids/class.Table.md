---
title: Table
---

# Class Table

Table with aggregation and pagination.

## Example

Here's how you can use the Table component in a Vue application:
```vue
<template>
 <Table :dataOptions="tableProps.dataOptions" :dataSet="tableProps.dataSet"
     :styleOptions="tableProps.styleOptions" :filters="tableProps.filters" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { measureFactory, filterFactory } from '@sisense/sdk-data';
import * as DM from '../assets/sample-retail-model';
import { Table, type TableProps } from '@sisense/sdk-ui-vue';

const dimProductName = DM.DimProducts.ProductName;
const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');

 const tableProps = ref<TableProps>({
     dataSet: DM.DataSource,
     dataOptions: {
       columns: [dimProductName, measureTotalRevenue],
     },
     styleOptions: {
       width: 800,
       height: 500,
     },
     filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
 });
</script>
```
<img src="../../../img/vue-table-example.png" width="800px" />

## Param

Table properties

## Properties

### dataOptions

> **dataOptions**?: [`TableDataOptions`](../interfaces/interface.TableDataOptions.md)

***

### dataSet

> **dataSet**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md) \| [`Data`](../../sdk-data/interfaces/interface.Data.md)

***

### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md)

***

### refreshCounter

> **refreshCounter**?: `number`

***

### styleOptions

> **styleOptions**?: [`TableStyleOptions`](../interfaces/interface.TableStyleOptions.md)
