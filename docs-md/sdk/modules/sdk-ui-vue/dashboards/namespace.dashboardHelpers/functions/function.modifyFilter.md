---
title: modifyFilter
---

# Function modifyFilter

> **modifyFilter**(
  `dashboard`,
  `filterToModify`,
  `newFilter`): [`DashboardProps`](../../../interfaces/interface.DashboardProps.md)

Creates a new dashboard instance with a specific filter modified.
Alias for `replaceFilter`.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `dashboard` | [`DashboardProps`](../../../interfaces/interface.DashboardProps.md) | The original dashboard (`DashboardProps`) containing the filter to modify. |
| `filterToModify` | [`Filter`](../../../../sdk-data/interfaces/interface.Filter.md) | The existing filter to be modified. |
| `newFilter` | [`Filter`](../../../../sdk-data/interfaces/interface.Filter.md) | The new filter to replace the existing one. |

## Returns

[`DashboardProps`](../../../interfaces/interface.DashboardProps.md)

A new dashboard instance with the specified filter modified.

::: warning Deprecated
Use [replaceFilter](function.replaceFilter.md) instead
:::
