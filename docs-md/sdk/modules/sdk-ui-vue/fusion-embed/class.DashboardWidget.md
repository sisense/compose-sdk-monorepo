---
title: DashboardWidget
---

# Class DashboardWidget <Badge type="fusionEmbed" text="Fusion Embed" />

The Dashboard Widget component, which is a thin wrapper on the [ChartWidget](../chart-utilities/class.ChartWidget.md) component,
used to render a widget created in the Sisense instance.

## Example

Here's how you can use the DashboardWidget component in a Vue application:
```vue
<template>
   <DashboardWidget
     widgetOid="64473e07dac1920034bce77f"
     dashboardOid="6441e728dac1920034bce737"
   />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {DashboardWidget} from '@sisense/sdk-ui-vue';

</script>
```

## Properties

### bottomSlot

> **bottomSlot**?: `ReactNode`

***

### contextMenuItems

> **contextMenuItems**?: [`MenuItemSection`](../type-aliases/type-alias.MenuItemSection.md)[]

***

### dashboardOid

> **dashboardOid**?: `string`

***

### description

> **description**?: `string`

***

### drilldownOptions

> **drilldownOptions**?: [`DrilldownOptions`](../type-aliases/type-alias.DrilldownOptions.md)

***

### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

***

### filtersMergeStrategy

> **filtersMergeStrategy**?: `"widgetFirst"` \| `"codeFirst"` \| `"codeOnly"`

Strategy for merging the existing widget filters (including highlights) with the filters provided via the `filters` and `highlights` props:

- `widgetFirst` - prioritizes the widget filters over the provided filters in case of filter conflicts by certain attributes.
- `codeFirst` - prioritizes the provided filters over the widget filters in case of filter conflicts by certain attributes.
- `codeOnly` - applies only the provided filters and completely ignores the widget filters.

If not specified, the default strategy is `codeFirst`.

***

### highlightSelectionDisabled

> **highlightSelectionDisabled**?: `boolean`

***

### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

***

### includeDashboardFilters

> **includeDashboardFilters**?: `boolean`

Boolean flag whether to include dashboard filters in the widget's `filters` and `highlights`

If not specified, the default value is `false`.

***

### onBeforeRender

> **onBeforeRender**?: [`BeforeRenderHandler`](../type-aliases/type-alias.BeforeRenderHandler.md)

***

### onContextMenuClose

> **onContextMenuClose**?: () => `void`

#### Returns

`void`

***

### onDataPointClick

> **onDataPointClick**?: [`DataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.DataPointEventHandler.md) \| [`ScatterDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointEventHandler.md) \| [`AreamapDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.AreamapDataPointEventHandler.md) \| [`BoxplotDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.BoxplotDataPointEventHandler.md) \| [`ScattermapDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.ScattermapDataPointEventHandler.md)

***

### onDataPointContextMenu

> **onDataPointContextMenu**?: [`DataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.DataPointEventHandler.md) \| [`ScatterDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointEventHandler.md) \| [`BoxplotDataPointEventHandler`](../../sdk-ui/type-aliases/type-alias.BoxplotDataPointEventHandler.md)

***

### onDataPointsSelected

> **onDataPointsSelected**?: [`DataPointsEventHandler`](../../sdk-ui/type-aliases/type-alias.DataPointsEventHandler.md) \| [`ScatterDataPointsEventHandler`](../../sdk-ui/type-aliases/type-alias.ScatterDataPointsEventHandler.md)

***

### styleOptions

> **styleOptions**?: [`DashboardWidgetStyleOptions`](../interfaces/interface.DashboardWidgetStyleOptions.md)

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

> **widgetStyleOptions**?: [`DashboardWidgetStyleOptions`](../interfaces/interface.DashboardWidgetStyleOptions.md)
