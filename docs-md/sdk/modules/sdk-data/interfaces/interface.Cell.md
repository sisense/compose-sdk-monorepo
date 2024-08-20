---
title: Cell
---

# Interface Cell

Data cell, which is a storage unit in a [user-provided data set](interface.Data.md)
or [query result data set](interface.QueryResultData.md).

## Properties

### blur

> **blur**?: `boolean`

Boolean flag representing three states that can be visualized in a chart:
- `true`: the data value is in blur state
- `false`: the data value is in highlight state
- if not specified, the data value is neither in highlight nor blur state

***

### color

> **color**?: `string`

Color associated with the data value when visualized in a chart

***

### data

> **data**: `any`

Cell data value

***

### text

> **text**?: `string`

Display text
