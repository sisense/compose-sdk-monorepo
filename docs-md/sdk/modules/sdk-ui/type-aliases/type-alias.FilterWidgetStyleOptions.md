---
title: FilterWidgetStyleOptions
---

# Type alias FilterWidgetStyleOptions <Badge type="beta" text="Beta" />

> **FilterWidgetStyleOptions**: [`WidgetContainerStyleOptions`](../interfaces/interface.WidgetContainerStyleOptions.md) & \{
  `control?`: [`FilterWidgetControlStyleOptions`](type-alias.FilterWidgetControlStyleOptions.md);
 }

Styling of a filter widget: the container, plus the filter control inside it.

## Example

```ts
<FilterWidget
  attribute={DM.Commerce.AgeRange}
  styleOptions={{ backgroundColor: '#F4F4F8', control: { size: 'l', cornerRadius: 'm' } }}
/>
```

> ## `FilterWidgetStyleOptions.control`
>
> **control**?: [`FilterWidgetControlStyleOptions`](type-alias.FilterWidgetControlStyleOptions.md)
>
> Styling of the filter control.
>
>
