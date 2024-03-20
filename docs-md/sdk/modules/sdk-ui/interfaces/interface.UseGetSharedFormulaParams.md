---
title: UseGetSharedFormulaParams
---

# Interface UseGetSharedFormulaParams

Params of the [useGetSharedFormula](../fusion-assets/function.useGetSharedFormula.md) hook

Can consist either of an oid or a name/dataSource pair

## Properties

### dataSource

> **dataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Data source - e.g. `Sample ECommerce`

***

### enabled

> **enabled**?: `boolean`

Boolean flag to control if the hook is executed

If not specified, the default value is `true`

***

### name

> **name**?: `string`

Formula name

***

### oid

> **oid**?: `string`

Formula identifier
