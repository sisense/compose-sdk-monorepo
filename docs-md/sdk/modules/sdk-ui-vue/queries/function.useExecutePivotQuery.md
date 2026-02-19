---
title: useExecutePivotQuery
---

# Function useExecutePivotQuery

> **useExecutePivotQuery**(`params`): `ToRefs`\< [`PivotQueryState`](../../sdk-ui/type-aliases/type-alias.PivotQueryState.md) \>

A Vue composable function `useExecutePivotQuery` that executes a pivot data query.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`MaybeRefOrWithRefs`](../type-aliases/type-alias.MaybeRefOrWithRefs.md)\< [`ExecutePivotQueryParams`](../../sdk-ui/interfaces/interface.ExecutePivotQueryParams.md) \> | The parameters for the query, supporting reactive Vue refs.<br />Includes details such as `dataSource`, `dimensions`, `rows`, `columns`, `values`, `filters` and more, allowing for comprehensive<br />query configuration. The `filters` parameter supports dynamic filtering based on user interaction or other application<br />state changes. |

## Returns

`ToRefs`\< [`PivotQueryState`](../../sdk-ui/type-aliases/type-alias.PivotQueryState.md) \>

## Example

How to use `useExecutePivotQuery` within a Vue component:
```vue
<script setup>
import { ref } from 'vue';
import { useExecutePivotQuery } from '@sisense/sdk-ui-vue';

const dataSource = ref('your_data_source_id');
// Set up other query parameters as needed (dimensions, rows, columns, values, filters, etc.)

const { data, isLoading, isError, isSuccess, error } = useExecutePivotQuery({
  dataSource,
  columns: [...],
  rows: [...],
  values: [...],
  filters: [...],
  // Additional query parameters
});
</script>
```

The composable returns an object with the following reactive properties to manage the query state:
- `data`: The Pivot query result data set returned from the query. It remains `undefined` until the query completes successfully.
- `isLoading`: Indicates if the query is in progress.
- `isError`: Indicates if an error occurred during query execution.
- `isSuccess`: Indicates if the query executed successfully without errors.
- `error`: Contains the error object if an error occurred during the query.

This composable facilitates integrating Sisense data fetching into Vue applications, enabling developers
to easily manage query states and dynamically adjust query parameters based on application needs.
