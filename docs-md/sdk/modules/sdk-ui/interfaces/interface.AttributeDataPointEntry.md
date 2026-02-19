---
title: AttributeDataPointEntry
---

# Interface AttributeDataPointEntry

A data point entry that represents a single attribute within a multi-dimensional data point.

## Properties

### attribute

> **attribute**: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)

The attribute associated with this data point entry

***

### dataOption

> **dataOption**: [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`Column`](../../sdk-data/interfaces/interface.Column.md) \| [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`StyledColumn`](interface.StyledColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md)

The data option associated with this entry

***

### displayValue

> **displayValue**?: `string`

The formatted value of the data point

***

### value

> **value**: `number` \| `string`

The raw value of the data point
