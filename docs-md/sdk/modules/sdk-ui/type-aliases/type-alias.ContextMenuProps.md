---
title: ContextMenuProps
---

# Type alias ContextMenuProps

> **ContextMenuProps**: `object`

Props for [ContextMenu](../functions/function.ContextMenu.md) component.

## Type declaration

### `children`

**children**?: `React.ReactNode`

React nodes to be rendered at the bottom of the context menu

***

### `closeContextMenu`

**closeContextMenu**: () => `void`

Callback function that is evaluated when context menu is closed

#### Returns

`void`

***

### `itemSections`

**itemSections**?: [`MenuItemSection`](type-alias.MenuItemSection.md)[]

Sections of menu items

***

### `position`

**position**?: [`MenuPosition`](type-alias.MenuPosition.md) \| `null`

Position of the context menu
