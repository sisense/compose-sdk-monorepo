---
title: useExecuteCsvQuery
---

# Function useExecuteCsvQuery

> **useExecuteCsvQuery**(`params`): `ToRefs`\< [`CsvQueryState`](../../sdk-ui/type-aliases/type-alias.CsvQueryState.md) \>

A Vue composable function `useExecuteCsvQuery` that executes a CSV data query.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`MaybeRefOrWithRefs`](../type-aliases/type-alias.MaybeRefOrWithRefs.md)\< [`ExecuteCsvQueryParams`](../../sdk-ui/interfaces/interface.ExecuteCsvQueryParams.md) \> | The parameters for the query, supporting reactive Vue refs.<br />Includes details such as `dataSource`, `dimensions`, `measures`, `filters`, and more, allowing for comprehensive<br />query configuration. The `filters` parameter supports dynamic filtering based on user interaction or other application<br />state changes. |

## Returns

`ToRefs`\< [`CsvQueryState`](../../sdk-ui/type-aliases/type-alias.CsvQueryState.md) \>

## Example

How to use `useExecuteCsvQuery` within a Vue component:
```vue
<script setup>
import { ref } from 'vue';
import { useExecuteCsvQuery } from '@sisense/sdk-ui-vue';

const dataSource = ref('your_data_source_id');
// Set up other query parameters as needed (dimensions, measures, filters, etc.)

const { data, isLoading, isError, isSuccess, error } = useExecuteCsvQuery({
  dataSource,
  dimensions: [...],
  measures: [...],
  filters: [...],
  config: { asDataStream: false },
  // Additional query parameters
});
</script>
```

The composable returns an object with the following reactive properties to manage the query state:
- `data`: The CSV data (string or Blob) returned from the query. It remains `undefined` until the query completes successfully.
- `isLoading`: Indicates if the query is in progress.
- `isError`: Indicates if an error occurred during query execution.
- `isSuccess`: Indicates if the query executed successfully without errors.
- `error`: Contains the error object if an error occurred during the query.

This composable facilitates integrating Sisense data fetching into Vue applications, enabling developers
to easily manage query states and dynamically adjust query parameters based on application needs.
