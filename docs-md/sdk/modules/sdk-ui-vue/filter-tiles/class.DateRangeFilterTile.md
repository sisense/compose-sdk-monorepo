---
title: DateRangeFilterTile
---

# Class DateRangeFilterTile

Date Range Filter Tile component for filtering data by date range.

## Example

Vue example of configuring the date min max values and handling onChange event.
```vue
<template>
        <DateRangeFilterTile
          :title="dateRangeFilter.title"
          :datasource="dateRangeFilter.dataSource"
          :attribute="dateRangeFilter.attribute"
          :filter="dateRangeFilter.filter"
          :onChange="dateRangeFilter.onChange"
        />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {CriteriaFilterTile, type DateRangeFilterTileProps} from '@sisense/sdk-ui-vue';
import { filterFactory } from '@sisense/sdk-data';
import * as DM from '../assets/sample-retail-model';

const dateRangeFilterValue = ref<Filter | null>(filterFactory.dateRange(DM.DimDate.Date.Years));

const dateRangeFilter = ref<DateRangeFilterTileProps>({
  title: 'Date Range',
  attribute: DM.DimDate.Date.Years,
  filter: dateRangeFilterValue.value!,
  onChange(filter) {
    dateRangeFilterValue.value = filter;
  },
});
</script>
```
<img src="../../../img/vue-date-range-filter-tile-example.png" width="800px" />

## Param

MemberFilterTile props

## Properties

### attribute

> **attribute**?: [`LevelAttribute`](../../sdk-data/interfaces/interface.LevelAttribute.md)

***

### datasource

> **datasource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

***

### earliestDate

> **earliestDate**?: `string`

***

### filter

> **filter**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)

***

### lastDate

> **lastDate**?: `string`

***

### onChange

> **onChange**?: (`filter`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `filter` | [`Filter`](../../sdk-data/interfaces/interface.Filter.md) |

#### Returns

`void`

***

### parentFilters

> **parentFilters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

***

### title

> **title**?: `string`
