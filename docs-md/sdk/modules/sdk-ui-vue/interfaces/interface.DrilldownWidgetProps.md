---
title: DrilldownWidgetProps
---

# Interface DrilldownWidgetProps

Props of the [`DrilldownWidget`](../drilldown/class.DrilldownWidget.md) component.

## Properties

### Widget

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

> **drilldownPaths**?: ([`Attribute`](../../sdk-data/interfaces/interface.Attribute.md) \| [`Hierarchy`](../../sdk-ui/interfaces/interface.Hierarchy.md))[]

Dimensions and hierarchies available for drilldown on.

***

#### initialDimension

> **initialDimension**: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)

Initial dimension to apply first set of filters to
