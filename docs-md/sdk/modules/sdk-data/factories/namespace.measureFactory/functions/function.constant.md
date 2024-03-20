---
title: constant
---

# Function constant

> **constant**(`value`): [`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

Creates a calculated measure from a numeric value.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `value` | `number` | Value to be returned as a measure |

## Returns

[`CalculatedMeasure`](../../../interfaces/interface.CalculatedMeasure.md)

A calculated measure instance

## Example

Creates a calculated measure from a numeric value.
```ts
measureFactory.constant(42)
```
