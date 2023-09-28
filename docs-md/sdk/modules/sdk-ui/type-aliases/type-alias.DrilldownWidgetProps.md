---
title: DrilldownWidgetProps
---

# Type alias DrilldownWidgetProps

> **DrilldownWidgetProps**: `object`

Props for the [DrilldownWidget](../functions/function.DrilldownWidget.md) component

## Type declaration

### `breadcrumbsComponent`

**breadcrumbsComponent**?: (`drilldownBreadcrumbProps`) => `JSX.Element`

React component to be rendered as breadcrumbs

[DrilldownBreadcrumbs](../functions/function.DrilldownBreadcrumbs.md) will be used if not provided

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `drilldownBreadcrumbProps` | [`DrilldownBreadcrumbsProps`](type-alias.DrilldownBreadcrumbsProps.md) |

#### Returns

`JSX.Element`

***

### `children`

**children**: (`customDrilldownResult`) => `ReactNode`

A function that allows to pass calculated drilldown filters
and new dimension to a ReactNode to be rendered (custom chart)

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `customDrilldownResult` | [`CustomDrilldownResult`](type-alias.CustomDrilldownResult.md) |

#### Returns

`ReactNode`

***

### `contextMenuComponent`

**contextMenuComponent**?: (`contextMenuProps`) => `JSX.Element`

React component to be rendered as context menu

[ContextMenu](../functions/function.ContextMenu.md) will be used if not provided

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `contextMenuProps` | [`ContextMenuProps`](type-alias.ContextMenuProps.md) |

#### Returns

`JSX.Element`

***

### `drilldownDimensions`

**drilldownDimensions**: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)[]

List of dimensions to allow drilldowns on

***

### `initialDimension`

**initialDimension**: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)

Initial dimension to apply first set of filters to
