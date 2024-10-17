---
title: ThemeService
---

# Class ThemeService

Service for working with Sisense Fusion themes.

If no theme service is used, the current Fusion theme is applied by default.

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

### updateThemeSettings

> **updateThemeSettings**(`theme`): `Promise`\< `void` \>

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `theme` | [`ThemeSettings`](../interfaces/interface.ThemeSettings.md) \| `string` |

#### Returns

`Promise`\< `void` \>
