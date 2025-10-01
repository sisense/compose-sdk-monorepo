---
title: useCustomWidgets
---

# Function useCustomWidgets

> **useCustomWidgets**(): `object`

Vue composable function for working with custom widgets

## Returns

### `hasCustomWidget`

**hasCustomWidget**: (`customWidgetType`) => `boolean`

Checks if a custom widget is registered.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `customWidgetType` | `string` | The type of the custom widget. |

#### Returns

`boolean`

True if the custom widget is registered, false otherwise.

### `registerCustomWidget`

**registerCustomWidget**: <`Props`>(`customWidgetType`, `customWidget`) => `void`

Registers a new custom widget.

#### Type parameters

| Parameter | Default |
| :------ | :------ |
| `Props` *extends* [`CustomWidgetComponentProps`](../interfaces/interface.CustomWidgetComponentProps.md)\< [`GenericDataOptions`](../type-aliases/type-alias.GenericDataOptions.md), `any`, `Props` \> | [`CustomWidgetComponentProps`](../interfaces/interface.CustomWidgetComponentProps.md)\< [`GenericDataOptions`](../type-aliases/type-alias.GenericDataOptions.md), `any` \> |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `customWidgetType` | `string` | The unique identifier for the custom widget type. |
| `customWidget` | [`CustomWidgetComponent`](../type-aliases/type-alias.CustomWidgetComponent.md)\< `Props` \> | The custom widget component to register. |

#### Returns

`void`

## Example

How to use `useCustomWidgets` to register a custom widget in a dashboard:
```vue
<script setup lang="ts">
import { useCustomWidgets, DashboardById } from '@ethings-os/sdk-ui-vue';
import CustomHistogramWidget from './custom-histogram-widget';

const { registerCustomWidget } = useCustomWidgets();
registerCustomWidget('histogramwidget', CustomHistogramWidget);

</script>
<template>
 <DashboardById dashboardOid="your-dashboard-oid" />
</template>
```
