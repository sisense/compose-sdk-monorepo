---
title: toDashboardProps
---

# Function toDashboardProps <Badge type="fusionEmbed" text="Fusion Embed" />

> **toDashboardProps**(`dashboardModel`): `Required`\< [`DashboardProps`](../../../interfaces/interface.DashboardProps.md) \>

Translates [DashboardModel](../../interface.DashboardModel.md) to [DashboardProps](../../../interfaces/interface.DashboardProps.md).

## Parameters

| Parameter | Type |
| :------ | :------ |
| `dashboardModel` | [`DashboardModel`](../../interface.DashboardModel.md) |

## Returns

`Required`\< [`DashboardProps`](../../../interfaces/interface.DashboardProps.md) \>

## Example

```ts
<Dashboard {...dashboardModelTranslator.toDashboardProps(dashboardModel)} />
```
