---
title: subtract
---

# Function subtract

> **subtract**(
  `value1`,
  `value2`,
  `name`?,
  `withParentheses`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Subtract value2 from value1.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `value1` | `number` \| [`Measure`](../../../interfaces/interface.Measure.md) | First value |
| `value2` | `number` \| [`Measure`](../../../interfaces/interface.Measure.md) | Second value |
| `name`? | `string` | Optional name for the new measure |
| `withParentheses`? | `boolean` | Optional boolean flag whether to wrap the arithmetic operation with parentheses |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A Calculated Measure instance
