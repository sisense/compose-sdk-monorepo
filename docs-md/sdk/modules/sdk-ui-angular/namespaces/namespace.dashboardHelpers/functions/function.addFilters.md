---
title: addFilters
---

# Function addFilters

> **addFilters**(`dashboard`, `newFilters`): [`DashboardProps`](../../../../sdk-ui/interfaces/interface.DashboardProps.md)

Creates a new dashboard instance with additional filters added to its existing filters.

This function does not modify the original dashboard; instead, it returns a new dashboard with the added filters.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `dashboard` | [`DashboardProps`](../../../../sdk-ui/interfaces/interface.DashboardProps.md) | The original dashboard (`DashboardProps`) to which the filters will be added. |
| `newFilters` | [`Filter`](../../../../sdk-data/interfaces/interface.Filter.md)[] | An array of filters to add to the dashboard. |

## Returns

[`DashboardProps`](../../../../sdk-ui/interfaces/interface.DashboardProps.md)

A new dashboard instance with the new filters added.

## Example

Add multiple new filters to a dashboard.
```ts
const existingDashboard: DashboardProps = {...};
const newFilters: Filter[] = [{...}, {...}, ...];
const updatedDashboard = addFilters(existingDashboard, newFilters);
```
