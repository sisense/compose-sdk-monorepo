---
title: createLinearGradient
---

# Function createLinearGradient

> **createLinearGradient**(`direction`, `stops`): [`LinearGradientColor`](../interfaces/interface.LinearGradientColor.md)

Helper function to create a linear gradient with common direction presets.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `direction` | [`LinearGradientDirection`](../interfaces/interface.LinearGradientDirection.md) | The gradient direction |
| `stops` | *readonly* [`GradientStop`](../interfaces/interface.GradientStop.md)[] | The color stops |

## Returns

[`LinearGradientColor`](../interfaces/interface.LinearGradientColor.md)

A linear gradient configuration

## Example

```ts
const gradient = createLinearGradient(
  GradientDirections.topToBottom,
  [
    { position: 0, color: '#003399' },
    { position: 1, color: '#3366AA' }
  ]
);
```
