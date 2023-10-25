---
title: GetDashboardModelsParams
---

# Interface GetDashboardModelsParams

Parameters for [useGetDashboardModels](../functions/function.useGetDashboardModels.md) hook.

## Extends

- `GetDashboardModelsOptions`.`HookEnableParam`

## Properties

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

GetDashboardModelsOptions.includeWidgets

***

### searchByTitle

> **searchByTitle**?: `string`

Dashboard title to search by

The dashboard title is not unique, therefore, the result may return multiple dashboards.

#### Inherited from

GetDashboardModelsOptions.searchByTitle
