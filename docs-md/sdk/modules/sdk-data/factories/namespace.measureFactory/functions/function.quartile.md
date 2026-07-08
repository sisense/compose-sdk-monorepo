---
title: quartile
---

# Function quartile

> **quartile**(
  `attribute`,
  `quartileValue`,
  `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Calculates the nth quartile value of the given numeric attribute.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Attribute to aggregate |
| `quartileValue` | `number` | Quartile index: 0 (minimum), 1 (Q1), 2 (median), 3 (Q3), or 4 (maximum) |
| `name`? | `string` | Optional name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A measure instance

## Example

Calculate the third quartile (Q3) of the cost attribute.
```ts
measureFactory.quartile(DM.Commerce.Cost, 3)
```
