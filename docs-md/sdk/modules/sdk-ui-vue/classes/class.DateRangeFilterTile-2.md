---
title: DateRangeFilterTile
---

# Class DateRangeFilterTile

A Vue component that wraps the DateRangeFilterTile Preact component for use in Vue applications.
It maintains compatibility with Vue's reactivity system while preserving the functionality of the DateRangeFilterTile.

## Example

Here's how you can use the DateRangeFilterTile component in a Vue application:
```vue
<template>
  <DateRangeFilterTile :props="dateRangeFilterTileProps" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {CriteriaFilterTile} from '@sisense/sdk-ui-vue';

const dateRangeFilterTileProps = ref({
  // Configure your dateRangeFilterTileProps
});
</script>
```

## Properties

### attribute

> **attribute**?: [`LevelAttribute`](../../sdk-data/interfaces/interface.LevelAttribute.md)

***

### datasource

> **datasource**?: `string`

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
