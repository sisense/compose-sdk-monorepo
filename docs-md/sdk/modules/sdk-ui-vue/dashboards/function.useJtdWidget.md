---
title: useJtdWidget
---

# Function useJtdWidget

> **useJtdWidget**(`widgetProps`, `config`): `Ref`\< [`WidgetProps`](../../sdk-ui/type-aliases/type-alias.WidgetProps.md) \| `null` \>

Composable to add Jump To Dashboard (JTD) functionality to individual Widget components.

Jump To Dashboard (JTD) allows users to navigate from one dashboard to another when interacting with widgets,
such as clicking on chart data points or using context menus. This composable is particularly useful when rendering
Widget components directly (not through a Dashboard component), but you still want JTD navigation functionality.

For widgets that are part of a dashboard, consider using `applyJtdConfig` or `applyJtdConfigs` instead,
as they apply JTD configuration at the dashboard level rather than individual widget level.

Note: dashboard-only 'includeDashboardFilters' is not supported and would just be ignored, since we do not have a dashboard in the current context.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `widgetProps` | [`MaybeRef`](../type-aliases/type-alias.MaybeRef.md)\< [`WidgetProps`](../../sdk-ui/type-aliases/type-alias.WidgetProps.md) \| `null` \> | Widget properties to enhance with JTD functionality (can be a ref or plain object) |
| `config` | [`MaybeRefOrWithRefs`](../type-aliases/type-alias.MaybeRefOrWithRefs.md)\< [`JumpToDashboardConfig`](../interfaces/interface.JumpToDashboardConfig.md) \| [`JumpToDashboardConfigForPivot`](../interfaces/interface.JumpToDashboardConfigForPivot.md) \> | Jump To Dashboard configuration |

## Returns

`Ref`\< [`WidgetProps`](../../sdk-ui/type-aliases/type-alias.WidgetProps.md) \| `null` \>

Computed ref containing enhanced widget props with JTD navigation capabilities

## Example

Basic JTD configuration with right-click navigation.
```vue
<script setup>
import { ref } from 'vue';
import { Widget, useJtdWidget } from '@sisense/sdk-ui-vue';

const myWidgetProps = ref({
  id: 'widget-1',
  widgetType: 'chart',
  dataSource: 'Sample ECommerce',
  // ... other widget props
});

const jtdConfig = {
  targets: [{ id: 'dashboard-1', caption: 'Sales Dashboard' }],
  interaction: {
    triggerMethod: 'rightclick',
    captionPrefix: 'Jump to'
  }
};

const widgetWithJtd = useJtdWidget(myWidgetProps, jtdConfig);
</script>

<template>
  <Widget v-bind="widgetWithJtd" />
</template>
```

## Example

JTD configuration with multiple targets and custom styling.
```vue
<script setup>
import { ref } from 'vue';
import { Widget, useJtdWidget } from '@sisense/sdk-ui-vue';

const chartProps = ref({ ... });

const jtdConfig = {
  enabled: true,
  targets: [
    { id: 'sales-dashboard', caption: 'Sales Analysis' },
    { id: 'marketing-dashboard', caption: 'Marketing Insights' }
  ],
  interaction: {
    triggerMethod: 'click',
    captionPrefix: 'Navigate to',
    showIcon: true
  },
  filtering: {
    mergeWithTargetFilters: true,
    includeWidgetFilters: true
  }
};

const widgetWithJtd = useJtdWidget(chartProps, jtdConfig);
</script>

<template>
  <Widget v-bind="widgetWithJtd" />
</template>
```
