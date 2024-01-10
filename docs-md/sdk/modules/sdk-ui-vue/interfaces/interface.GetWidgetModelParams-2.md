---
title: GetWidgetModelParams
---

# Interface GetWidgetModelParams

Parameters for [useGetWidgetModel](../functions/function.useGetWidgetModel-2.md) hook.

## Extends

- `HookEnableParam`

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

### widgetOid

> **widgetOid**: `string`

Identifier of the widget to be retrieved
