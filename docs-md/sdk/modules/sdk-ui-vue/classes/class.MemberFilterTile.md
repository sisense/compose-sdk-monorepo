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
  :title="memberFilterTileProps.title"
  :attribute="memberFilterTileProps.attribute"
  :filter="memberFilterTileProps.filter"
  :onChange={setCountryFilter}
/>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MemberFilterTile from '@sisense/sdk-ui-vue/MemberFilterTile';

const memberFilterTileProps = ref({
  title: 'Country',
  attribute: DM.Country.Country,
  filter: countryFilter,
});

const setCountryFilter = (filter: Filter | null) => {...}

</script>
```

## Properties

### attribute

> **attribute**?: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)

***

### dataSource

> **dataSource**?: `string`

***

### filter

> **filter**?: `null` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)

***

### onChange

> **onChange**?: (`filter`) => `void`

Callback indicating when the source member filter object should be updated

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
