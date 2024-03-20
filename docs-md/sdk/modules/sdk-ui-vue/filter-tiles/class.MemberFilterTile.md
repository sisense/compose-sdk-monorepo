---
title: MemberFilterTile
---

# Class MemberFilterTile

UI component that allows the user to select members to include/exclude in a
filter. A query is executed against the provided data source to fetch
all members that are selectable.

## Example

Below is an example for filtering countries in the `Country` dimension of the `Sample ECommerce` data model.
```vue
<template>
      <MemberFilterTile
        :attribute="memberFilter.attribute"
        :onChange="memberFilter.onChange"
        :dataSource="memberFilter.dataSource"
        :title="memberFilter.title"
      />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {MemberFilterTile, type MemberFilterTileProps} from '@sisense/sdk-ui-vue';

const memberFilterValue = ref<Filter | null>(null);

const memberFilter = ref<MemberFilterTileProps>({
  dataSource: DM.DataSource,
  title: 'Member Filter',
  attribute: DM.DimProducts.ProductName,
  filter: memberFilterValue.value,
  onChange(filter) {
    memberFilterValue.value = filter;
  },
});

</script>
```
<img src="../../../img/vue-member-filter-tile-example.png" width="300px" />

## Param

MemberFilterTile props

## Properties

### attribute

> **attribute**?: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)

***

### dataSource

> **dataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

***

### filter

> **filter**?: `null` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)

***

### onChange

> **onChange**?: (`filter`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `filter` | `null` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md) |

#### Returns

`void`

***

### parentFilters

> **parentFilters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

***

### title

> **title**?: `string`
