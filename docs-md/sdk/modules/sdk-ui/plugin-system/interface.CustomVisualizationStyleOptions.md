---
title: CustomVisualizationStyleOptions
---

# Interface CustomVisualizationStyleOptions <Badge type="beta" text="Beta" />

Defines style options for a custom visualization.

Extend this interface to add plugin-specific style properties passed via `styleOptions`.

## Example

```ts
interface MyWidgetStyleOptions extends CustomVisualizationStyleOptions {
  backgroundColor?: string;
  fontSize?: number;
}
```
