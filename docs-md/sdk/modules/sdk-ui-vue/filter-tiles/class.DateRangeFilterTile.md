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

DateRangeFilterTile props

## Properties

### attribute

> **attribute**?: [`LevelAttribute`](../../sdk-data/interfaces/interface.LevelAttribute.md)

Date level attribute the filter is based on

***

### datasource

> **datasource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Data source the query is run against - e.g. `Sample ECommerce`

If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.

***

### earliestDate

> **earliestDate**?: `string`

Earliest allowed date for selection.

If not specified, the earliest date of the target date-level attribute will be used.

***

### filter

> **filter**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)

Date range filter.

***

### lastDate

> **lastDate**?: `string`

Latest allowed date for selection.

If not specified, the latest date of the target date-level attribute will be used.

***

### onChange

> **onChange**?: (`filter`) => `void`

Callback function that is called when the date range filter object should be updated.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `filter` | [`Filter`](../../sdk-data/interfaces/interface.Filter.md) |

#### Returns

`void`

***

### parentFilters

> **parentFilters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

List of filters this filter is dependent on.

***

### title

> **title**?: `string`

Filter tile title
