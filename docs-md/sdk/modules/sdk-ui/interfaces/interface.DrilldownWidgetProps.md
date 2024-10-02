---
title: DrilldownWidgetProps
---

# Interface DrilldownWidgetProps

Props for the [DrilldownWidget](../drilldown/function.DrilldownWidget.md) component

## Properties

### Widget

#### children

> **children**: (`customDrilldownResult`) => `ReactNode`

React component to be rendered as context menu

[ContextMenu](../drilldown/function.ContextMenu.md) will be used if not provided

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `customDrilldownResult` | [`CustomDrilldownResult`](../type-aliases/type-alias.CustomDrilldownResult.md) |

##### Returns

`ReactNode`

***

#### config

> **config**?: [`DrilldownWidgetConfig`](../type-aliases/type-alias.DrilldownWidgetConfig.md)

An object that allows users to pass advanced configuration options as a prop for the `DrilldownWidget` component

***

#### drilldownDimensions

> **drilldownDimensions**?: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)[]

List of dimensions to allow drilldowns on

::: warning Deprecated
Use [DrilldownWidgetProps.drilldownPaths](interface.DrilldownWidgetProps.md#drilldownpaths) instead
:::

***

#### drilldownPaths

> **drilldownPaths**?: ([`Attribute`](../../sdk-data/interfaces/interface.Attribute.md) \| [`Hierarchy`](interface.Hierarchy.md))[]

Dimensions and hierarchies available for drilldown on.

***

#### initialDimension

> **initialDimension**: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)

Initial dimension to apply first set of filters to
