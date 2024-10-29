---
title: modifyFilter
---

# Function modifyFilter

> **modifyFilter**(
  `dashboard`,
  `filterToModify`,
  `newFilter`): [`DashboardProps`](../../../interfaces/interface.DashboardProps.md)

Creates a new dashboard instance with a specific filter modified.

This function searches for a filter with the same GUID as the provided `filterToModify` and replaces it with `newFilter`.
This function does not modify the original dashboard; instead, it returns a new dashboard with the updated filters.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `dashboard` | [`DashboardProps`](../../../interfaces/interface.DashboardProps.md) | The original dashboard (`DashboardProps`) containing the filter to modify. |
| `filterToModify` | [`Filter`](../../../../sdk-data/interfaces/interface.Filter.md) | The existing filter to be modified. |
| `newFilter` | [`Filter`](../../../../sdk-data/interfaces/interface.Filter.md) | The new filter to replace the existing one. |

## Returns

[`DashboardProps`](../../../interfaces/interface.DashboardProps.md)

A new dashboard instance with the specified filter modified.

## Example

Modify a filter in a dashboard.
```ts
const existingDashboard: DashboardProps = {...};
const filterToModify: Filter = {...};
const newFilter: Filter = {...};
const updatedDashboard = modifyFilter(existingDashboard, filterToModify, newFilter);
```
