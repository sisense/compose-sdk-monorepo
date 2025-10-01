---
title: DashboardById
---

# Function DashboardById <Badge type="fusionEmbed" text="Fusion Embed" />

> **DashboardById**(`props`): `ReactElement`\< `any`, `any` \> \| `null`

React component that renders a dashboard created in Sisense Fusion by its ID.

**Note:** Dashboard and Widget extensions based on JS scripts and add-ons in Fusion – for example, Blox and Jump To Dashboard – are not supported.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `props` | [`DashboardByIdProps`](../interfaces/interface.DashboardByIdProps.md) |

## Returns

`ReactElement`\< `any`, `any` \> \| `null`

## Example

```ts
import { DashboardById } from '@ethings-os/sdk-ui';

 const CodeExample = () => {
   return (
     <>
       <DashboardById
         dashboardOid="65a82171719e7f004018691c"
       />
     </>
   );
 };

 export default CodeExample;
```

To learn more about this and related dashboard components,
see [Embedded Dashboards](/guides/sdk/guides/dashboards/index.html).
