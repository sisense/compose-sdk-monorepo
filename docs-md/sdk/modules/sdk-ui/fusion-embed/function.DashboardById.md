---
title: DashboardById
---

# Function DashboardById <Badge type="fusionEmbed" text="Fusion Embed" /> <Badge type="alpha" text="Alpha" />

> **DashboardById**(`props`): `null` \| `ReactElement`\< `any`, `any` \>

React component that renders a dashboard created in Sisense Fusion by its ID.

**Note:** Dashboard extensions based on JS scripts and add-ons in Fusion are not supported.

## Parameters

| Parameter | Type |
| :------ | :------ |
| `props` | [`DashboardByIdProps`](../interfaces/interface.DashboardByIdProps.md) |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

## Example

```ts
import { DashboardById } from '@sisense/sdk-ui';

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
