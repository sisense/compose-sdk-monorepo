---
title: DashboardService
---

# Class DashboardService <Badge type="fusionEmbed" text="Fusion Embed" />

Service for working with Sisense Fusion dashboards.

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

> **getDashboardModel**(`dashboardOid`, `options`?): `Promise`\< [`DashboardModel`](../type-aliases/type-alias.DashboardModel.md) \>

Retrieves an existing dashboard model from the Sisense instance.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `dashboardOid` | `string` | Identifier of the dashboard |
| `options`? | [`GetDashboardModelOptions`](../interfaces/interface.GetDashboardModelOptions.md) | Advanced configuration options |

#### Returns

`Promise`\< [`DashboardModel`](../type-aliases/type-alias.DashboardModel.md) \>

Dashboard model

***

### getDashboardModels

> **getDashboardModels**(`options`?): `Promise`\< [`DashboardModel`](../type-aliases/type-alias.DashboardModel.md)[] \>

Retrieves existing dashboard models from the Sisense instance.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `options`? | [`GetDashboardModelsOptions`](../interfaces/interface.GetDashboardModelsOptions.md) | Advanced configuration options |

#### Returns

`Promise`\< [`DashboardModel`](../type-aliases/type-alias.DashboardModel.md)[] \>

Dashboard models array
