---
title: GradientColor
---

# Type alias GradientColor

> **GradientColor**: [`LinearGradientColor`](../interfaces/interface.LinearGradientColor.md) \| [`RadialGradientColor`](../interfaces/interface.RadialGradientColor.md)

Enhanced gradient color options that provide better type safety and developer experience.

This is a discriminated union that allows for either linear or radial gradients,
with comprehensive type checking and better IntelliSense support.

## Example

```ts
// Linear gradient example
const linearGradient: GradientColor = {
  type: 'linear',
  direction: { x1: 0, y1: 0, x2: 0, y2: 1 },
  stops: [
    { position: 0, color: '#003399' },
    { position: 0.5, color: '#ffffff' },
    { position: 1, color: '#3366AA' }
  ]
};

// Radial gradient example
const radialGradient: GradientColor = {
  type: 'radial',
  center: { centerX: 0.5, centerY: 0.5, radius: 0.8 },
  stops: [
    { position: 0, color: '#ff0000' },
    { position: 1, color: '#0000ff' }
  ]
};
```
