---
title: DrilldownBreadcrumbsProps
---

# Interface DrilldownBreadcrumbsProps

Props of the [DrilldownBreadcrumbsComponent](../drilldown/class.DrilldownBreadcrumbsComponent.md).

## Properties

### Widget

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

### Other

#### drilldownSelectionsClear

> **drilldownSelectionsClear**?: () => `void`

##### Returns

`void`

***

#### drilldownSelectionsSlice

> **drilldownSelectionsSlice**?: (`event`) => `void`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `event` | `object` |
| `event.i` | `number` |

##### Returns

`void`
