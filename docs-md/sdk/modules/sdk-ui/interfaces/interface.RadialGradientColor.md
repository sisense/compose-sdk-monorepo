---
title: RadialGradientColor
---

# Interface RadialGradientColor

Radial gradient color configuration.

## Example

```ts
const radialGradient: RadialGradientColor = {
  type: 'radial',
  center: { centerX: 0.5, centerY: 0.5, radius: 0.8 },
  stops: [
    { position: 0, color: '#ff0000' },
    { position: 1, color: '#0000ff' }
  ]
};
```

## Properties

### center

> **center**: [`RadialGradientConfig`](interface.RadialGradientConfig.md)

Center and radius configuration

***

### stops

> **stops**: *readonly* [`GradientStop`](interface.GradientStop.md)[]

Color stops along the gradient

***

### type

> **type**: `"radial"`

Type discriminator for radial gradients
