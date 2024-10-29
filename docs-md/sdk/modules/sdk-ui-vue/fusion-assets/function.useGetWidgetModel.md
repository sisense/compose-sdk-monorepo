---
title: useGetWidgetModel
---

# Function useGetWidgetModel <Badge type="fusionEmbed" text="Fusion Embed" />

> **useGetWidgetModel**(`params`): `ToRefs`\< `DataState`\< [`WidgetModel`](interface.WidgetModel.md) \> \>

A Vue composable function `useGetWidgetModel` for retrieving widget models from a Sisense dashboard.
It is designed to fetch a specific widget model based on the provided dashboard and widget OIDs, handling the loading,
success, and error states of the fetch operation. This composable is particularly useful for Vue applications that
require detailed information about a Sisense widget for data visualization or analytics purposes.

**Note:** Widget extensions based on JS scripts and add-ons in Fusion are not supported.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`MaybeRefOrWithRefs`](../type-aliases/type-alias.MaybeRefOrWithRefs.md)\< [`GetWidgetModelParams`](../interfaces/interface.GetWidgetModelParams.md) \> | The parameters for fetching the widget model, including the `dashboardOid`<br />(the OID of the dashboard containing the widget) and the `widgetOid` (the OID of the widget to fetch). This allows for<br />precise and dynamic fetching of widget models based on application needs. |

## Returns

`ToRefs`\< `DataState`\< [`WidgetModel`](interface.WidgetModel.md) \> \>

## Example

Retrieve a widget model and use it to populate a `Chart` component:

```vue
<script setup lang="ts">
import { Chart, useGetWidgetModel, widgetModelTranslator } from '@sisense/sdk-ui-vue';
const { data: widget } = useGetWidgetModel({
  dashboardOid: 'your_dashboard_oid',
  widgetOid: 'your_widget_oid',
});
</script>
<template>
  <Chart v-if="widget" v-bind="widgetModelTranslator.toChartProps(widget)" />
</template>
```

The composable returns an object with reactive properties that represent the state of the widget model fetch operation:
- `data`: The fetched widget model, which is `undefined` until the operation is successfully completed. The widget model
  contains detailed information about the widget, such as its configuration, data, and settings.
- `isLoading`: A boolean indicating whether the fetch operation is currently in progress.
- `isError`: A boolean indicating whether an error occurred during the fetch operation.
- `isSuccess`: A boolean indicating whether the fetch operation was successfully completed without any errors.
- `error`: An error object containing details about any errors that occurred during the fetch operation.

This composable streamlines the process of fetching and managing Sisense widget models within Vue applications, providing
developers with a reactive and efficient way to integrate Sisense data visualizations and analytics.
