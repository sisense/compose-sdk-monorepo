---
title: useTheme
---

# Function useTheme

> **useTheme**(): [`CompleteThemeSettings`](../type-aliases/type-alias.CompleteThemeSettings.md)

Returns the resolved theme from the nearest [ThemeProvider](function.ThemeProvider.md).
Falls back to the default theme when no provider is present.

## Returns

[`CompleteThemeSettings`](../type-aliases/type-alias.CompleteThemeSettings.md)

Resolved [CompleteThemeSettings](../type-aliases/type-alias.CompleteThemeSettings.md)

## Example

```ts
const { palette, typography, widget } = useTheme();
```
