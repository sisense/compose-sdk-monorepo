---
title: MeasureDataPointEntry
---

# Interface MeasureDataPointEntry

A data point entry that represents a single measure within a multi-dimensional data point.

## Properties

### dataOption

> **dataOption**: [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`Column`](../../sdk-data/interfaces/interface.Column.md) \| [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`StyledColumn`](interface.StyledColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md)

The data option associated with this entry

***

### displayValue

> **displayValue**?: `string`

The formatted value of the data point

***

### measure

> **measure**: [`Measure`](../../sdk-data/interfaces/interface.Measure.md)

The measure associated with this data point entry

***

### value

> **value**: `number` \| `string`

The raw value of the data point
