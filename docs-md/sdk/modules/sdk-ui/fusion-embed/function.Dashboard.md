---
title: Dashboard
---

# Function Dashboard <Badge type="fusionEmbed" text="Fusion Embed" /> <Badge type="alpha" text="Alpha" />

> **Dashboard**(`props`): `null` \| `ReactElement`\< `any`, `any` \>

React component that renders a dashboard whose elements are customizable. It includes internal logic of applying common filters to widgets.

**Note:** Dashboard extensions based on JS scripts and add-ons in Fusion are not supported.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `props` | [`DashboardProps`](../interfaces/interface.DashboardProps.md) |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

## Example

```ts
import { Dashboard, useGetDashboardModel } from '@sisense/sdk-ui';

const CodeExample = () => {
 const { dashboard } = useGetDashboardModel({
   dashboardOid: '65a82171719e7f004018691c',
   includeFilters: true,
   includeWidgets: true,
 });

 return (
   <>
     {dashboard && (
       <Dashboard
       defaultDataSource={dashboard.dataSource}
       title={dashboard.title}
       layout={dashboard.layout}
       styleOptions={dashboard.styleOptions}
       widgets={dashboard.widgets}
       filters={dashboard.filters}
       widgetFilterOptions={
         dashboard.widgetFilterOptions
       }
       />
     )}
   </>
 );
};

export default CodeExample;
```
