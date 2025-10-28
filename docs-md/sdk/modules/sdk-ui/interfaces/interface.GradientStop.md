---
title: GradientStop
---

# Interface GradientStop

A gradient stop defining a color at a specific position in the gradient.

## Example

```ts
const stop: GradientStop = {
  position: 0.5,
  color: '#ffffff'
};
```

## Properties

### color

> **color**: `string`

Color at this position. Can be any valid CSS color value.

***

### position

> **position**: `number`

Position in the gradient where 0 is the start and 1 is the end.
Must be between 0 and 1 inclusive.
