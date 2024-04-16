---
title: UniformDataColorOptions
---

# Type alias UniformDataColorOptions

> **UniformDataColorOptions**: `object`

Uniform color options for data similar to the Single Color option in the Sisense UI.

## Example

An example of specifying red as a uniform color for all data values.

```ts
{
  type: 'uniform',
  color: 'red',
}
```

## Type declaration

### `color`

**color**: `string`

Color name, e.g., `red`, or a hexadecimal value, e.g., `#ff0000`.

***

### `type`

**type**: `"uniform"`

Color options type
