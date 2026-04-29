---
title: useGetDataSourceDimensions
---

# Function useGetDataSourceDimensions <Badge type="fusionEmbed" text="Fusion Embed" />

> **useGetDataSourceDimensions**(`params`): `ToRefs`\< [`DataSourceDimensionsState`](../type-aliases/type-alias.DataSourceDimensionsState.md) \>

A Vue composable function `useGetDataSourceDimensions` that fetches the dimensional model of a data source.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`MaybeRefOrWithRefs`](../type-aliases/type-alias.MaybeRefOrWithRefs.md)\< [`GetDataSourceDimensionsParams`](../interfaces/interface.GetDataSourceDimensionsParams.md) \> | Parameters for fetching the data source dimensions, supporting reactive Vue refs.<br />Includes the data source to fetch dimensions for, and optional pagination and search parameters. |

## Returns

`ToRefs`\< [`DataSourceDimensionsState`](../type-aliases/type-alias.DataSourceDimensionsState.md) \>

## Example

How to use `useGetDataSourceDimensions` within a Vue component:
```vue
<script setup>
import { ref } from 'vue';
import { useGetDataSourceDimensions } from '@sisense/sdk-ui-vue';
import * as DM from './data-model';

const { dimensions, isLoading, isError, isSuccess, error } = useGetDataSourceDimensions({
  dataSource: DM.DataSource,
});
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="isError">Error: {{ error?.message }}</div>
  <div v-else-if="dimensions">{{ dimensions }}</div>
</template>
```

The composable returns an object with the following reactive properties to manage the dimensions state:
- `dimensions`: The fetched dimensions of the data source, or `undefined` until the load succeeds.
- `isLoading`: Indicates if the dimensions load is in progress.
- `isError`: Indicates if an error occurred during the dimensions load.
- `isSuccess`: Indicates if the dimensions load completed successfully without errors.
- `error`: Contains the error object if an error occurred during the load.
- `status`: The status of the load operation ('loading', 'success', or 'error').
