---
title: GetDashboardModelsParams
---

# Interface GetDashboardModelsParams

Parameters for [useGetDashboardModels](../fusion-assets/function.useGetDashboardModels.md) hook.

## Properties

### enabled

> **enabled**?: `boolean`

Boolean flag to control if the hook is executed

If not specified, the default value is `true`

***

### includeWidgets

> **includeWidgets**?: `boolean`

Boolean flag whether to include widgets in the dashboard model

If not specified, the default value is `false`

***

### searchByTitle

> **searchByTitle**?: `string`

Dashboard title to search by

Dashboard titles are not necessarily unique, so the result may contain multiple dashboards.
