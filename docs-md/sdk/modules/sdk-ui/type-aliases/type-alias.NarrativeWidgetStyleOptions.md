---
title: NarrativeWidgetStyleOptions
---

# Type alias NarrativeWidgetStyleOptions <Badge type="beta" text="Beta" />

> **NarrativeWidgetStyleOptions**: [`WidgetContainerStyleOptions`](../interfaces/interface.WidgetContainerStyleOptions.md) & \{
  `isAutoHeight?`: `boolean`;
 }

Style options of the dashboard narrative widget: its container and header, and whether its height
follows the content.

> ## `NarrativeWidgetStyleOptions.isAutoHeight`
>
> **isAutoHeight**?: `boolean`
>
> Sizes the widget to its content — no scrolling, no empty space — instead of the size its
> container gives it. Inside a dashboard it applies to a row whose widgets all have it on.
>
> ### Default
>
> ```ts
> false
> ```
>
>
