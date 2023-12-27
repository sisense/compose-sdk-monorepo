---
title: subtract
---

# Function subtract

> **subtract**(
  `value1`,
  `value2`,
  `name`?,
  `withParentheses`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a calculated measure by subtracting two given numbers or measures. Subtracts `value2` from `value1`.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `value1` | `number` \| [`Measure`](../../../interfaces/interface.Measure.md) | First value |
| `value2` | `number` \| [`Measure`](../../../interfaces/interface.Measure.md) | Second value |
| `name`? | `string` | Optional name for the new measure |
| `withParentheses`? | `boolean` | Optional boolean flag whether to wrap the arithmetic operation with parentheses |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A calculated measure instance

## Example

```ts
const measure1 = measureFactory.sum(DM.Dimension.Attribute1);
const measure2 = measureFactory.sum(DM.Dimension.Attribute2);
const measureDifference = measureFactory.subtract(measure1, measure2);
```
