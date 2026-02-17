---
title: CustomWidgetsService
---

# Class CustomWidgetsService

Service for working with custom widgets.

## Constructors

### constructor

> **new CustomWidgetsService**(): [`CustomWidgetsService`](class.CustomWidgetsService.md)

#### Returns

[`CustomWidgetsService`](class.CustomWidgetsService.md)

## Methods

### hasCustomWidget

> **hasCustomWidget**(`customWidgetType`): `boolean`

Checks if a custom widget is registered.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `customWidgetType` | `string` | The type of the custom widget. |

#### Returns

`boolean`

True if the custom widget is registered, false otherwise.

***

### registerCustomWidget

> **registerCustomWidget**<`Props`>(`customWidgetType`, `customWidget`): `void`

Registers a new custom widget.

#### Type parameters

| Parameter | Default |
| :------ | :------ |
| `Props` *extends* [`CustomWidgetComponentProps`](../interfaces/interface.CustomWidgetComponentProps.md)\< [`GenericDataOptions`](../type-aliases/type-alias.GenericDataOptions.md), [`CustomWidgetStyleOptions`](../../sdk-ui/type-aliases/type-alias.CustomWidgetStyleOptions.md), [`AbstractDataPointWithEntries`](../../sdk-ui/type-aliases/type-alias.AbstractDataPointWithEntries.md), `Props` \> | [`CustomWidgetComponentProps`](../interfaces/interface.CustomWidgetComponentProps.md)\< [`GenericDataOptions`](../type-aliases/type-alias.GenericDataOptions.md), [`CustomWidgetStyleOptions`](../../sdk-ui/type-aliases/type-alias.CustomWidgetStyleOptions.md), [`AbstractDataPointWithEntries`](../../sdk-ui/type-aliases/type-alias.AbstractDataPointWithEntries.md) \> |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `customWidgetType` | `string` | The unique identifier for the custom widget type. |
| `customWidget` | [`CustomWidgetComponent`](../type-aliases/type-alias.CustomWidgetComponent.md)\< `Props` \> | The custom widget component class to register. |

#### Returns

`void`
