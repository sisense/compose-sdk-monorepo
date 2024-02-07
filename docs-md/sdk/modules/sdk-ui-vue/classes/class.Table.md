---
title: Table
---

# Class Table

A Vue component that wraps the Table Preact component for use in Vue applications.
It provides a single 'props' prop to pass all the TableProps to the Table Preact component,
enabling the use of the table within Vue's reactivity system.

## Example

Here's how you can use the Table component in a Vue application:
```vue
<template>
  <Table :props="tableProps" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Table from '@sisense/sdk-ui-vue/Table';

const tableProps = ref({
  // Define your TableProps configuration here
});
</script>
```

## Properties

### dataOptions

> **dataOptions**?: [`TableDataOptions`](../../sdk-ui/interfaces/interface.TableDataOptions.md)

***

### dataSet

> **dataSet**?: `string` \| [`Data`](../../sdk-data/interfaces/interface.Data.md)

***

### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md)

***

### refreshCounter

> **refreshCounter**?: `number`

***

### styleOptions

> **styleOptions**?: [`TableStyleOptions`](../../sdk-ui/interfaces/interface.TableStyleOptions.md)
