---
title: correlation
---

# Function correlation

> **correlation**(
  `attributeA`,
  `attributeB`,
  `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Calculates the correlation coefficient between two numeric attributes.
Returns values in range [-1, 1] or N/A when either attribute has zero variance.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attributeA` | [`Attribute`](../../../interfaces/interface.Attribute.md) | First attribute |
| `attributeB` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Second attribute |
| `name`? | `string` | Optional name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A measure instance

## Example

Returns the correlation coefficient measure between Revenue and Cost
```ts
measureFactory.correlation(DM.Commerce.Revenue, DM.Commerce.Cost)
```
