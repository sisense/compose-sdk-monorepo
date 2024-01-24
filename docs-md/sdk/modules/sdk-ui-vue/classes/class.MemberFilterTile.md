---
title: MemberFilterTile
---

# Class MemberFilterTile

A Vue component that wraps the MemberFilterTile Preact component for use in Vue applications.
It maintains compatibility with Vue's reactivity system while preserving the functionality of the MemberFilterTile.

## Example

Here's how you can use the MemberFilterTile component in a Vue application:
```vue
<template>
  <MemberFilterTile :props="memberFilterTileProps" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MemberFilterTile from '@sisense/sdk-ui-vue/MemberFilterTile';

const memberFilterTileProps = ref({
  // Configure your MemberFilterTileProps here
});
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
