---
title: covarp
---

# Function covarp

> **covarp**(
  `attributeA`,
  `attributeB`,
  `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Calculates the covariance between two given numeric attributes across the entire population (all items).

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

Returns the covariance (population) between Revenue and Cost
```ts
measureFactory.covarp(DM.Commerce.Revenue, DM.Commerce.Cost)
```
