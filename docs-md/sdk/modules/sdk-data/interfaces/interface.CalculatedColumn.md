---
title: CalculatedColumn
---

# Interface CalculatedColumn

Calculated attribute defined by a formula over one or more [Column](interface.Column.md)(s).
When associated with a dimensional model, a Calculated Column is equivalent to a calculated attribute
(see [attributeFactory.customFormula](../factories/namespace.attributeFactory/functions/function.customFormula.md)).

It is the attribute counterpart of [CalculatedMeasureColumn](interface.CalculatedMeasureColumn.md): it produces
categorical/grouping values rather than an aggregated number.

## Properties

### context

> **context**: [`AttributeContext`](interface.AttributeContext.md)

Formula context

***

### expression

> **expression**: `string`

Expression (formula) representing the element in a [JAQL query](https://developer.sisense.com/guides/querying/useJaql/).

***

### name

> **name**: `string`

Column name

***

### title

> **title**?: `string`

Optional title for the column.
If not specified, the column `name` will be used.

***

### type

> **type**: `string`

Column type
