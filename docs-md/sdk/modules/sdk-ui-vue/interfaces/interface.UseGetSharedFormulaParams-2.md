---
title: UseGetSharedFormulaParams
---

# Interface UseGetSharedFormulaParams

Params of the [useGetSharedFormula](../functions/function.useGetSharedFormula-2.md) hook

Can consist either of an oid or a name/dataSource pair

## Extends

- `HookEnableParam`

## Properties

### dataSource

> **dataSource**?: `string`

Data source - e.g. `Sample ECommerce`

***

### enabled

> **enabled**?: `boolean`

Boolean flag to control if the hook is executed

If not specified, the default value is `true`

#### Inherited from

HookEnableParam.enabled

***

### name

> **name**?: `string`

Formula name

***

### oid

> **oid**?: `string`

Formula identifier
