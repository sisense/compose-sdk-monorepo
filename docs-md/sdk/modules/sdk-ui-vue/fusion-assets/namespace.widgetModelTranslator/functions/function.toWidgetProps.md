---
title: toWidgetProps
---

# Function toWidgetProps

> **toWidgetProps**(`widgetModel`): [`WidgetProps`](../../../type-aliases/type-alias.WidgetProps.md)

Translates [WidgetModel](../../interface.WidgetModel.md) to [WidgetProps](../../../type-aliases/type-alias.WidgetProps.md).

## Parameters

| Parameter | Type |
| :------ | :------ |
| `widgetModel` | [`WidgetModel`](../../interface.WidgetModel.md) |

## Returns

[`WidgetProps`](../../../type-aliases/type-alias.WidgetProps.md)

## Example

```vue
<script setup lang="ts">
import { widgetModelTranslator, useGetWidgetModel, Widget } from '@sisense/sdk-ui-vue';
import { computed } from 'vue';

const { data: widgetModel } = useGetWidgetModel({
  dashboardOid: 'your-dashboard-oid',
  widgetOid: 'your-widget-oid',
});

const widgetProps = computed(() =>
  widgetModel.value ? widgetModelTranslator.toWidgetProps(widgetModel.value) : null,
);
</script>

<template>
  <Widget v-if="widgetProps" v-bind="widgetProps" />
</template>
```
