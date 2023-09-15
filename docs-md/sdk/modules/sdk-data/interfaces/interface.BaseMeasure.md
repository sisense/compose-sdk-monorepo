---
title: BaseMeasure
---

# Interface BaseMeasure

Common interface of a Base measure, which is aggregation over [Attribute](interface.Attribute.md).

## Extends

- [`Measure`](interface.Measure.md)

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

#### Inherited from

[`Measure`](interface.Measure.md).[`name`](interface.Measure.md#name)

***

### type

> **`readonly`** **type**: `string`

Element type

#### Inherited from

[`Measure`](interface.Measure.md).[`type`](interface.Measure.md#type)

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

#### Inherited from

[`Measure`](interface.Measure.md).[`format`](interface.Measure.md#format)

***

### getFormat

> **getFormat**(): `undefined` \| `string`

Gets the formatting string of this measure.

#### Returns

`undefined` \| `string`

Formatting string

#### Inherited from

[`Measure`](interface.Measure.md).[`getFormat`](interface.Measure.md#getformat)

***

### getSort

> **getSort**(): [`Sort`](../enumerations/enumeration.Sort.md)

Gets the sort definition of this measure.

#### Returns

[`Sort`](../enumerations/enumeration.Sort.md)

#### Inherited from

[`Measure`](interface.Measure.md).[`getSort`](interface.Measure.md#getsort)

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

#### Inherited from

[`Measure`](interface.Measure.md).[`sort`](interface.Measure.md#sort)
