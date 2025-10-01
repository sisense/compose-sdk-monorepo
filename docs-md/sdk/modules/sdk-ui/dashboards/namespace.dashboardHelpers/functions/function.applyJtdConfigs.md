---
title: applyJtdConfigs
---

# Function applyJtdConfigs

> **applyJtdConfigs**(`dashboard`, `jtdConfigs`): [`DashboardProps`](../../../interfaces/interface.DashboardProps.md)

Creates a new `DashboardProps` instance with JTD (Jump To Dashboard) configurations applied to multiple widgets in a single operation.

Jump To Dashboard (JTD) allows users to navigate from one dashboard to another when interacting with widgets.
This function efficiently applies JTD configurations to multiple widgets in a single operation.

This function does not modify the original dashboard; instead, it returns a new `DashboardProps` instance with all valid
JTD configurations applied. Configurations for non-existent widgets are automatically filtered out, and warnings
are logged to the console for invalid widget OIDs.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `dashboard` | [`DashboardProps`](../../../interfaces/interface.DashboardProps.md) | The original dashboard to modify. Must be a valid `DashboardProps` object with widgets to configure. |
| `jtdConfigs` | `Record`\< `string`, [`JumpToDashboardConfig`](../../../interfaces/interface.JumpToDashboardConfig.md) \> | An object mapping widget OIDs (keys) to their respective JTD configurations (values). |

## Returns

[`DashboardProps`](../../../interfaces/interface.DashboardProps.md)

A new `DashboardProps` instance with all valid JTD configurations applied to their respective widgets. Invalid widget configurations are skipped and warnings are logged.

## Example

Apply a variety of Jump To Dashboard configuration options to multiple widgets in a single operation.
```ts
import { dashboardHelpers } from '@ethings-os/sdk-ui';

const dashboard: DashboardProps = {
  title: 'Executive Dashboard',
  widgets: [
    { id: 'widgetId1', widgetType: 'chart', chartType: 'column', dataOptions: {...} },
    { id: 'widgetId2', widgetType: 'chart', chartType: 'pie', dataOptions: {...} },
    { id: 'widgetId3', widgetType: 'table', dataOptions: {...} }
  ]
};

const jtdConfigs = {
  'widgetId1': {
    enabled: true,
    targets: [{ id: 'dashboardId1', caption: 'Sales Breakdown' }],
    interaction: {
      triggerMethod: 'rightclick'
    }
  },
  'widgetId2': {
    targets: [{ id: 'dashboardId2', caption: 'Revenue Analysis' }],
    interaction: {
      triggerMethod: 'click',
      contextMenuCaption: 'Analyze Revenue'
    }
  },
  'widgetId3': {
    enabled: true,
    targets: [
      { id: 'dashboardId3', caption: 'Customer Details' },
      { id: 'dashboardId4', caption: 'Product Analytics' }
    ],
    interaction: {
      triggerMethod: 'rightclick'
    }
  }
};

const updatedDashboard = dashboardHelpers.applyJtdConfigs(dashboard, jtdConfigs);
```

## Example

Batch apply JTD configurations with error handling.
```ts
const configsWithInvalidWidget = {
  'widgetId1': { targets: [{ id: 'dashboardId1', caption: 'Target' }] },
  'invalidWidgetId': { targets: [{ id: 'dashboardId2', caption: 'Other' }] } // Will be filtered out
};

const result = dashboardHelpers.applyJtdConfigs(dashboard, configsWithInvalidWidget);
// Console warning: "Widgets with OIDs [invalidWidgetId] not found in dashboard..."
// Only 'widgetId1' gets the JTD configuration applied
```
