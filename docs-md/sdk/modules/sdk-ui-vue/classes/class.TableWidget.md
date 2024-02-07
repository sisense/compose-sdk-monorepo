---
title: TableWidget
---

# Class TableWidget

A Vue component that wraps the TableWidget Preact component for use in Vue applications.
It uses a single 'props' prop to pass all TableWidgetProps to the TableWidgetPreact component.

## Example

Here's how you can use the TableWidget component in a Vue application:
```vue
<template>
  <TableWidget :props="tableWidgetProps" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TableWidget from '@sisense/sdk-ui-vue/TableWidget';

const tableWidgetProps = ref({
  // Configure your TableWidgetProps here
});
</script>
```

## Properties

### bottomSlot

> **bottomSlot**?: `ReactNode`

***

### dataOptions

> **dataOptions**?: [`TableDataOptions`](../../sdk-ui/interfaces/interface.TableDataOptions.md)

***

### dataSource

> **dataSource**?: `string`

***

### description

> **description**?: `string`

***

### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md)

***

### styleOptions

> **styleOptions**?: `TableWidgetStyleOptions`

***

### title

> **title**?: `string`

***

### topSlot

> **topSlot**?: `ReactNode`

***

### widgetStyleOptions

> **widgetStyleOptions**?: `TableWidgetStyleOptions`
