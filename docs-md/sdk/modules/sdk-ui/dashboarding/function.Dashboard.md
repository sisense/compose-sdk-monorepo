---
title: Dashboard
---

# Function Dashboard <Badge type="beta" text="Beta" />

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

Example of rendering a Fusion dashboard using the `useGetDashboardModel hook and the `Dashboard` component.

```ts
import { Dashboard, useGetDashboardModel, dashboardModelTranslator } from '@sisense/sdk-ui';

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
