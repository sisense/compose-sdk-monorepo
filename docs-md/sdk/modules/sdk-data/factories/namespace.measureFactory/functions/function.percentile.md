---
title: percentile
---

# Function percentile

> **percentile**(
  `attribute`,
  `percentileValue`,
  `name`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Calculates the nth percentile value of the given numeric attribute.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `attribute` | [`Attribute`](../../../interfaces/interface.Attribute.md) | Attribute to aggregate |
| `percentileValue` | `number` | Percentile as a fraction between 0 and 1 (e.g. 0.9 for the 90th percentile) |
| `name`? | `string` | Optional name for the new measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A measure instance

## Example

Calculate the 90th percentile of the cost attribute.
```ts
measureFactory.percentile(DM.Commerce.Cost, 0.9)
```
