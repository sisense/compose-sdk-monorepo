---
title: DrilldownWidgetConfig
---

# Type alias DrilldownWidgetConfig

> **DrilldownWidgetConfig**: `object`

An object that allows users to pass advanced configuration options as a prop for the [DrilldownWidget](../drilldown/function.DrilldownWidget.md) component

## Type declaration

### `breadcrumbsComponent`

**breadcrumbsComponent**?: `ComponentType`\< [`DrilldownBreadcrumbsProps`](../interfaces/interface.DrilldownBreadcrumbsProps.md) \>

React component to be rendered as breadcrumbs

[DrilldownBreadcrumbs](../drilldown/function.DrilldownBreadcrumbs.md) will be used if not provided

***

### `contextMenuComponent`

**contextMenuComponent**?: (`contextMenuProps`) => `JSX.Element`

Boolean to override default breadcrumbs location and instead only return them as a property of the 'children' function

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `contextMenuProps` | [`ContextMenuProps`](../interfaces/interface.ContextMenuProps.md) |

#### Returns

`JSX.Element`

***

### `isBreadcrumbsDetached`

**isBreadcrumbsDetached**?: `boolean`

Boolean to override default breadcrumbs location and instead only return them as a property of the 'children' function
