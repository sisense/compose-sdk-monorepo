---
title: intercept
---

# Function intercept

> **intercept**(
  `dependentY`,
  `independentX`,
  `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Calculates the intercept of a linear regression line for the given dependent and independent numeric attributes.

Note: Date and Time data types are not supported. Convert these types to custom numeric attributes.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `dependentY` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Dependent-variable attribute (y) |
| `independentX` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Independent-variable attribute (x) |
| `name`? | `string` | Optional name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A measure instance

## Example

Calculate the intercept of the linear regression line between Revenue and Cost
```ts
measureFactory.intercept(DM.Commerce.Revenue, DM.Commerce.Cost)
```
