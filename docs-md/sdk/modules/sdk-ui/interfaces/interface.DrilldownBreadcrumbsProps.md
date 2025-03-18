---
title: DrilldownBreadcrumbsProps
---

# Interface DrilldownBreadcrumbsProps

Props of the [DrilldownBreadcrumbs](../drilldown/function.DrilldownBreadcrumbs.md) component.

## Properties

### Widget

#### clearDrilldownSelections

> **clearDrilldownSelections**: () => `void`

Callback function that is evaluated when the close (X) button is clicked

##### Returns

`void`

***

#### currentDimension

> **currentDimension**: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)

Currently selected drilldown dimension

***

#### filtersDisplayValues

> **filtersDisplayValues**: `string`[][]

List of drilldown filters formatted to be displayed as breadcrumbs

***

#### sliceDrilldownSelections

> **sliceDrilldownSelections**: (`i`) => `void`

Callback function that is evaluated when a breadcrumb is clicked

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `i` | `number` |

##### Returns

`void`
