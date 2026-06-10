---
title: createRadialGradient
---

# Function createRadialGradient

> **createRadialGradient**(`center`, `stops`): [`RadialGradientColor`](../interfaces/interface.RadialGradientColor.md)

Helper function to create a radial gradient with common presets.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `center` | [`RadialGradientConfig`](../interfaces/interface.RadialGradientConfig.md) | The gradient center configuration |
| `stops` | *readonly* [`GradientStop`](../interfaces/interface.GradientStop.md)[] | The color stops |

## Returns

[`RadialGradientColor`](../interfaces/interface.RadialGradientColor.md)

A radial gradient configuration

## Example

```ts
const gradient = createRadialGradient(
  RadialGradientPresets.center,
  [
    { position: 0, color: '#ff0000' },
    { position: 1, color: '#0000ff' }
  ]
);
```
