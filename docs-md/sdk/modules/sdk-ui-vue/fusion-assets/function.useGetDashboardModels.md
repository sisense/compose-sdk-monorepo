---
title: useGetDashboardModels
---

# Function useGetDashboardModels <Badge type="fusionEmbed" text="Fusion Embed" />

> **useGetDashboardModels**(`params`): `ToRefs`\< [`DashboardModelsState`](../../sdk-ui/type-aliases/type-alias.DashboardModelsState.md) \>

A Vue composable function `useGetDashboardModels` for fetching multiple Sisense dashboard models.
This function abstracts the complexities of managing API calls and state management for fetching an array of
dashboard models from Sisense. It provides a reactive interface to handle loading, success, and error states,
making it easier to integrate Sisense analytics within Vue applications.

**Note:** Dashboard and Widget extensions based on JS scripts and add-ons in Fusion – for example, Blox and Jump To Dashboard – are not supported.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`MaybeRefOrWithRefs`](../type-aliases/type-alias.MaybeRefOrWithRefs.md)\< [`GetDashboardModelsParams`](../interfaces/interface.GetDashboardModelsParams.md) \> | Parameters for fetching the dashboard models, which can include filters,<br />sorting options, and pagination settings to customize the fetch operation. The parameters allow for precise control<br />over which dashboards are retrieved and in what order. |

## Returns

`ToRefs`\< [`DashboardModelsState`](../../sdk-ui/type-aliases/type-alias.DashboardModelsState.md) \>

## Example

How to use `useGetDashboardModels` within a Vue component to fetch and list Sisense dashboards:
```vue
<script setup>
import { ref } from 'vue';
import { useGetDashboardModels } from '@ethings-os/sdk-ui-vue';

const params = ref({
  // Define your parameters here, such as pagination settings, filters, etc.
});

const { data: dashboardModels, isLoading, isError, error } = useGetDashboardModels(params);
</script>
```

The composable returns an object with reactive properties that represent the state of the fetch operation:
- `data`: An array of dashboard models returned from the fetch operation. This is `undefined` until the operation completes successfully.
- `isLoading`: A boolean indicating whether the fetch operation is currently in progress.
- `isError`: A boolean indicating whether an error occurred during the fetch operation.
- `isSuccess`: A boolean indicating whether the fetch operation completed successfully without any errors.
- `error`: An error object containing details about any errors that occurred during the fetch operation.

This composable is ideal for Vue applications requiring a list of Sisense dashboards, providing a streamlined, reactive
way to fetch and manage the state of multiple dashboard models.
