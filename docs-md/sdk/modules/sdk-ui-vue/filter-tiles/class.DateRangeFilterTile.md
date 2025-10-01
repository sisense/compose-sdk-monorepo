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
import { DateRangeFilterTile, type DateRangeFilterTileProps } from '@ethings-os/sdk-ui-vue';
import { filterFactory } from '@ethings-os/sdk-data';
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

> **`readonly`** **attribute**: [`LevelAttribute`](../../sdk-data/interfaces/interface.LevelAttribute.md)

Date level attribute the filter is based on

***

### datasource

> **`readonly`** **datasource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Data source the query is run against - e.g. `Sample ECommerce`

If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.

***

### earliestDate

> **`readonly`** **earliestDate**?: `string`

Earliest allowed date for selection.

If not specified, the earliest date of the target date-level attribute will be used.

***

### filter

> **`readonly`** **filter**: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)

Date range filter.

***

### lastDate

> **`readonly`** **lastDate**?: `string`

Latest allowed date for selection.

If not specified, the latest date of the target date-level attribute will be used.

***

### onChange

> **`readonly`** **onChange**: (`filter`) => `void`

Callback function that is called when the date range filter object should be updated.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `filter` | [`Filter`](../../sdk-data/interfaces/interface.Filter.md) |

#### Returns

`void`

***

### onDelete

> **`readonly`** **onDelete**?: () => `void`

Filter delete callback

#### Returns

`void`

***

### onEdit

> **`readonly`** **onEdit**?: () => `void`

Filter edit callback

#### Returns

`void`

***

### parentFilters

> **`readonly`** **parentFilters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

List of filters this filter is dependent on.

***

### title

> **`readonly`** **title**: `string`

Filter tile title
