---
title: DateDimension
---

# Interface DateDimension

Date Dimension extending [Dimension](interface.Dimension.md).

## Methods

### getSort

> **getSort**(): [`Sort`](../enumerations/enumeration.Sort.md)

Gets the sort definition.

#### Returns

[`Sort`](../enumerations/enumeration.Sort.md)

The Sort definition

***

### sort

> **sort**(`sort`): [`Attribute`](interface.Attribute.md)

Sorts the attribute by the given definition

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `sort` | [`Sort`](../enumerations/enumeration.Sort.md) | Sort definition |

#### Returns

[`Attribute`](interface.Attribute.md)

An sorted instance of the attribute

## Properties

### AggHours

> **`readonly`** **AggHours**: [`LevelAttribute`](interface.LevelAttribute.md)

Aggregated Hours level (for Live Models)

***

### AggMinutesRoundTo1

> **`readonly`** **AggMinutesRoundTo1**: [`LevelAttribute`](interface.LevelAttribute.md)

Aggregated Minutes (every minute) level

***

### AggMinutesRoundTo15

> **`readonly`** **AggMinutesRoundTo15**: [`LevelAttribute`](interface.LevelAttribute.md)

Aggregated Minutes (round to 15) level

***

### AggMinutesRoundTo30

> **`readonly`** **AggMinutesRoundTo30**: [`LevelAttribute`](interface.LevelAttribute.md)

Aggregated Minutes (round to 30) level

***

### Days

> **`readonly`** **Days**: [`LevelAttribute`](interface.LevelAttribute.md)

Days level

***

### expression

> **`readonly`** **expression**: `string`

Expression representing the element in a [JAQL query](https://sisense.dev/guides/querying/useJaql/).
It is typically populated automatically in the data model generated by the data model generator.

***

### Hours

> **`readonly`** **Hours**: [`LevelAttribute`](interface.LevelAttribute.md)

Hours level (for Live Models)

***

### Minutes

> **`readonly`** **Minutes**: [`LevelAttribute`](interface.LevelAttribute.md)

Minutes level (for Live Models)

***

### MinutesRoundTo15

> **`readonly`** **MinutesRoundTo15**: [`LevelAttribute`](interface.LevelAttribute.md)

Minutes (round to 15) level (for Live Models)

***

### MinutesRoundTo30

> **`readonly`** **MinutesRoundTo30**: [`LevelAttribute`](interface.LevelAttribute.md)

Minutes (round to 30) level (for Live Models)

***

### Months

> **`readonly`** **Months**: [`LevelAttribute`](interface.LevelAttribute.md)

Months level

***

### name

> **name**: `string`

Element name

***

### Quarters

> **`readonly`** **Quarters**: [`LevelAttribute`](interface.LevelAttribute.md)

Quarters level

***

### Seconds

> **`readonly`** **Seconds**: [`LevelAttribute`](interface.LevelAttribute.md)

Seconds level (for Live Models)

***

### type

> **`readonly`** **type**: `string`

Element type

***

### Weeks

> **`readonly`** **Weeks**: [`LevelAttribute`](interface.LevelAttribute.md)

Weeks level

***

### Years

> **`readonly`** **Years**: [`LevelAttribute`](interface.LevelAttribute.md)

Years level
