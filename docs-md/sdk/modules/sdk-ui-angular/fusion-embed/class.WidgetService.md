---
title: WidgetService
---

# Class WidgetService <Badge type="fusionEmbed" text="Fusion Embed" />

Service for working with Sisense Fusion widgets.

## Constructors

### constructor

> **new WidgetService**(`sisenseContextService`): [`WidgetService`](class.WidgetService.md)

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](../contexts/class.SisenseContextService.md) |

#### Returns

[`WidgetService`](class.WidgetService.md)

## Methods

### getWidgetModel

> **getWidgetModel**(`params`): `Promise`\< [`WidgetModel`](class.WidgetModel.md) \>

Retrieves an existing widget model from the Sisense instance.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`GetWidgetModelParams`](../../sdk-ui/interfaces/interface.GetWidgetModelParams.md) | Parameters to identify the target widget |

#### Returns

`Promise`\< [`WidgetModel`](class.WidgetModel.md) \>

Widget model
