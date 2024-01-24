---
title: GetDashboardModelsParams
---

# Interface GetDashboardModelsParams

Parameters for [useGetDashboardModels](../functions/function.useGetDashboardModels.md) hook.

## Extends

- [`GetDashboardModelsOptions`](../../sdk-ui/interfaces/interface.GetDashboardModelsOptions.md).`HookEnableParam`

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

[`GetDashboardModelsOptions`](../../sdk-ui/interfaces/interface.GetDashboardModelsOptions.md).[`includeWidgets`](../../sdk-ui/interfaces/interface.GetDashboardModelsOptions.md#includewidgets)

***

### searchByTitle

> **searchByTitle**?: `string`

Dashboard title to search by

Dashboard titles are not necessarily unique, so the result may contain multiple dashboards.

#### Inherited from

[`GetDashboardModelsOptions`](../../sdk-ui/interfaces/interface.GetDashboardModelsOptions.md).[`searchByTitle`](../../sdk-ui/interfaces/interface.GetDashboardModelsOptions.md#searchbytitle)
