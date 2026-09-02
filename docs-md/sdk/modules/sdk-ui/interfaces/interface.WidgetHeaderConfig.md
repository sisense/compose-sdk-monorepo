---
title: WidgetHeaderConfig
---

# Interface WidgetHeaderConfig

Configuration for the widget header.

## Properties

### items

> **items**?: [`WidgetHeaderItem`](interface.WidgetHeaderItem.md)[]

Custom items to inject into the header row.

Each item's `id` must be unique and must not match a built-in item id (see
[WidgetHeaderTargets](../variables/variable.WidgetHeaderTargets.md)). Items can only be added here — to modify, reorder or remove
built-in items use [WidgetHeaderConfig.onBeforeRender](interface.WidgetHeaderConfig.md#onbeforerender).

#### Example

Add a custom button to the widget header, right before the "⋮" menu button:
```ts
const widgetConfig: ChartWidgetConfig = {
  header: {
    items: [
      {
        id: 'refresh',
        position: { type: 'before', target: WidgetHeaderTargets.Menu },
        size: { width: 28 },
        component: () => <RefreshButton />,
      },
    ],
  },
};
```

***

### menu

> **menu**?: [`WidgetHeaderMenuConfig`](interface.WidgetHeaderMenuConfig.md)

Configuration for the widget header menu.

***

### onBeforeRender

> **onBeforeRender**?: [`WidgetHeaderItemsTransform`](../type-aliases/type-alias.WidgetHeaderItemsTransform.md)

Advanced callback to inspect and rewrite the full, ordered list of header items (built-in +
custom) right before rendering. The only way to modify or remove built-in items.

#### Example

Hide the built-in info button:
```ts
const widgetConfig: ChartWidgetConfig = {
  header: {
    onBeforeRender: (items) =>
      items.filter((item) => item.id !== WidgetHeaderTargets.InfoButton),
  },
};
```
