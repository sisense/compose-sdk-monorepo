---
title: WidgetHeaderMenuItem
---

# Type alias WidgetHeaderMenuItem

> **WidgetHeaderMenuItem**: [`WidgetHeaderMenuActionItem`](../interfaces/interface.WidgetHeaderMenuActionItem.md) \| [`WidgetHeaderMenuSubmenuItem`](../interfaces/interface.WidgetHeaderMenuSubmenuItem.md)

A single item in the widget header menu, discriminated by its `type`.

Items are contributed through [WidgetHeaderMenuConfig.items](../interfaces/interface.WidgetHeaderMenuConfig.md#items) and are rendered after the
built-in items the widget adds itself (for example "Download" or "Rename widget").
