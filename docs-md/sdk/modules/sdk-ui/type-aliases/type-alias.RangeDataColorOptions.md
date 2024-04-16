---
title: RangeDataColorOptions
---

# Type alias RangeDataColorOptions

> **RangeDataColorOptions**: `object`

Range color options for data similar to the Range option in the Sisense UI.

Use `minColor` and `maxColor` to define the start and end color of the range.
A color name (for example, `red`), or a hexadecimal value (for example, `#ff0000`) can be specified.

By default, the color range is set to match the minimum and maximum values of the data.
You can also override the default value range by
setting the `minValue`, `midValue`, and `maxValue` properties.

## Example

An example of specifying colors for data values ranging
from red (for min value) to blue (for max value)
with 2 more colors in between for a total of 4 colors:

```ts
{
  type: 'range',
  steps: 4,
  minColor: 'red',
  maxColor: 'blue',
}
```

## Type declaration

### `maxColor`

**maxColor**?: `string`

End color of the range

***

### `maxValue`

**maxValue**?: `number`

Maximum value explicitly set to override the maximum value of the data

***

### `midValue`

**midValue**?: `number`

Middle value explicitly set to override the middle value of the data

***

### `minColor`

**minColor**?: `string`

Start color of the range

***

### `minValue`

**minValue**?: `number`

Minimum value explicitly set to override the minimum value of the data

***

### `steps`

**steps**?: `number`

Distinct number of colors in the range

***

### `type`

**type**: `"range"`

Color options type
