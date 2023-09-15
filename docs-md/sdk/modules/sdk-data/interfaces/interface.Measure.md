---
title: Measure
---

# Interface Measure

Base interface for measure, which is typically numeric aggregation over [Attribute](interface.Attribute.md)(s).
See [measures](../namespaces/namespace.measures/index.md) for how to create measures.

## Extends

- `Element`

## Properties

### name

> **name**: `string`

Element name

#### Inherited from

Element.name

***

### type

> **`readonly`** **type**: `string`

Element type

#### Inherited from

Element.type

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

> **getFormat**(): `undefined` \| `string`

Gets the formatting string of this measure.

#### Returns

`undefined` \| `string`

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
