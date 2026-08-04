---
title: WidgetHeaderMenuConfig
---

# Interface WidgetHeaderMenuConfig

Configuration for the widget header menu — the menu opened from the "⋮" button in the widget
header.

## Properties

### enabled

> **enabled**?: `boolean`

Whether the header menu is enabled.

When `false`, the menu button is not rendered even if items are available. When enabled, the
menu button is rendered as soon as there is at least one item to show.

#### Default

```ts
true
```

***

### items

> **items**?: [`WidgetHeaderMenuItem`](../type-aliases/type-alias.WidgetHeaderMenuItem.md)[]

Custom items to add to the header menu, listed after the built-in ones.

Each item's `id` must be unique within the menu and must not match the id of a built-in item —
see [WidgetHeaderMenuTargets](../variables/variable.WidgetHeaderMenuTargets.md).

#### Example

Add a custom item to the widget header menu:
```ts
const widgetConfig: WidgetConfig = {
  header: {
    menu: {
      items: [
        {
          type: 'action',
          id: 'open-details',
          caption: 'Open details',
          onClick: () => openDetails(),
        },
      ],
    },
  },
};
```
