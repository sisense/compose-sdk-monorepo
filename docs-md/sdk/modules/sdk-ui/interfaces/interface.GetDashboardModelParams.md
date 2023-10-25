---
title: GetDashboardModelParams
---

# Interface GetDashboardModelParams

Parameters for [useGetDashboardModel](../functions/function.useGetDashboardModel.md) hook.

## Extends

- `GetDashboardModelOptions`.`HookEnableParam`

## Properties

### dashboardOid

> **dashboardOid**: `string`

Identifier of the dashboard that contains the widget

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

GetDashboardModelOptions.includeWidgets
