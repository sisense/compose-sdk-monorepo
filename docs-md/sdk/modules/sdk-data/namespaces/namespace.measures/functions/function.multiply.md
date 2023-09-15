---
title: multiply
---

# Function multiply

> **multiply**(
  `value1`,
  `value2`,
  `name`?,
  `withParentheses`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Multiply value1 with value2.

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
