---
title: ContextMenuComponent
---

# Class ContextMenuComponent

Context Menu Component

## Implements

- `AfterViewInit`
- `OnChanges`
- `OnDestroy`

## Constructors

### constructor

> **new ContextMenuComponent**(`sisenseContextService`, `themeService`): [`ContextMenuComponent`](class.ContextMenuComponent.md)

Constructor for the `ContextMenuComponent`.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](../contexts/class.SisenseContextService.md) | Sisense context service |
| `themeService` | [`ThemeService`](../contexts/class.ThemeService.md) | Theme service |

#### Returns

[`ContextMenuComponent`](class.ContextMenuComponent.md)

## Properties

### Constructor

#### sisenseContextService

> **sisenseContextService**: [`SisenseContextService`](../contexts/class.SisenseContextService.md)

Sisense context service

***

#### themeService

> **themeService**: [`ThemeService`](../contexts/class.ThemeService.md)

Theme service

### Other

#### contextMenuClose

> **contextMenuClose**: `EventEmitter`\< `ArgumentsAsObject`\< () => `void`, [] \> \>

Callback function that is evaluated when the context menu is closed

***

#### itemSections

> **itemSections**: [`MenuItemSection`](../type-aliases/type-alias.MenuItemSection.md)[] \| `undefined`

Menu item sections

***

#### position

> **position**: [`MenuPosition`](../type-aliases/type-alias.MenuPosition.md) \| `null` \| `undefined`

Context menu position
