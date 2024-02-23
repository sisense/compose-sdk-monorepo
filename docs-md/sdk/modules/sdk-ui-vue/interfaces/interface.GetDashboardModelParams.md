---
title: GetDashboardModelParams
---

# Interface GetDashboardModelParams

Parameters for [useGetDashboardModel](../functions/function.useGetDashboardModel.md) hook.

## Extends

- [`GetDashboardModelOptions`](interface.GetDashboardModelOptions.md).`HookEnableParam`

## Properties

### dashboardOid

> **dashboardOid**: `string`

Dashboard identifier

***

### enabled

> **enabled**?: `boolean`

Boolean flag to control if the hook is executed

If not specified, the default value is `true`

#### Inherited from

HookEnableParam.enabled

***

### includeWidgets

> **includeWidgets**?: `boolean`

Boolean flag whether to include widgets in the dashboard model

If not specified, the default value is `false`

#### Inherited from

[`GetDashboardModelOptions`](interface.GetDashboardModelOptions.md).[`includeWidgets`](interface.GetDashboardModelOptions.md#includewidgets)
