---
title: DrilldownWidget
---

# Function DrilldownWidget

> **DrilldownWidget**(`props`): `Element`

React component designed to add drilldown functionality to any type of chart

It acts as a wrapper around a given chart component, enhancing it with drilldown capabilities

The widget offers several features including:
- A context menu for initiating drilldown actions (can be provided as a custom component)
- Breadcrumbs that not only allow for drilldown selection slicing but also
provide an option to clear the selection (can be provided as a custom component)
- Filters specifically created for drilldown operation
- An option to navigate to the next drilldown dimension

When an `initialDimension` is specified, the `drilldownDimension` will automatically inherit its value,
even before any points on the chart are selected.
This allows for complete control over the chart's dimensions to be handed over to the DrilldownWidget

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`DrilldownWidgetProps`](../interfaces/interface.DrilldownWidgetProps.md) | DrilldownWidget properties |

## Returns

`Element`

DrilldownWidget wrapper component

## Example

Example of using the `DrilldownWidget` component to
plot a custom React component that uses the `ExecuteQuery` component to
query the `Sample ECommerce` data source hosted in a Sisense instance.
```ts
<DrilldownWidget
  drilldownDimensions={[DM.Commerce.AgeRange, DM.Commerce.Gender, DM.Commerce.Condition]}
  initialDimension={DM.Category.Category}
>
  {({ drilldownFilters, drilldownDimension, onDataPointsSelected, onContextMenu }) => (
    <ExecuteQuery
      dataSource={DM.DataSource}
      dimensions={[drilldownDimension]}
      measures={measure.sum(DM.Commerce.Revenue)}
      filters={drilldownFilters}
    >
      {(data) => (
        <MyCustomChart
          rawData={data}
          onContextMenu={onContextMenu}
          onDataPointsSelected={onDataPointsSelected}
        />
      )}
    </ExecuteQuery>
  )}
</DrilldownWidget>
```
