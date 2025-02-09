---
title: BaseMeasure
---

# Interface BaseMeasure

Common interface of a Base measure, which is aggregation over [Attribute](interface.Attribute.md).

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

### aggregation

> **`readonly`** **aggregation**: `string`

Aggregation type

***

### attribute

> **`readonly`** **attribute**: [`Attribute`](interface.Attribute.md)

Aggregated attribute

***

### name

> **name**: `string`

Element name

***

### type

> **`readonly`** **type**: `string`

Element type
