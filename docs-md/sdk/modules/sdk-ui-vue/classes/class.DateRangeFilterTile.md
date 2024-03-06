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
    :title="dateRangeFilterTileProps.title"
    :attribute="dateRangeFilterTileProps.attribute"
    :filter="dateRangeFilterTileProps.filter"
    :onChange="onChange" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {CriteriaFilterTile} from '@sisense/sdk-ui-vue';

const dateRangeFilterTileProps = ref({
  title: 'Date Range',
  attribute: DM.Commerce.Date.Years,
  filter: filterFactory.dateRange(DM.Commerce.Date.Years),
});

const onChange = (filter: Filter) => {
 ...
}
</script>
```

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

Callback function that is called when the date range filter object should be updated.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `filter` | [`Filter`](../../sdk-data/interfaces/interface.Filter.md) | Date range filter |

#### Returns

`void`

***

### parentFilters

> **parentFilters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

***

### title

> **title**?: `string`
