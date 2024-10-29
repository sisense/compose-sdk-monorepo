---
title: useFetch
---

# Function useFetch <Badge type="fusionEmbed" text="Fusion Embed" />

> **useFetch**<`TData`>(
  `path`,
  `init`?,
  `options`?): `ToRefs`\< `DataState`\< `TData` \> \>

A Vue composable function `useFetch` that allows to make authorized fetch request to any Sisense API.

## Type parameters

| Parameter | Default |
| :------ | :------ |
| `TData` | `unknown` |

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `path` | [`MaybeRef`](../type-aliases/type-alias.MaybeRef.md)\< `string` \> | The endpoint path to fetch data from. This should be a relative path like '/api/v1/endpoint' |
| `init`? | [`MaybeRefOrWithRefs`](../type-aliases/type-alias.MaybeRefOrWithRefs.md)\< `RequestInit` \> | The request init object |
| `options`? | [`MaybeRefOrWithRefs`](../type-aliases/type-alias.MaybeRefOrWithRefs.md)\< [`UseFetchOptions`](../type-aliases/type-alias.UseFetchOptions.md) \> | The additional request options |

## Returns

`ToRefs`\< `DataState`\< `TData` \> \>

## Example

How to use `useFetch` within a Vue component to fetch and display widget information:
```vue
<script setup>
import { ref } from "vue";
import { useFetch } from "./composables/useFetch";

const enabled = ref(true);
const { data, isLoading, isError, error } = useFetch(
  "api/v1/elasticubes/getElasticubes",
  {
    method: "POST",
  },
  {
    enabled,
  });
</script>
```

The composable returns an object with reactive properties that represent the state of the data fetch operation:
- `data`: The fetched data, which is `undefined` until the operation is successfully completed.
- `isLoading`: A boolean indicating whether the fetch operation is currently in progress.
- `isError`: A boolean indicating whether an error occurred during the fetch operation.
- `isSuccess`: A boolean indicating whether the fetch operation was successfully completed without any errors.
- `error`: An error object containing details about any errors that occurred during the fetch operation.
