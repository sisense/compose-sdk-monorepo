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
import { MemberFilterTile, type MemberFilterTileProps } from '@sisense/sdk-ui-vue';

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
<img src="../../../img/vue-member-filter-tile-example.png" width="600px" />

## Param

MemberFilterTile props

## Properties

### attribute

> **`readonly`** **attribute**?: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)

Attribute to filter on. A query will run to fetch all this attribute's members

***

### dataSource

> **`readonly`** **dataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Data source the query is run against - e.g. `Sample ECommerce`

If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.

***

### filter

> **`readonly`** **filter**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md) \| `null`

Source filter object. Caller is responsible for keeping track of filter state

***

### onChange

> **`readonly`** **onChange**?: (`filter`) => `void`

Callback indicating when the source members filter should be updated

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `filter` | [`Filter`](../../sdk-data/interfaces/interface.Filter.md) \| `null` |

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

List of filters this filter is dependent on

***

### title

> **`readonly`** **title**?: `string`

Title for the filter tile, which is rendered into the header
