---
title: divide
---

# Function divide

> **divide**(
  `value1`,
  `value2`,
  `name`?,
  `withParentheses`?): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a calculated measure by dividing two given numbers or measures. Divides `value1` by `value2`.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `value1` | [`Measure`](../../../interfaces/interface.Measure.md) \| `number` | First value |
| `value2` | [`Measure`](../../../interfaces/interface.Measure.md) \| `number` | Second value |
| `name`? | `string` | Optional name for the new measure |
| `withParentheses`? | `boolean` | Optional boolean flag whether to wrap the arithmetic operation with parentheses |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A calculated measure instance

## Example

```ts
const measure1 = measureFactory.sum(DM.Dimension.Attribute1);
const measure2 = measureFactory.sum(DM.Dimension.Attribute2);
const measureQuotient = measureFactory.divide(measure1, measure2);
```
