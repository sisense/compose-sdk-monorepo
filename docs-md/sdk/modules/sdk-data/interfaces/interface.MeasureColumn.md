---
title: MeasureColumn
---

# Interface MeasureColumn

Aggregate function applied to a [Column](interface.Column.md).
When associated with a dimensional model, a Measure Column is equivalent to a [Measure](interface.Measure.md).

## Properties

### aggregation

> **aggregation**?: `string`

Aggregate function -- for example, `sum`, `count`.
If not specified, default value, `sum`, will be used.

***

### name

> **name**: `string`

Column name

***

### title

> **title**?: `string`

Optional title for the column after aggregation.
If not specified, the column `name` will be used.
