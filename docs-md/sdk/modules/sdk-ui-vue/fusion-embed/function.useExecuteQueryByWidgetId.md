---
title: useExecuteQueryByWidgetId
---

# Function useExecuteQueryByWidgetId <Badge type="fusionEmbed" text="Fusion Embed" />

> **useExecuteQueryByWidgetId**(`params`): `ToRefs`\< [`QueryByWidgetIdState`](../../sdk-ui/type-aliases/type-alias.QueryByWidgetIdState.md) \>

A Vue composable function `useExecuteQueryByWidgetId` for executing queries by widget ID using the Sisense SDK.
It simplifies the process of fetching data related to a specific widget based on provided parameters and manages
the query's loading, success, and error states. This composable integrates with the Sisense application context
to perform queries and handle their results within Vue components.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`MaybeRefOrWithRefs`](../type-aliases/type-alias.MaybeRefOrWithRefs.md)\< [`ExecuteQueryByWidgetIdParams`](../interfaces/interface.ExecuteQueryByWidgetIdParams.md) \> | Parameters for executing the query, including widget ID, filters,<br />and other relevant query options. The `filters` parameter allows for specifying dynamic filters for the query. |

## Returns

`ToRefs`\< [`QueryByWidgetIdState`](../../sdk-ui/type-aliases/type-alias.QueryByWidgetIdState.md) \>

## Example

Here's how to use `useExecuteQueryByWidgetId` within a Vue component:
```vue
<script setup>
import { ref } from 'vue';
import { useExecuteQueryByWidgetId } from './composables/useExecuteQueryByWidgetId';

const widgetId = ref('your_widget_id_here');
const filters = ref([...]); // Define filters if necessary

const { data, isLoading, isError, isSuccess, error } = useExecuteQueryByWidgetId({
  widgetId,
  filters,
  enabled: true, // Optional: Use to enable/disable the query execution
});
</script>
```

This composable returns an object containing reactive state management properties for the query:
- `data`: The result of the query, undefined until the query completes successfully.
- `isLoading`: A boolean indicating if the query is currently loading.
- `isError`: A boolean indicating if an error occurred during the query execution.
- `isSuccess`: A boolean indicating if the query executed successfully.
- `error`: An Error object containing the error details if an error occurred.
- `query`: The query object returned by the SDK, useful for debugging or advanced handling.

Utilizing this composable allows for declarative and reactive handling of widget-specific queries within Vue applications,
facilitating easier data fetching and state management with the Sisense SDK.
