---
title: Column
---

# Interface Column

Column (or field) in a data set.
When associated with a dimensional model, a column is equivalent to an [Attribute](interface.Attribute.md).

## Properties

### name

> **name**: `string`

Column name

***

### title

> **title**?: `string`

Display label shown in chart UI when different from [name](interface.Column.md#name).

Optional override in chart `dataOptions` input. Factory-produced model elements
([Attribute](interface.Attribute.md), [Measure](interface.Measure.md), etc.) expose a resolved [title](interface.Attribute.md#title)
instead; use the model element directly rather than duplicating the label here.

***

### type

> **type**: `string`

Column type
