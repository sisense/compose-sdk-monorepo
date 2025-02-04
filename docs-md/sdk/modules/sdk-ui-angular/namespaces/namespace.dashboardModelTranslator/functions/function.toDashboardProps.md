---
title: toDashboardProps
---

# Function toDashboardProps <Badge type="fusionEmbed" text="Fusion Embed" />

> **toDashboardProps**(`dashboardModel`): [`DashboardProps`](../../../../sdk-ui/interfaces/interface.DashboardProps.md)

Translates [DashboardModel](../../../fusion-assets/interface.DashboardModel.md) to [DashboardProps](../../../interfaces/interface.DashboardProps.md).

## Parameters

| Parameter | Type |
| :------ | :------ |
| `dashboardModel` | [`DashboardModel`](../../../fusion-assets/interface.DashboardModel.md) |

## Returns

[`DashboardProps`](../../../../sdk-ui/interfaces/interface.DashboardProps.md)

## Example

```ts
<Dashboard {...dashboardModelTranslator.toDashboardProps(dashboardModel)} />
```
