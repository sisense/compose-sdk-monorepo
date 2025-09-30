---
title: applyJtdConfig
---

# Function applyJtdConfig

> **applyJtdConfig**(
  `dashboard`,
  `widgetOid`,
  `config`): [`DashboardProps`](../../../interfaces/interface.DashboardProps.md)

Creates a new `DashboardProps` instance with JTD (Jump To Dashboard) configuration applied to a single widget.

Jump To Dashboard (JTD) allows users to navigate from one dashboard to another when interacting with widgets,
such as clicking on chart data points or using context menus. This function applies JTD configuration to a specific
widget in a dashboard, enabling jump-to-dashboard functionality.

This function does not modify the original dashboard; instead, it returns a new `DashboardProps` instance with the JTD
configuration applied. If the specified widget does not exist in the dashboard, the function returns the original
`DashboardProps` unchanged and logs a warning to the console.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `dashboard` | [`DashboardProps`](../../../interfaces/interface.DashboardProps.md) | The original dashboard to modify. Must be a valid `DashboardProps` object containing the target widget. |
| `widgetOid` | `string` | The unique identifier (OID) of the widget to apply JTD configuration to. Must match an existing widget ID in the dashboard. |
| `config` | [`JumpToDashboardConfig`](../../../interfaces/interface.JumpToDashboardConfig.md) | The JTD configuration to apply. |

## Returns

[`DashboardProps`](../../../interfaces/interface.DashboardProps.md)

A new `DashboardProps` instance with the JTD configuration applied to the specified widget. If the widget doesn't exist, returns the original dashboard unchanged.

## Example

Apply JTD configuration to a dashboard widget.
```ts
const jtdConfig: JumpToDashboardConfig = {
  targets: [{ id: 'dashboardId1', caption: 'Analytics Dashboard' }],
  interaction: {
    triggerMethod: 'rightclick',
    contextMenuCaption: 'Jump to Analytics'
  }
};

const updatedDashboard = dashboardHelpers.applyJtdConfig(dashboard, 'widgetId3', jtdConfig);
```
