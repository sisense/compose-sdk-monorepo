---
title: ContextMenuProps
---

# Interface ContextMenuProps

Props of the [ContextMenu](../drilldown/function.ContextMenu.md) component.

## Properties

### Widget

#### children

> **children**?: `ReactNode`

React nodes to be rendered at the bottom of the context menu

***

#### closeContextMenu

> **closeContextMenu**: () => `void`

Callback function that is evaluated when the context menu is closed

##### Returns

`void`

***

#### itemSections

> **itemSections**?: [`MenuItemSection`](../type-aliases/type-alias.MenuItemSection.md)[]

Menu item sections

***

#### position

> **position**?: [`MenuPosition`](../type-aliases/type-alias.MenuPosition.md) \| `null`

Context menu position
