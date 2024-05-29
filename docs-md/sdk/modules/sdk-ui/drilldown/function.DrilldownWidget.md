---
title: DrilldownWidget
---

# Function DrilldownWidget

> **DrilldownWidget**(`props`): `null` \| `ReactElement`\< `any`, `any` \>

React component designed to add drilldown functionality to any type of chart.

This component acts as a wrapper around a given chart component, enhancing it with drilldown capabilities.

The widget offers several features including:
- A context menu for initiating drilldown actions (can be provided as a custom component)
- Breadcrumbs that not only allow for drilldown selection slicing but also
provide an option to clear the selection (can be provided as a custom component)
- Filters specifically created for drilldown operation
- An option to navigate to the next drilldown dimension

When an `initialDimension` is specified, the `drilldownDimension` will automatically inherit its
value, even before any points on the chart are selected.
This allows for complete control over the chart's dimensions to be handed over to the `DrilldownWidget`.

## Example

A column chart displaying total revenue by category from the Sample ECommerce data model. The chart can be drilled down by age range, gender, and condition.

<iframe
 src='https://csdk-playground.sisense.com/?example=use-cases%2Fdrilldown&mode=docs'
 width=800
 height=870
 style='border:none;'
/>

Additional drilldown examples:

- [Detached Breadcrumbs](https://www.sisense.com/platform/compose-sdk/playground/?example=use-cases%2Fdrilldown-detached-breadcrumbs)

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`DrilldownWidgetProps`](../interfaces/interface.DrilldownWidgetProps.md) | DrilldownWidget properties |

## Returns

`null` \| `ReactElement`\< `any`, `any` \>

DrilldownWidget wrapper component
