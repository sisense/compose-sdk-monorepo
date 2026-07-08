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
| `Props` *extends* [`CustomWidgetComponentProps`](../interfaces/interface.CustomWidgetComponentProps.md)\< [`GenericDataOptions`](../type-aliases/type-alias.GenericDataOptions.md), [`CustomWidgetStyleOptions`](../../sdk-ui/type-aliases/type-alias.CustomWidgetStyleOptions.md), [`AbstractDataPointWithEntries`](../../sdk-ui/type-aliases/type-alias.AbstractDataPointWithEntries.md) \> | [`CustomWidgetComponentProps`](../interfaces/interface.CustomWidgetComponentProps.md)\< [`GenericDataOptions`](../type-aliases/type-alias.GenericDataOptions.md), [`CustomWidgetStyleOptions`](../../sdk-ui/type-aliases/type-alias.CustomWidgetStyleOptions.md), [`AbstractDataPointWithEntries`](../../sdk-ui/type-aliases/type-alias.AbstractDataPointWithEntries.md) \> |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `customWidgetType` | `string` | The unique identifier for the custom widget type. |
| `customWidget` | [`CustomWidgetComponent`](../type-aliases/type-alias.CustomWidgetComponent.md)\< `Props` \> | The custom widget component to register. |

#### Returns

`void`

### `unregisterCustomWidget`

**unregisterCustomWidget**: (`customWidgetType`) => `void`

Unregisters a custom widget for the given type name.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `customWidgetType` | `string` | The unique identifier for the custom widget type. |

#### Returns

`void`

## Example

How to use `useCustomWidgets` to register a custom widget in a dashboard:
```vue
<script setup lang="ts">
import { onUnmounted } from 'vue';
import { useCustomWidgets, DashboardById } from '@sisense/sdk-ui-vue';
import CustomHistogramWidget from './custom-histogram-widget';

const { registerCustomWidget, unregisterCustomWidget } = useCustomWidgets();
registerCustomWidget('histogramwidget', CustomHistogramWidget);
// Optionally unregister on unmount (e.g. if the widget should only be available within this component)
onUnmounted(() => unregisterCustomWidget('histogramwidget'));

</script>
<template>
 <DashboardById dashboardOid="your-dashboard-oid" />
</template>
```
