---
title: FilterWidgetControlStyleOptions
---

# Type alias FilterWidgetControlStyleOptions <Badge type="beta" text="Beta" />

> **FilterWidgetControlStyleOptions**: `object`

Styling of the filter control itself — the field the user picks values in — as opposed to
the widget container around it.

Omitted properties fall back to the dashboard theme, and then to the SDK defaults
(`size` and `cornerRadius` `'s'`, left/middle alignment, standard light palette).

## Example

```ts
<FilterWidget
  attribute={DM.Commerce.AgeRange}
  styleOptions={{
    control: {
      primaryText: '#131F29',
      background: '#FFFFFF',
      accentColor: '#94F5F0',
      size: 'l',
      cornerRadius: 'm',
    },
  }}
/>
```

## Type declaration

### `accentColor`

**accentColor**?: `string`

Brand / accent for the control's primary action — the date panel's Apply button — and
for any selection highlight the design fills with the brand color.

***

### `alignHorizontal`

**alignHorizontal**?: [`FilterWidgetControlAlignHorizontal`](type-alias.FilterWidgetControlAlignHorizontal.md)

#### Default Value

```ts
'left'
```

***

### `alignVertical`

**alignVertical**?: [`FilterWidgetControlAlignVertical`](type-alias.FilterWidgetControlAlignVertical.md)

#### Default Value

```ts
'middle'
```

***

### `background`

**background**?: `string`

Fill of the control and of the open list.

***

### `borderColor`

**borderColor**?: `string`

Border color of the control, when `borderEnabled` is true.

***

### `borderEnabled`

**borderEnabled**?: `boolean`

When false, the control has no border. The open list has no border either way.

***

### `cornerRadius`

**cornerRadius**?: [`FilterWidgetControlCornerRadius`](type-alias.FilterWidgetControlCornerRadius.md)

Corner roundness of the control and of the open list.

#### Default Value

```ts
's' (4px)
```

***

### `primaryText`

**primaryText**?: `string`

Selected value, chevron, and option text in the open list.

***

### `secondaryText`

**secondaryText**?: `string`

Placeholder, search icon, `+N`, disabled and empty copy.

***

### `size`

**size**?: [`FilterWidgetControlSize`](type-alias.FilterWidgetControlSize.md)

Height of the control. Rows in the open list stay 30px.

#### Default Value

```ts
's' (28px)
```
