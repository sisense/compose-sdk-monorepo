---
title: HierarchyService
---

# Class HierarchyService <Badge type="fusionEmbed" text="Fusion Embed" />

Service for working with Sisense Fusion hierarchies.

## Constructors

### constructor

> **new HierarchyService**(`sisenseContextService`): [`HierarchyService`](class.HierarchyService.md)

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](../contexts/class.SisenseContextService.md) |

#### Returns

[`HierarchyService`](class.HierarchyService.md)

## Methods

### getHierarchyModels

> **getHierarchyModels**(`params`): `Promise`\< [`HierarchyModel`](../interfaces/interface.HierarchyModel.md)[] \>

Retrieves existing hierarchy models from the Sisense instance.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`GetHierarchyModelsParams`](../interfaces/interface.GetHierarchyModelsParams.md) | Parameters to identify the target hierarchy models |

#### Returns

`Promise`\< [`HierarchyModel`](../interfaces/interface.HierarchyModel.md)[] \>

Hierarchy models array
