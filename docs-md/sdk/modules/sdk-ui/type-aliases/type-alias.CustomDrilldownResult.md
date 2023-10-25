---
title: CustomDrilldownResult
---

# Type alias CustomDrilldownResult

> **CustomDrilldownResult**: `object`

Result of custom drilldown execution

User provides selected points and desired category to drilldown to
and receives set of filters to apply and new category to display

## Type declaration

### `breadcrumbsComponent`

**breadcrumbsComponent**?: `JSX.Element`

Breadcrumbs that only allow for selection slicing, clearing, & navigation

***

### `drilldownDimension`

**drilldownDimension**: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)

New dimension that should replace the current dimension

***

### `drilldownFilters`

**drilldownFilters**: `MembersFilter`[]

The drilldown filters that should be applied to the next drilldown

***

### `onContextMenu`

**onContextMenu**: (`menuPosition`) => `void`

Callback to open context menu

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `menuPosition` | [`MenuPosition`](type-alias.MenuPosition.md) |

#### Returns

`void`

***

### `onDataPointsSelected`

**onDataPointsSelected**: [`DataPointsEventHandler`](type-alias.DataPointsEventHandler.md)

Callback to provide next points to drilldown to
