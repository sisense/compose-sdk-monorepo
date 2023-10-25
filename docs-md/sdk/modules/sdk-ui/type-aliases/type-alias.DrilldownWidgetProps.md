---
title: DrilldownWidgetProps
---

# Type alias DrilldownWidgetProps

> **DrilldownWidgetProps**: `object`

Props for the [DrilldownWidget](../functions/function.DrilldownWidget.md) component

## Type declaration

### `children`

**children**: (`customDrilldownResult`) => `ReactNode`

React component to be rendered as context menu

[ContextMenu](../functions/function.ContextMenu.md) will be used if not provided

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `customDrilldownResult` | [`CustomDrilldownResult`](type-alias.CustomDrilldownResult.md) |

#### Returns

`ReactNode`

***

### `config`

**config**?: [`DrilldownWidgetConfig`](type-alias.DrilldownWidgetConfig.md)

An object that allows users to pass advanced configuration options as a prop for the [DrilldownWidget](../functions/function.DrilldownWidget.md) component

***

### `drilldownDimensions`

**drilldownDimensions**: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)[]

List of dimensions to allow drilldowns on

***

### `initialDimension`

**initialDimension**: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)

Initial dimension to apply first set of filters to
