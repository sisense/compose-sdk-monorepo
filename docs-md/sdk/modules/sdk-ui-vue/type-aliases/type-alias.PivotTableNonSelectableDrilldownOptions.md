---
title: PivotTableNonSelectableDrilldownOptions
---

# Type alias PivotTableNonSelectableDrilldownOptions

> **PivotTableNonSelectableDrilldownOptions**: `object`

Configuration for the pivot table drilldown without initial target and selections

## Type declaration

### `drilldownPaths`

**drilldownPaths**?: ([`Attribute`](../../sdk-data/interfaces/interface.Attribute.md) \| [`Hierarchy`](../../sdk-ui/interfaces/interface.Hierarchy.md) \| [`HierarchyId`](../../sdk-ui/type-aliases/type-alias.HierarchyId.md))[]

Dimensions and hierarchies available for drilldown on

***

### `drilldownSelections`

**drilldownSelections**?: `never`

Current selections for multiple drilldowns

***

### `drilldownTarget`

**drilldownTarget**?: `never`

Current pivot table data option target for the drilldown
