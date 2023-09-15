---
title: ThemeProviderProps
---

# Type alias ThemeProviderProps

> **ThemeProviderProps**: `PropsWithChildren`\< \{
  `theme`: [`ThemeOid`](type-alias.ThemeOid.md) \| [`ThemeSettings`](../interfaces/interface.ThemeSettings.md);
 } \>

Props for [ThemeProvider](../functions/function.ThemeProvider.md) component.

Two options are supported:

(1) `ThemeOid` -- Theme identifier as defined in the Sisense application (`Admin page` > `Look and Feel`).
See [Sisense documentation](https://docs.sisense.com/main/SisenseLinux/customizing-the-sisense-user-interface.htm)
for more details.

OR

(2) `ThemeSettings` -- Custom theme settings that override the default theme settings.
