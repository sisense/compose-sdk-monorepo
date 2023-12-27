---
title: BasicMemberFilterTile
---

# Class BasicMemberFilterTile

A Vue component that wraps the BasicMemberFilterTile Preact component for use in Vue applications.
It maintains compatibility with Vue's reactivity system while preserving the functionality of the BasicMemberFilterTile.

## Example

Here's how you can use the BasicMemberFilterTile component in a Vue application:
```vue
<template>
  <BasicMemberFilterTile :props="basicMemberFilterTileProps" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BasicMemberFilterTile from '@sisense/sdk-ui-vue/BasicMemberFilterTile';

const basicMemberFilterTileProps = ref({
  // Configure your BasicMemberFilterTileProps here
});
</script>
```

## Properties

### allMembers

> **allMembers**?: [`Member`](../../sdk-ui/interfaces/interface.Member.md)[]

***

### initialSelectedMembers

> **initialSelectedMembers**?: `SelectedMember`[]

***

### isDependent

> **isDependent**?: `boolean`

***

### maxAllowedMembers

> **maxAllowedMembers**?: `number`

***

### onUpdateSelectedMembers

> **onUpdateSelectedMembers**?: (`members`) => `void`

Callback that executes whenever the final list of active and selected members is updated

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `members` | `string`[] |

#### Returns

`void`

***

### shouldUpdateSelectedMembers

> **shouldUpdateSelectedMembers**?: `boolean`

***

### title

> **title**?: `string`
