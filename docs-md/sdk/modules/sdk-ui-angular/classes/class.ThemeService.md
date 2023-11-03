---
title: ThemeService
---

# Class ThemeService

## Constructors

### constructor

> **new ThemeService**(`sisenseContextService`, `themeConfig`?): [`ThemeService`](class.ThemeService.md)

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](class.SisenseContextService.md) |
| `themeConfig`? | [`ThemeConfig`](../type-aliases/type-alias.ThemeConfig.md) |

#### Returns

[`ThemeService`](class.ThemeService.md)

## Methods

### getThemeSettings

> **getThemeSettings**(): `Observable`\< \{
  `chart`: `{ textColor: string; secondaryTextColor: string; backgroundColor: string; panelBackgroundColor: string; }`;
  `general`: `{ brandColor: string; backgroundColor: string; primaryButtonTextColor: string; primaryButtonHoverColor: string; }`;
  `palette`: `{ variantColors: Color[]; }`;
  `typography`: `{ fontFamily: string; primaryTextColor: string; secondaryTextColor: string; }`;
 } \>

#### Returns

`Observable`\< \{
  `chart`: `{ textColor: string; secondaryTextColor: string; backgroundColor: string; panelBackgroundColor: string; }`;
  `general`: `{ brandColor: string; backgroundColor: string; primaryButtonTextColor: string; primaryButtonHoverColor: string; }`;
  `palette`: `{ variantColors: Color[]; }`;
  `typography`: `{ fontFamily: string; primaryTextColor: string; secondaryTextColor: string; }`;
 } \>

***

### updateThemeSettings

> **updateThemeSettings**(`theme`): `Promise`\< `void` \>

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `theme` | `string` \| [`ThemeSettings`](../../sdk-ui/interfaces/interface.ThemeSettings.md) |

#### Returns

`Promise`\< `void` \>
