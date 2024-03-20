---
title: useExecuteQuery
---

# Function useExecuteQuery

> **useExecuteQuery**(`params`): `ToRefs`\< [`QueryState`](../../sdk-ui/type-aliases/type-alias.QueryState.md) \>

A Vue composable function `useExecuteQuery` for executing Sisense queries with flexible parameters.
It handles query execution, including loading, error, and success states, and enables dynamic query configuration
through reactive parameters. This composable is particularly useful for applications requiring data from Sisense
analytics, offering a reactive and declarative approach to data fetching and state management.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`MaybeWithRefs`](../type-aliases/type-alias.MaybeWithRefs.md)\< [`ExecuteQueryParams`](../interfaces/interface.ExecuteQueryParams.md) \> | The parameters for the query, supporting reactive Vue refs.<br />Includes details such as `dataSource`, `dimensions`, `measures`, `filters`, and more, allowing for comprehensive<br />query configuration. The `filters` parameter supports dynamic filtering based on user interaction or other application<br />state changes. |

## Returns

`ToRefs`\< [`QueryState`](../../sdk-ui/type-aliases/type-alias.QueryState.md) \>

## Example

How to use `useExecuteQuery` within a Vue component:
```vue
<script setup>
import { ref } from 'vue';
import { useExecuteQuery } from './composables/useExecuteQuery';

const dataSource = ref('your_data_source_id');
// Set up other query parameters as needed (dimensions, measures, filters, etc.)

const { data, isLoading, isError, isSuccess, error } = useExecuteQuery({
  dataSource,
  dimensions: [...],
  measures: [...],
  filters: [...],
  // Additional query parameters
});
</script>
```

The composable returns an object with the following reactive properties to manage the query state:
- `data`: The data returned from the query. It remains `undefined` until the query completes successfully.
- `isLoading`: Indicates if the query is in progress.
- `isError`: Indicates if an error occurred during query execution.
- `isSuccess`: Indicates if the query executed successfully without errors.
- `error`: Contains the error object if an error occurred during the query.

This composable facilitates integrating Sisense data fetching into Vue applications, enabling developers
to easily manage query states and dynamically adjust query parameters based on application needs.
