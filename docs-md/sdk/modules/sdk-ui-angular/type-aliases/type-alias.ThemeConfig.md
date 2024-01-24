---
title: ThemeConfig
---

# Type alias ThemeConfig

> **ThemeConfig**: `PropsWithChildren`\< \{
  `theme`: [`ThemeOid`](type-alias.ThemeOid.md) \| [`ThemeSettings`](../interfaces/interface.ThemeSettings.md);
 } \>

Configurations for Theme.

Two options are supported:

(1) `ThemeOid` -- Theme identifier as defined in the Sisense application (`Admin page` > `Look and Feel`).
See [Sisense documentation](https://docs.sisense.com/main/SisenseLinux/customizing-the-sisense-user-interface.htm)
for more details.

OR

(2) `ThemeSettings` -- Custom theme settings that override the default theme settings.
