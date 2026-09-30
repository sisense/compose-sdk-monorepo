---
title: toDashboardProps
---

# Function toDashboardProps

> **toDashboardProps**(`dashboardModel`): [`DashboardProps`](../../../interfaces/interface.DashboardProps.md)

Translates [DashboardModel](../../interface.DashboardModel.md) to [DashboardProps](../../../interfaces/interface.DashboardProps.md).

Narrative widgets are handed the dashboard's `oid` as their `dashboardId`.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `dashboardModel` | [`DashboardModel`](../../interface.DashboardModel.md) | The dashboard model to translate. |

## Returns

[`DashboardProps`](../../../interfaces/interface.DashboardProps.md)

Props for the `Dashboard` component.

## Example

```ts
<Dashboard {...dashboardModelTranslator.toDashboardProps(dashboardModel)} />
```
