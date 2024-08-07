---
title: useGetDashboardModel
---

# Function useGetDashboardModel <Badge type="fusionEmbed" text="Fusion Embed" />

> **useGetDashboardModel**(...`args`): [`DashboardModelState`](../type-aliases/type-alias.DashboardModelState.md)

React hook that retrieves an existing dashboard model from the Sisense instance.

**Note:** Dashboard extensions based on JS scripts and add-ons in Fusion are not supported.

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`GetDashboardModelParams`](../interfaces/interface.GetDashboardModelParams.md)] |

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
