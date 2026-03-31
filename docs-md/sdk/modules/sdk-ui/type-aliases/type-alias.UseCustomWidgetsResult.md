---
title: UseCustomWidgetsResult
---

# Type alias UseCustomWidgetsResult

> **UseCustomWidgetsResult**: `object`

Result of the `useCustomWidgets` hook.

## Type declaration

### `getCustomWidget`

**getCustomWidget**: (`customWidgetType`) => [`CustomWidgetComponent`](type-alias.CustomWidgetComponent.md) \| `undefined`

Gets a custom widget.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `customWidgetType` | `string` |

#### Returns

[`CustomWidgetComponent`](type-alias.CustomWidgetComponent.md) \| `undefined`

***

### `hasCustomWidget`

**hasCustomWidget**: (`customWidgetType`) => `boolean`

Checks if a custom widget is registered.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `customWidgetType` | `string` |

#### Returns

`boolean`

***

### `registerCustomWidget`

**registerCustomWidget**: <`T`>(`customWidgetType`, `customWidget`) => `void`

Registers a custom widget.

#### Type parameters

| Parameter | Default |
| :------ | :------ |
| `T` | [`CustomWidgetComponentProps`](../interfaces/interface.CustomWidgetComponentProps.md) |

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `customWidgetType` | `string` |
| `customWidget` | [`CustomWidgetComponent`](type-alias.CustomWidgetComponent.md)\< `T` \> |

#### Returns

`void`
