---
title: DashboardService
---

# Class DashboardService <Badge type="fusionEmbed" text="Fusion Embed" />

Service for working with Sisense Fusion dashboards.

**Note:** Dashboard and Widget extensions based on JS scripts and add-ons in Fusion – for example, Blox and Jump To Dashboard – are not supported.

## Constructors

### constructor

> **new DashboardService**(`sisenseContextService`): [`DashboardService`](class.DashboardService.md)

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](../contexts/class.SisenseContextService.md) |

#### Returns

[`DashboardService`](class.DashboardService.md)

## Methods

### getDashboardModel

> **getDashboardModel**(`dashboardOid`, `options`?): `Promise`\< [`DashboardModel`](interface.DashboardModel.md) \>

Retrieves an existing dashboard model from the Sisense instance.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `dashboardOid` | `string` | Identifier of the dashboard |
| `options`? | [`GetDashboardModelOptions`](../interfaces/interface.GetDashboardModelOptions.md) | Advanced configuration options |

#### Returns

`Promise`\< [`DashboardModel`](interface.DashboardModel.md) \>

Dashboard model

***

### getDashboardModels

> **getDashboardModels**(`options`?): `Promise`\< [`DashboardModel`](interface.DashboardModel.md)[] \>

Retrieves existing dashboard models from the Sisense instance.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `options`? | [`GetDashboardModelsOptions`](../interfaces/interface.GetDashboardModelsOptions.md) | Advanced configuration options |

#### Returns

`Promise`\< [`DashboardModel`](interface.DashboardModel.md)[] \>

Dashboard models array
