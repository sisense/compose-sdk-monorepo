---
title: useGetHierarchyModels
---

# Function useGetHierarchyModels <Badge type="fusionEmbed" text="Fusion Embed" />

> **useGetHierarchyModels**(`params`): `ToRefs`\< `DataState`\< [`HierarchyModel`](../../sdk-ui/interfaces/interface.HierarchyModel.md)[] \> \>

A Vue composable function `useGetHierarchyModels` for retrieving hierarchy models from Sisense instance.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`MaybeRefOrWithRefs`](../type-aliases/type-alias.MaybeRefOrWithRefs.md)\< [`GetHierarchyModelsParams`](../interfaces/interface.GetHierarchyModelsParams.md) \> | The parameters for fetching the hierarchy models. |

## Returns

`ToRefs`\< `DataState`\< [`HierarchyModel`](../../sdk-ui/interfaces/interface.HierarchyModel.md)[] \> \>

## Example

Retrieve hierarchy models:

```vue
<script setup lang="ts">
import { useGetHierarchyModels } from '@ethings-os/sdk-ui-vue';
const { data: hierarchyModels } = useGetHierarchyModels({
  dataSource: DM.DataSource,
  dimension: DM.DimCountries.Region,
});
</script>
```

The composable returns an object with reactive properties that represent the state of the hierarchy models fetch operation:
- `data`: Fetched hierarchy models, which is `undefined` until the operation is successfully completed.
- `isLoading`: A boolean indicating whether the fetch operation is currently in progress.
- `isError`: A boolean indicating whether an error occurred during the fetch operation.
- `isSuccess`: A boolean indicating whether the fetch operation was successfully completed without any errors.
- `error`: An error object containing details about any errors that occurred during the fetch operation.

This composable streamlines the process of fetching and managing Sisense hierarchy models within Vue applications, providing
developers with a reactive and efficient way to integrate Sisense data visualizations and analytics.
