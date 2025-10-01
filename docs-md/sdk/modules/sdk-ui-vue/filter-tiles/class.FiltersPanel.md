---
title: FiltersPanel
---

# Class FiltersPanel

Filters panel component that renders a list of filter tiles

## Example

Here's how to render a filters panel with a set of filters.
```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FiltersPanel } from '@ethings-os/sdk-ui-vue';
import { filterFactory, type Filter, type FilterRelations } from '@ethings-os/sdk-data';
import * as DM from '../assets/sample-ecommerce-model.js';

const filters = ref<Filter[]>([
 filterFactory.members(DM.Commerce.Gender, ['Male', 'Female']),
 filterFactory.members(DM.Commerce.AgeRange, ['0-18', '19-24']),
]);

const handleFiltersChange = (updatedFilters: Filter[] | FilterRelations) => {
 filters.value = updatedFilters as Filter[];
 console.log('Filters changed:', updatedFilters);
};
</script>

<template>
 <FiltersPanel
   :filters="filters"
   :defaultDataSource="DM.DataSource"
   :onFiltersChange="handleFiltersChange"
 />
</template>
```

## Param

FiltersPanel props

## Properties

### config

> **`readonly`** **config**?: [`FiltersPanelConfig`](../../sdk-ui/interfaces/interface.FiltersPanelConfig.md)

The configuration for the filters panel

***

### defaultDataSource

> **`readonly`** **defaultDataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Default data source used for filter tiles

***

### filters

> **`readonly`** **filters**: [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md) \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Array of filters to display

***

### onFiltersChange

> **`readonly`** **onFiltersChange**: (`filters`) => `void`

Callback to handle changes in filters

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `filters` | [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md) \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] |

#### Returns

`void`
