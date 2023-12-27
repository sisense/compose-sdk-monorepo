---
title: add
---

# Function add

> **add**(
  `value1`,
  `value2`,
  `name`?,
  `withParentheses`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a calculated measure by adding two given numbers or measures.

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
const measureSum = measureFactory.add(measure1, measure2);
```
