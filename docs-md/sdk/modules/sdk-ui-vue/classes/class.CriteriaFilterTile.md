---
title: CriteriaFilterTile
---

# Class CriteriaFilterTile

A Vue component that wraps the CriteriaFilterTile Preact component for use in Vue applications.
It maintains compatibility with Vue's reactivity system while preserving the functionality of the CriteriaFilterTile.

## Example

Here's how you can use the CriteriaFilterTile component in a Vue application:
```vue
<template>
  <CriteriaFilterTile :props="criteriaFilterTileProps" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {CriteriaFilterTile} from '@sisense/sdk-ui-vue';

const criteriaFilterTileProps = ref({
  // Configure your CriteriaFilterTileProps here
});
</script>
```

## Properties

### arrangement

> **arrangement**?: [`FilterVariant`](../../sdk-ui/type-aliases/type-alias.FilterVariant.md)

***

### filter

> **filter**?: [`CriteriaFilterType`](../../sdk-ui/type-aliases/type-alias.CriteriaFilterType.md)

***

### measures

> **measures**?: [`Measure`](../../sdk-data/interfaces/interface.Measure.md)[]

***

### onUpdate

> **onUpdate**?: (`filter`) => `void`

Callback returning filter object, or null for failure

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `filter` | `null` \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md) |

#### Returns

`void`

***

### title

> **title**?: `string`
