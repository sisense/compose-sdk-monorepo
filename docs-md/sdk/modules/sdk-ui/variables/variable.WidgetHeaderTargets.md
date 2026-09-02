---
title: WidgetHeaderTargets
---

# Variable WidgetHeaderTargets

> **`const`** **WidgetHeaderTargets**: `object`

Ids of the built-in widget header items, in the order they appear in the header row.

Use these as `target`s for the `before`/`after` position of a [WidgetHeaderItem](../interfaces/interface.WidgetHeaderItem.md).
A target stays valid even when its item is not currently shown (e.g. the menu button when the
widget has no menu items, or a spacer that currently takes no width): the position resolves as if
the built-in were there, so a custom item lands in a stable spot regardless of which built-ins
happen to be visible.

## Type declaration

### `ClearSelectionButton`

**`readonly`** **ClearSelectionButton**: `"widget-header-clear-selection-button"` = `'widget-header-clear-selection-button'`

The "clear selection" button, shown while the widget has a common-filter selection to clear.

***

### `DragIcon`

**`readonly`** **DragIcon**: `"widget-header-drag-icon"` = `'widget-header-drag-icon'`

The drag-handle icon, shown at the far left while the widget can be dragged (a dashboard in
edit mode). It is the widget's primary drag affordance.

***

### `InfoButton`

**`readonly`** **InfoButton**: `"widget-header-info-button"` = `'widget-header-info-button'`

The info ("i") button, which opens the widget's dataset/description popover.

***

### `JtdIcon`

**`readonly`** **JtdIcon**: `"widget-header-jtd-icon"` = `'widget-header-jtd-icon'`

The “Jump to Dashboard” icon, shown to the left of the title when the widget has a JTD target.

***

### `Menu`

**`readonly`** **Menu**: `"widget-header-menu"` = `'widget-header-menu'`

The header menu ("⋮") button. Not shown while the menu has no items.

***

### `NarrativeToggle`

**`readonly`** **NarrativeToggle**: `"widget-header-narrative-toggle"` = `'widget-header-narrative-toggle'`

The narrative ("sparkle") button, which shows or hides the widget's generated narrative.

***

### `Spacer`

**`readonly`** **Spacer**: `"widget-header-spacer"` = `'widget-header-spacer'`

The trailing spacer, between the title and the action items — the anchor that
`{ type: 'auto' }` items are placed after. Grows unless the title is right-aligned.

***

### `Title`

**`readonly`** **Title**: `"widget-header-title"` = `'widget-header-title'`

The widget title. Takes its content width and ellipsizes when the header is too narrow.

***

### `TitleAlignmentSpacer`

**`readonly`** **TitleAlignmentSpacer**: `"widget-header-title-alignment-spacer"` = `'widget-header-title-alignment-spacer'`

The leading spacer, before the title.

Together with WidgetHeaderTargets.Spacer it positions the title: it takes no width when
the title is left-aligned, grows when the title is right-aligned, and shares the free width with
the trailing spacer when the title is centered.
