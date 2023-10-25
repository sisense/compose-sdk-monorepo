---
title: useGetDashboardModel
---

# Function useGetDashboardModel

> **useGetDashboardModel**(`params`): [`DashboardModelState`](../type-aliases/type-alias.DashboardModelState.md)

React hook that retrieves an existing dashboard model from the Sisense instance.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`GetDashboardModelParams`](../interfaces/interface.GetDashboardModelParams.md) | Parameters of the dashboard to be retrieved |

## Returns

[`DashboardModelState`](../type-aliases/type-alias.DashboardModelState.md)

Dashboard load state that contains the status of the execution, the result dashboard model, or the error if any

## Example

An example of retrieving an existing dashboard model from the Sisense instance and render its widgets with component `DashboardWidget`:
```ts
 const { dashboard, isLoading, isError } = useGetDashboardModel({
   dashboardOid: '6448665edac1920034bce7a8',
   includeWidgets: true,
 });
 if (isLoading) {
   return <div>Loading...</div>;
 }
 if (isError) {
   return <div>Error</div>;
 }
 if (dashboard) {
   return (
     <div>
       {`Dashboard Title - ${dashboard.title}`}
       {dashboard.widgets?.map((widget) => (
         <DashboardWidget key={widget.oid} widgetOid={widget.oid} dashboardOid={dashboard.oid} />
       ))}
     </div>
   );
 }
 return null;
```
