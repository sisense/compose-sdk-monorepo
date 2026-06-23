---
title: useExecuteQuery
---

# Function useExecuteQuery

> **useExecuteQuery**(`params`): \{
  `data`: `Ref`\< [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md) \| `undefined` \>;
  `error`: `Ref`\< `undefined` \>;
  `isError`: `Ref`\< `false` \>;
  `isLoading`: `Ref`\< `true` \>;
  `isSuccess`: `Ref`\< `false` \>;
  `rowCount`: `Ref`\< `number` \| `undefined` \>;
  `status`: `Ref`\< `"loading"` \>;
 } \| \{
  `data`: `Ref`\< `undefined` \>;
  `error`: `Ref`\< `Error` \>;
  `isError`: `Ref`\< `true` \>;
  `isLoading`: `Ref`\< `false` \>;
  `isSuccess`: `Ref`\< `false` \>;
  `rowCount`: `Ref`\< `number` \| `undefined` \>;
  `status`: `Ref`\< `"error"` \>;
 } \| \{
  `data`: `Ref`\< [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md) \>;
  `error`: `Ref`\< `undefined` \>;
  `isError`: `Ref`\< `false` \>;
  `isLoading`: `Ref`\< `false` \>;
  `isSuccess`: `Ref`\< `true` \>;
  `rowCount`: `Ref`\< `number` \| `undefined` \>;
  `status`: `Ref`\< `"success"` \>;
 }

A Vue composable function `useExecuteQuery` for executing Sisense queries with flexible parameters.
It handles query execution, including loading, error, and success states, and enables dynamic query configuration
through reactive parameters. This composable is particularly useful for applications requiring data from Sisense
analytics, offering a reactive and declarative approach to data fetching and state management.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`MaybeRefOrWithRefs`](../type-aliases/type-alias.MaybeRefOrWithRefs.md)\< [`ExecuteQueryParams`](../interfaces/interface.ExecuteQueryParams.md) \> | The parameters for the query, supporting reactive Vue refs.<br />Includes details such as `dataSource`, `dimensions`, `measures`, `filters`, and more, allowing for comprehensive<br />query configuration. The `filters` parameter supports dynamic filtering based on user interaction or other application<br />state changes. |

## Returns

\{
  `data`: `Ref`\< [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md) \| `undefined` \>;
  `error`: `Ref`\< `undefined` \>;
  `isError`: `Ref`\< `false` \>;
  `isLoading`: `Ref`\< `true` \>;
  `isSuccess`: `Ref`\< `false` \>;
  `rowCount`: `Ref`\< `number` \| `undefined` \>;
  `status`: `Ref`\< `"loading"` \>;
 } \| \{
  `data`: `Ref`\< `undefined` \>;
  `error`: `Ref`\< `Error` \>;
  `isError`: `Ref`\< `true` \>;
  `isLoading`: `Ref`\< `false` \>;
  `isSuccess`: `Ref`\< `false` \>;
  `rowCount`: `Ref`\< `number` \| `undefined` \>;
  `status`: `Ref`\< `"error"` \>;
 } \| \{
  `data`: `Ref`\< [`QueryResultData`](../../sdk-data/interfaces/interface.QueryResultData.md) \>;
  `error`: `Ref`\< `undefined` \>;
  `isError`: `Ref`\< `false` \>;
  `isLoading`: `Ref`\< `false` \>;
  `isSuccess`: `Ref`\< `true` \>;
  `rowCount`: `Ref`\< `number` \| `undefined` \>;
  `status`: `Ref`\< `"success"` \>;
 }

## Example

How to use `useExecuteQuery` within a Vue component:
```vue
<script setup>
import { ref } from 'vue';
import { useExecuteQuery } from '@sisense/sdk-ui-vue';

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
- `rowCount`: The total row count of the query result, ignoring the `count` and `offset` paging.
Populated only when `includeRowCount` is enabled in the params and the Sisense instance supports
the row count API (`@beta`); `undefined` otherwise.

This composable facilitates integrating Sisense data fetching into Vue applications, enabling developers
to easily manage query states and dynamically adjust query parameters based on application needs.
