---
title: useGetDashboardModels
---

# Function useGetDashboardModels

> **useGetDashboardModels**(...`args`): [`DashboardModelsState`](../type-aliases/type-alias.DashboardModelsState.md)

React hook that retrieves existing dashboards that the user can access to from the Sisense instance.

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`GetDashboardModelsParams`](../interfaces/interface.GetDashboardModelsParams.md)] |

## Returns

[`DashboardModelsState`](../type-aliases/type-alias.DashboardModelsState.md)

Load state that contains the status of the execution, the result dashboards, or the error if any

## Example

```ts
const { dashboards, isLoading, isError } = useGetDashboardModels();
if (isLoading) {
  return <div>Loading...</div>;
}
if (isError) {
  return <div>Error</div>;
}
if (dashboards) {
  return <div>{`Total Dashboards: ${dashboards.length}`}</div>;
}
return null;
```
