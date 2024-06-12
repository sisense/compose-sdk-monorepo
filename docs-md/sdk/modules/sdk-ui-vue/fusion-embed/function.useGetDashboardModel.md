---
title: useGetDashboardModel
---

# Function useGetDashboardModel <Badge type="fusionEmbed" text="Fusion Embed" />

> **useGetDashboardModel**(`params`): `ToRefs`\< [`DashboardModelState`](../../sdk-ui/type-aliases/type-alias.DashboardModelState.md) \>

A Vue composable function `useGetDashboardModel` for fetching a Sisense dashboard model.
It simplifies the process of retrieving detailed dashboard data, including widgets if specified,
by managing the loading, success, and error states of the request. This composable is especially useful
for Vue applications that need to integrate Sisense dashboard analytics, providing a reactive way to fetch
and display dashboard data.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`MaybeRefOrWithRefs`](../type-aliases/type-alias.MaybeRefOrWithRefs.md)\< [`GetDashboardModelParams`](../interfaces/interface.GetDashboardModelParams.md) \> | The parameters for fetching the dashboard model, including the<br />dashboard OID and an option to include widgets within the dashboard. Supports dynamic parameter values through<br />Vue refs, allowing for reactive dashboard loading based on user interactions or other application states. |

## Returns

`ToRefs`\< [`DashboardModelState`](../../sdk-ui/type-aliases/type-alias.DashboardModelState.md) \>

## Example

How to use `useGetDashboardModel` within a Vue component to fetch and display a Sisense dashboard:
```vue
<script setup>
import { ref } from 'vue';
import { useGetDashboardModel } from './composables/useGetDashboardModel';

const dashboardOid = ref('your_dashboard_oid');
const includeWidgets = ref(true); // Decide whether to include widgets in the dashboard model

const { data: dashboardModel, isLoading, isError, error } = useGetDashboardModel({
  dashboardOid,
  includeWidgets,
});
</script>
```

The composable returns an object with reactive properties to manage the state of the dashboard model fetching process:
- `dashboard`: The fetched dashboard model data, which is `undefined` until the fetch completes successfully.
- `isLoading`: Indicates if the dashboard model is currently being fetched.
- `isError`: Indicates if an error occurred during the fetch process.
- `isSuccess`: Indicates if the dashboard model was successfully fetched without errors.
- `error`: Contains the error object if an error occurred during the fetch.

Utilizing this composable enables developers to declaratively integrate Sisense dashboard analytics into their Vue applications,
managing data fetching and state with minimal boilerplate code.
