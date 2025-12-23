---
title: DataPointEntry
---

# Type alias DataPointEntry

> **DataPointEntry**: `object`

A data point entry that represents a single dimension within a multi-dimensional data point.

## Type declaration

### `attribute`

**attribute**?: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)

The attribute associated with this data point entry

***

### `dataOption`

**dataOption**: [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`Column`](../../sdk-data/interfaces/interface.Column.md) \| [`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`StyledColumn`](../interfaces/interface.StyledColumn.md) \| [`StyledMeasureColumn`](../interfaces/interface.StyledMeasureColumn.md)

The data option associated with this entry

***

### `displayValue`

**displayValue**?: `string`

The formatted value of the data point

***

### `measure`

**measure**?: [`Measure`](../../sdk-data/interfaces/interface.Measure.md)

The measure associated with this data point entry

***

### `value`

**value**?: `number` \| `string`

The raw value of the data point
