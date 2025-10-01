---
title: Dashboard
---

# Function Dashboard

> **Dashboard**(`props`): `ReactElement`\< `any`, `any` \> \| `null`

React component that renders a dashboard whose elements are customizable. It includes internal logic of applying common filters to widgets.

**Note:** Dashboard and Widget extensions based on JS scripts and add-ons in Fusion – for example, Blox and Jump To Dashboard – are not supported.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `props` | [`DashboardProps`](../interfaces/interface.DashboardProps.md) |

## Returns

`ReactElement`\< `any`, `any` \> \| `null`

## Example

Example of rendering a Fusion dashboard using the `useGetDashboardModel hook and the `Dashboard` component.

```ts
import { Dashboard, useGetDashboardModel, dashboardModelTranslator } from '@ethings-os/sdk-ui';

const CodeExample = () => {
 const { dashboard } = useGetDashboardModel({
   dashboardOid: '65a82171719e7f004018691c',
   includeFilters: true,
   includeWidgets: true,
 });

 return (
   <>
     {dashboard && (
       <Dashboard {...dashboardModelTranslator.toDashboardProps(dashboard)} />
     )}
   </>
 );
};

export default CodeExample;
```

To learn more about this and related dashboard components,
see [Embedded Dashboards](/guides/sdk/guides/dashboards/index.html).
