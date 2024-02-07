---
title: DashboardWidget
---

# Class DashboardWidget

A Vue component that wraps the DashboardWidget Preact component for use in Vue applications.
It maintains compatibility with Vue's reactivity system while preserving the functionality of the DashboardWidget.

## Example

Here's how you can use the DashboardWidget component in a Vue application:
```vue
<template>
  <DashboardWidget :props="dashboardWidgetProps" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DashboardWidget from '@sisense/sdk-ui-vue/DashboardWidget';

const dashboardWidgetProps = ref({
  // Configure your DashboardWidgetProps here
});
</script>
```

## Properties

### bottomSlot

> **bottomSlot**?: `ReactNode`

***

### contextMenuItems

> **contextMenuItems**?: [`MenuItemSection`](../../sdk-ui/type-aliases/type-alias.MenuItemSection.md)[]

***

### dashboardOid

> **dashboardOid**?: `string`

***

### description

> **description**?: `string`

***

### drilldownOptions

> **drilldownOptions**?: [`DrilldownOptions`](../../sdk-ui/type-aliases/type-alias.DrilldownOptions.md)

***

### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

***

### filtersMergeStrategy

> **filtersMergeStrategy**?: `"widgetFirst"` \| `"codeFirst"` \| `"codeOnly"`

***

### highlightSelectionDisabled

> **highlightSelectionDisabled**?: `boolean`

***

### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

***

### includeDashboardFilters

> **includeDashboardFilters**?: `boolean`

***

### onBeforeRender

> **onBeforeRender**?: [`BeforeRenderHandler`](../../sdk-ui/type-aliases/type-alias.BeforeRenderHandler.md)

***

### onContextMenuClose

> **onContextMenuClose**?: `object`

***

### onDataPointClick

> **onDataPointClick**?: [`DataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.DataPointEventHandler.md) \| [`ScatterDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointEventHandler.md) \| [`AreamapDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.AreamapDataPointEventHandler.md) \| [`BoxplotDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.BoxplotDataPointEventHandler.md)

***

### onDataPointContextMenu

> **onDataPointContextMenu**?: [`DataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.DataPointEventHandler.md) \| [`ScatterDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointEventHandler.md) \| [`BoxplotDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.BoxplotDataPointEventHandler.md)

***

### onDataPointsSelected

> **onDataPointsSelected**?: [`DataPointsEventHandler`](../../sdk-ui/type-aliases/type-alias.DataPointsEventHandler.md) \| [`ScatterDataPointsEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointsEventHandler.md)

***

### styleOptions

> **styleOptions**?: [`DashboardWidgetStyleOptions`](../../sdk-ui/interfaces/interface.DashboardWidgetStyleOptions.md)

***

### title

> **title**?: `string`

***

### topSlot

> **topSlot**?: `ReactNode`

***

### widgetOid

> **widgetOid**?: `string`

***

### widgetStyleOptions

> **widgetStyleOptions**?: [`DashboardWidgetStyleOptions`](../../sdk-ui/interfaces/interface.DashboardWidgetStyleOptions.md)
