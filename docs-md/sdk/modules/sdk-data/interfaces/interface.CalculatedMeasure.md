---
title: CalculatedMeasure
---

# Interface CalculatedMeasure

Interface for a Calculated Measure, extending [Measure](interface.Measure.md).

## See

[Using the JAQL to Add A Formula](https://sisense.dev/guides/querying/useJaql/#step-7-adding-a-formula)

## Methods

### format

> **format**(`format`): [`Measure`](interface.Measure.md)

Formats the measure according to the given `format` definition.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `format` | `string` | Format string |

#### Returns

[`Measure`](interface.Measure.md)

A formatted instance of this measure

***

### getFormat

> **getFormat**(): `string` \| `undefined`

Gets the formatting string of this measure.

#### Returns

`string` \| `undefined`

Formatting string

***

### getSort

> **getSort**(): [`Sort`](../enumerations/enumeration.Sort.md)

Gets the sort definition of this measure.

#### Returns

[`Sort`](../enumerations/enumeration.Sort.md)

***

### sort

> **sort**(`sort`): [`Measure`](interface.Measure.md)

Sorts the measure by the given `sort` definition.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `sort` | [`Sort`](../enumerations/enumeration.Sort.md) | Sort definition |

#### Returns

[`Measure`](interface.Measure.md)

A sorted instance of measure

## Properties

### context

> **context**: [`MeasureContext`](interface.MeasureContext.md)

Context of the calculated measure

***

### expression

> **expression**: `string`

Expression of the calculated measure

***

### name

> **name**: `string`

Element name

***

### type

> **`readonly`** **type**: `string`

Element type
