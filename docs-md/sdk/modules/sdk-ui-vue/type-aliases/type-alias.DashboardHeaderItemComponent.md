---
title: DashboardHeaderItemComponent
---

# Type alias DashboardHeaderItemComponent

> **DashboardHeaderItemComponent**: `Component`\< [`DashboardHeaderItemComponentProps`](../interfaces/interface.DashboardHeaderItemComponentProps.md) \> \| `DefineComponent`\< [`DashboardHeaderItemComponentProps`](../interfaces/interface.DashboardHeaderItemComponentProps.md) \>

A Vue component that renders the content of a custom dashboard header item.
This can be a Vue component options object, a `defineComponent` result, or any valid Vue component.

The item size resolved by the header layout is provided via the `size` prop.

## Example

A Vue header item component rendering an export button that uses its resolved size:
```vue
<script setup lang="ts">
import { type DashboardHeaderItemComponentProps } from '@sisense/sdk-ui-vue';

const props = defineProps<DashboardHeaderItemComponentProps>();

const onExport = () => {
  // trigger the export
};
</script>
<template>
  <button :style="{ height: props.size.height + 'px' }" @click="onExport">Export</button>
</template>
```
