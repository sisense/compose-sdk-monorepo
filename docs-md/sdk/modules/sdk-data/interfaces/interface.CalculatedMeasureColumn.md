---
title: CalculatedMeasureColumn
---

# Interface CalculatedMeasureColumn

Calculated Aggregate function applied to a [Column](interface.Column.md)(s).
When associated with a dimensional model, a Calculated Measure Column is
equivalent to a [CalculatedMeasure](interface.CalculatedMeasure.md).

## Properties

### context

> **context**: [`MeasureContext`](interface.MeasureContext.md)

Measure context

***

### expression

> **expression**: `string`

Expression representing the element in a [JAQL query](https://developer.sisense.com/guides/querying/useJaql/).

***

### name

> **name**: `string`

Column name

***

### title

> **title**?: `string`

Optional title for the column after aggregation.
If not specified, the column `name` will be used.

***

### type

> **type**: `string`

Measure type
