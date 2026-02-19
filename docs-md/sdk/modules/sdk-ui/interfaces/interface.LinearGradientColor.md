---
title: LinearGradientColor
---

# Interface LinearGradientColor

Linear gradient color configuration.

## Example

```ts
const linearGradient: LinearGradientColor = {
  type: 'linear',
  direction: { x1: 0, y1: 0, x2: 0, y2: 1 },
  stops: [
    { position: 0, color: '#003399' },
    { position: 0.5, color: '#ffffff' },
    { position: 1, color: '#3366AA' }
  ]
};
```

## Properties

### direction

> **direction**: [`LinearGradientDirection`](interface.LinearGradientDirection.md)

Direction of the linear gradient

***

### stops

> **stops**: *readonly* [`GradientStop`](interface.GradientStop.md)[]

Color stops along the gradient

***

### type

> **type**: `"linear"`

Type discriminator for linear gradients
