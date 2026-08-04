---
title: DashboardHeaderConfig
---

# Interface DashboardHeaderConfig

Configuration for the dashboard header.

Injects custom [items](interface.DashboardHeaderItem.md) into the header and, via
[`onBeforeRender`](interface.DashboardHeaderConfig.md#onbeforerender), reorders or removes the
built-in items (referenced by [DashboardHeaderTargets](../variables/variable.DashboardHeaderTargets.md)).

## Example

Add a custom item after the title and hide the built-in title:
```ts
import { DashboardHeaderTargets, type DashboardConfig } from '@sisense/sdk-ui-vue';
import ExportButton from './export-button.vue';

const config: DashboardConfig = {
  header: {
    items: [
      {
        id: 'export',
        component: ExportButton,
        position: { type: 'after', target: DashboardHeaderTargets.Title },
      },
    ],
    onBeforeRender: (items) => items.filter((item) => item.id !== DashboardHeaderTargets.Title),
  },
};
```

## Properties

### items

> **items**?: [`DashboardHeaderItem`](interface.DashboardHeaderItem.md)[]

Custom items to inject into the header.

Each item's `id` must not match a built-in item id (see [DashboardHeaderTargets](../../sdk-ui/variables/variable.DashboardHeaderTargets.md)).

***

### onBeforeRender

> **onBeforeRender**?: [`DashboardHeaderItemsTransform`](../type-aliases/type-alias.DashboardHeaderItemsTransform.md)

Advanced callback to inspect and rewrite the full, ordered list of header items (built-in +
custom) right before rendering. The only way to modify or remove built-in items.

***

### visible

> **visible**?: `boolean`

Boolean flag that determines whether the dashboard header is visible.

If not specified, the default value is `true`.
