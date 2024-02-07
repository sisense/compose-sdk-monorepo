---
title: ChartWidget
---

# Class ChartWidget

A Vue component that wraps the ChartWidget Preact component for use in Vue applications.
It maintains compatibility with Vue's reactivity system while preserving the functionality of the ChartWidget.

## Example

Here's how you can use the ChartWidget component in a Vue application:
```vue
<template>
  <ChartWidget :props="chartWidgetProps" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ChartWidget from '@sisense/sdk-ui-vue/ChartWidget';

const chartWidgetProps = ref({
  // Configure your ChartWidgetProps here
});
</script>
```

## Properties

### bottomSlot

> **bottomSlot**?: `ReactNode`

***

### chartType

> **chartType**?: [`ChartType`](../../sdk-ui/type-aliases/type-alias.ChartType.md)

***

### contextMenuItems

> **contextMenuItems**?: [`MenuItemSection`](../../sdk-ui/type-aliases/type-alias.MenuItemSection.md)[]

***

### dataOptions

> **dataOptions**?: [`ChartDataOptions`](../../sdk-ui/type-aliases/type-alias.ChartDataOptions.md)

***

### dataSource

> **dataSource**?: `string`

***

### description

> **description**?: `string`

***

### drilldownOptions

> **drilldownOptions**?: [`DrilldownOptions`](../../sdk-ui/type-aliases/type-alias.DrilldownOptions.md)

***

### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md)

***

### highlightSelectionDisabled

> **highlightSelectionDisabled**?: `boolean`

***

### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

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

> **styleOptions**?: [`ChartWidgetStyleOptions`](../../sdk-ui/type-aliases/type-alias.ChartWidgetStyleOptions.md)

***

### title

> **title**?: `string`

***

### topSlot

> **topSlot**?: `ReactNode`

***

### widgetStyleOptions

> **widgetStyleOptions**?: [`ChartWidgetStyleOptions`](../../sdk-ui/type-aliases/type-alias.ChartWidgetStyleOptions.md)
