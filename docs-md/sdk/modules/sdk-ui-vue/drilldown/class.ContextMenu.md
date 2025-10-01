---
title: ContextMenu
---

# Class ContextMenu

`ContextMenu` component from the `@ethings-os/sdk-ui-vue` package.
This component provides a context menu that can be customized with different items and sections.
It allows for flexible positioning and can be easily integrated into Vue applications.

## Example

Here's how to use the `ContextMenu` component:
```vue
<template>
  <ContextMenu :closeContextMenu="closeMenu" :itemSections="sections" :position="menuPosition">
  </ContextMenu>
</template>

<script>
import { ref } from 'vue';
import ContextMenu from './ContextMenu.vue';

export default {
  components: { ContextMenu },
  setup() {
    const sections = ref([...]);
    const menuPosition = ref({ top: 0, left: 0 });
    const closeMenu = () => {};
   }
};
</script>
```

## Properties

### closeContextMenu

> **`readonly`** **closeContextMenu**: () => `void`

Function to close the context menu. It should be a function that sets the visibility of the context menu to false.

#### Returns

`void`

***

### itemSections

> **`readonly`** **itemSections**?: [`MenuItemSection`](../type-aliases/type-alias.MenuItemSection.md)[]

An array of sections, each containing an array of items to be rendered in the context menu. Each item can be a string or an object specifying the item's properties.

***

### position

> **`readonly`** **position**?: [`MenuPosition`](../type-aliases/type-alias.MenuPosition.md) \| `null`

An object specifying the position of the context menu. It should contain `top` and `left` properties to position the menu on the screen.
