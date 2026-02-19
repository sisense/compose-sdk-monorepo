---
title: useJtdWidget
---

# Function useJtdWidget

> **useJtdWidget**(...`args`): [`WidgetProps`](../type-aliases/type-alias.WidgetProps.md) \| `null`

Hook to add Jump To Dashboard (JTD) functionality to individual Widget components.

Jump To Dashboard (JTD) allows users to navigate from one dashboard to another when interacting with widgets,
such as clicking on chart data points or using context menus. This hook is particularly useful when rendering
Widget components directly (not through a Dashboard component), but you still want JTD navigation functionality.

For widgets that are part of a dashboard, consider using `applyJtdConfig` or `applyJtdConfigs` instead,
as they apply JTD configuration at the dashboard level rather than individual widget level.

Note: dashboard-only 'includeDashboardFilters' is not supported and would just be ignored, since we do not have a dashboard in the current context.

This hook enhances the provided widget props with JTD navigation capabilities, including:
- Click and right-click event handlers for navigation
- Hyperlink styling for actionable pivot cells (when applicable)
- JTD icon display in widget headers

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`WidgetProps`](../type-aliases/type-alias.WidgetProps.md) \| `null`, [`JumpToDashboardConfig`](../interfaces/interface.JumpToDashboardConfig.md) \| [`JumpToDashboardConfigForPivot`](../interfaces/interface.JumpToDashboardConfigForPivot.md)] |

## Returns

[`WidgetProps`](../type-aliases/type-alias.WidgetProps.md) \| `null`

Enhanced widget props with JTD navigation capabilities, menu combination, and styling applied

## Example

Basic JTD configuration with right-click navigation.
```typescript
import { useJtdWidget } from '@sisense/sdk-ui';

const jtdConfig: JumpToDashboardConfig = {
  targets: [{ id: 'dashboard-1', caption: 'Sales Dashboard' }],
  interaction: {
    triggerMethod: 'rightclick',
    captionPrefix: 'Jump to'
  }
};

const MyComponent = () => {
  const widgetWithJtd = useJtdWidget(myWidgetProps, jtdConfig);

  return <Widget {...widgetWithJtd} />;
};
```

## Example

JTD configuration with multiple targets and custom styling.
```typescript
const jtdConfig: JumpToDashboardConfig = {
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
```
