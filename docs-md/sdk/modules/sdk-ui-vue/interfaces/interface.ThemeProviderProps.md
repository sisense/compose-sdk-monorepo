---
title: ThemeProviderProps
---

# Interface ThemeProviderProps

Configurations for Theme.

Two options are supported:

(1) `ThemeSettings` -- Custom theme settings that override the default theme settings.

OR

(2) `ThemeOid` -- Theme identifier as defined in a Fusion instance (**Admin > App Configuration > Look and Feel**).
See [Customizing the Sisense User Interface](https://docs.sisense.com/main/SisenseLinux/customizing-the-sisense-user-interface.htm) for more details.

## Properties

### theme

> **theme**?: [`ThemeSettings`](interface.ThemeSettings.md) \| `string`

Theme for visual styling of the various components
